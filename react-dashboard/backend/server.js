const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { KafkaClient, Consumer } = require('kafka-node');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your frontend
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true // This may be necessary if you're using cookies or sessions
    }
});

// Enable CORS for all routes
app.use(cors());

const kafkaClient = new KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new Consumer(
    kafkaClient,
    [{ topic: 'cricket_match_topic', partition: 0 }],
    { autoCommit: true }
);

consumer.on('message', (message) => {
    const matchData = JSON.parse(message.value);
    console.log('Received match data from Kafka:', matchData);
    io.emit('match-update', matchData);
});

consumer.on('error', (err) => {
    console.error('Error:', err);
});

server.listen(4000, () => {
    console.log('Server is listening on port 4000');
});

# Live Cricket Match Simulation

This project is a real-time cricket match simulation system that combines a Kafka-based data producer, a Node.js server, and a React frontend for live updates and visualization.

## Features

### Real-Time Data Streaming
- Simulates live cricket match data and streams it to Kafka.
- Consumes Kafka messages and broadcasts them via WebSockets.

### Data Visualization
- Displays batting and bowling statistics with D3.js visualizations.

### Interactive UI
- Allows users to switch between innings and view match progress dynamically.

## Technologies Used

### Backend
- Node.js
- Express.js
- Kafka (via `kafka-node`)
- Socket.io

### Frontend
- React.js
- D3.js
- React Router

### Other Tools
- Kafka (Apache Kafka for message streaming)
- Docker (optional, for containerized Kafka setup)

## Prerequisites

1. **Install Node.js**: Make sure you have Node.js installed (v14 or higher recommended).
2. **Install Kafka**: Set up Kafka and ensure it is running locally or in a container.
3. **Frontend Setup**: Ensure React dependencies are installed.
4. **Backend Dependencies**: Install required Node.js packages.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```
### 2. Install Dependencies
#### Backend:
```bash
cd backend
npm install
```
#### Frontend:

```bash
cd frontend
npm install
```

### 3. Kafka Setup

1. Start a Kafka instance:

Use Docker or a manual setup to start Kafka.
Ensure Kafka is running on localhost:9092.
2. Create the cricket_match_topic topic in Kafka:
```bash
kafka-topics --create --topic cricket_match_topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```
## Running the Project

### 1. Up the docker container (Match Simulator)
```bash
docker compose up -d
```

### 2. Start the Kafka Producer (Match Simulator)

1. Navigate to the match-simulator directory:
2. Run the simulator:
```bash
python generator.py
```

### 3. Start the Backend Server
1. Navigate to the backend directory:
```bash
cd backend
```

2. Start the server:
```bash
node server.js
```
### 4. Start the Frontend
1. Navigate to the frontend directory:

2. Start the React app:
```bash
npm start
```

## Project Structure
```bash
|-- react-dashboard/
|   |-- backend/
|   |   |-- server.js       # Node.js server handling WebSockets and Kafka consumer
|   |   |-- package.json    # Backend dependencies
|
|
|-- src/
|   |-- data/
|   |-- App.js       # Main React app entry
|   |-- components/  # React components (Scoreboard, Graphs, etc.)
|   |-- package.json     # Frontend dependencies
|
|
|-- generator.py  # Match simulation code
|
|-- data/
|   |-- ipl_matches_2024_with_coordinates.csv  # Match data
```

## Notes
Ensure Kafka is properly configured and running before starting the simulator and backend server.
Modify configurations (e.g., Kafka broker URLs) in the source code if required.
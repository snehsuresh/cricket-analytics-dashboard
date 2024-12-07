import React from 'react';

function TossPage() {
    return (
        <iframe
            src="/toss/index.html"
            title="Toss"
            style={{
                width: '100%',
                height: '120vh',
                border: 'none'
            }}
        />
    );
}

export default TossPage;
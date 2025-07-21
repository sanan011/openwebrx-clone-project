import React from 'react';
import { Card } from 'react-bootstrap';

function About({ theme }) {
  const cardBg = theme === 'light' ? 'white' : 'dark'; // Use 'dark' for card background in dark mode
  const cardText = theme === 'light' ? 'dark' : 'white';

  return (
    <Card id="about" className={`shadow-sm mb-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
      <Card.Body>
        <h2 className="h2 fw-bold mb-4">About Us</h2>
        <p>
          OpenWebRX is a free and open-source web-based software-defined radio (SDR) receiver. It allows multiple users to listen to and control a single SDR receiver simultaneously over the internet.
          This project aims to provide a similar experience with a focus on accessibility and ease of use.
        </p>
        <p className="mt-3">
          Our mission is to democratize access to radio signals, enabling enthusiasts, educators, and researchers worldwide to explore the electromagnetic spectrum.
        </p>
      </Card.Body>
    </Card>
  );
}

export default About;

import React from 'react';
import { Card, Button } from 'react-bootstrap';

function Home({ theme, onNavClick }) {
  const cardBg = theme === 'light' ? 'white' : 'dark'; // Use 'dark' for card background in dark mode
  const cardText = theme === 'light' ? 'dark' : 'white';

  return (
    <Card id="home" className={`shadow-sm mb-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
      <Card.Body>
        <h1 className="display-4 fw-bold mb-4">Welcome to OpenWebRX Project!</h1>
        <p className="lead mb-4">
          This is a template for an OpenWebRX-like project. It provides a web-based software-defined radio (SDR) receiver, allowing you to listen to various radio signals directly in your browser.
          Explore the features, connect with the community, and dive into the world of radio communication.
        </p>

        <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
          <Button variant="success" onClick={() => onNavClick('documentation')} className="btn-lg fw-semibold shadow-sm hover-btn-scale">
            Get Started
          </Button>
          <Button variant="primary" onClick={() => onNavClick('about')} className="btn-lg fw-semibold shadow-sm hover-btn-scale">
            Learn More
          </Button>
        </div>
      </Card.Body>
      <style>{`
        .hover-btn-scale {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-btn-scale:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25) !important;
        }
      `}</style>
    </Card>
  );
}

export default Home;

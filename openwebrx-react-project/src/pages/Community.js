import React from 'react';
import { Card, Button } from 'react-bootstrap';

function Community({ theme }) {
  const cardBg = theme === 'light' ? 'white' : 'dark'; // Use 'dark' for card background in dark mode
  const cardText = theme === 'light' ? 'dark' : 'white';

  return (
    <Card id="community" className={`shadow-sm mb-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
      <Card.Body>
        <h2 className="h2 fw-bold mb-4">Community</h2>
        <p>
          Join our vibrant community! Connect with other radio enthusiasts, share your experiences, and get support from fellow users and developers.
        </p>
        <div className="d-flex gap-3 mt-4">
          <Button variant="info" href="#" className="shadow-sm hover-btn-scale">Forum</Button>
          <Button variant="danger" href="#" className="shadow-sm hover-btn-scale">Discord</Button>
          <Button variant="primary" href="#" className="shadow-sm hover-btn-scale">GitHub</Button>
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

export default Community;

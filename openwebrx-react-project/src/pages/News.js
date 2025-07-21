import React from 'react';
import { Card } from 'react-bootstrap';

function News({ theme }) {
  const cardBg = theme === 'light' ? 'white' : 'dark'; // Use 'dark' for card background in dark mode
  const cardText = theme === 'light' ? 'dark' : 'white';
  const mutedText = theme === 'light' ? 'text-muted' : 'text-light'; // For small, muted text

  return (
    <Card id="news" className={`shadow-sm mb-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
      <Card.Body>
        <h2 className="h2 fw-bold mb-4">Latest News</h2>
        <div className="d-grid gap-4">
          <div className="border-bottom pb-3">
            <h3 className="h5 fw-semibold">Project Template Launched!</h3>
            <p className={`${mutedText} small`}>July 18, 2025</p> {/* Apply mutedText class */}
            <p className="mt-2">
              We are excited to announce the launch of our OpenWebRX-like project frontend template. This initial release provides a solid foundation for future development.
            </p>
          </div>
          <div className="border-bottom pb-3">
            <h3 className="h5 fw-semibold">Upcoming Features</h3>
            <p className={`${mutedText} small`}>July 10, 2025</p> {/* Apply mutedText class */}
            <p className="mt-2">
              Stay tuned for updates on new features, including advanced signal processing, user authentication, and more receiver integrations.
            </p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default News;

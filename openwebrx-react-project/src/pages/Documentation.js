import React from 'react';
import { Card } from 'react-bootstrap';

function Documentation({ theme }) {
  const cardBg = theme === 'light' ? 'white' : 'dark'; // Use 'dark' for card background in dark mode
  const cardText = theme === 'light' ? 'dark' : 'white';
  const linkColor = theme === 'light' ? 'text-primary' : 'text-info'; // Use info for links in dark mode

  return (
    <Card id="documentation" className={`shadow-sm mb-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
      <Card.Body>
        <h2 className="h2 fw-bold mb-4">Documentation</h2>
        <p>
          Our comprehensive documentation provides guides and tutorials for setting up your own receiver, understanding radio concepts, and contributing to the project.
        </p>
        <ul className="list-unstyled mt-4">
          <li><a href="#" onClick={(e) => e.preventDefault()} className={`${linkColor} text-decoration-none hover-underline`}>Getting Started Guide</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()} className={`${linkColor} text-decoration-none hover-underline`}>API Reference</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()} className={`${linkColor} text-decoration-none hover-underline`}>Troubleshooting</a></li>
        </ul>
      </Card.Body>
    </Card>
  );
}

export default Documentation;

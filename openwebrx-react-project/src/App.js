import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Navbar, Nav, Container, Button, Card } from 'react-bootstrap'; // Import Bootstrap components
import ReceiverbookContent from './ReceiverbookContent'; // Import the new component

// Main App component
function App() {
  // State to manage the current theme: 'light' or 'dark'
  const [theme, setTheme] = useState('dark'); // Default to dark mode as per original OpenWebRX look

  // Effect to apply the data-bs-theme attribute to the HTML element
  // This tells Bootstrap to use its built-in light/dark mode variables
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]); // Re-run whenever the theme changes

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    // Apply dynamic background color based on theme
    <div className={`d-flex flex-column min-vh-100 bg-${theme === 'light' ? 'light' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}>
      {/* Navigation Bar */}
      <Navbar bg={theme === 'light' ? 'dark' : 'dark'} variant={theme === 'light' ? 'dark' : 'dark'} expand="lg" className="shadow-lg">
        <Container>
          {/* Project Name/Logo */}
          <Navbar.Brand href="#home" className="text-white fs-4 fw-bold p-2 rounded bg-secondary">
            OpenWebRX Project
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="ms-auto align-items-center"> {/* Added align-items-center for vertical alignment */}
              <Nav.Link href="#home" className="text-light mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link">Home</Nav.Link>
              <Nav.Link href="#about" className="text-light mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link">About</Nav.Link>
              <Nav.Link href="#news" className="text-light mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link">News</Nav.Link>
              <Nav.Link href="#documentation" className="text-light mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link">Documentation</Nav.Link>
              <Nav.Link href="#community" className="text-light mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link">Community</Nav.Link>
              <Nav.Link href="#receiverbook" className="text-light mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link">Receiverbook</Nav.Link>

              {/* Theme Changer Button */}
              <Button
                variant={theme === 'light' ? 'outline-light' : 'outline-warning'} // Changed variant for better visibility in dark mode
                onClick={toggleTheme}
                className="ms-3 rounded-pill px-3 py-1"
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Area */}
      <Container className="flex-grow-1 py-5">

        {/* Home Section */}
        <Card id="home" className={`shadow-sm mb-5 p-4 rounded-lg bg-${theme === 'light' ? 'white' : 'secondary'} text-${theme === 'light' ? 'dark' : 'white'}`}>
          <Card.Body>
            <h1 className="display-4 fw-bold mb-4">Welcome to OpenWebRX Project!</h1>
            <p className="lead mb-4">
              This is a template for an OpenWebRX-like project. It provides a web-based software-defined radio (SDR) receiver, allowing you to listen to various radio signals directly in your browser.
              Explore the features, connect with the community, and dive into the world of radio communication.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <Button variant="success" href="#documentation" className="btn-lg fw-semibold shadow-sm">
                Get Started
              </Button>
              <Button variant="primary" href="#about" className="btn-lg fw-semibold shadow-sm">
                Learn More
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* About Section (Placeholder) */}
        <Card id="about" className={`shadow-sm mb-5 p-4 rounded-lg bg-${theme === 'light' ? 'white' : 'secondary'} text-${theme === 'light' ? 'dark' : 'white'}`}>
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

        {/* News Section (Placeholder) */}
        <Card id="news" className={`shadow-sm mb-5 p-4 rounded-lg bg-${theme === 'light' ? 'white' : 'secondary'} text-${theme === 'light' ? 'dark' : 'white'}`}>
          <Card.Body>
            <h2 className="h2 fw-bold mb-4">Latest News</h2>
            <div className="d-grid gap-4">
              <div className="border-bottom pb-3">
                <h3 className="h5 fw-semibold">Project Template Launched!</h3>
                <p className="text-muted small">July 18, 2025</p>
                <p className="mt-2">
                  We are excited to announce the launch of our OpenWebRX-like project frontend template. This initial release provides a solid foundation for future development.
                </p>
              </div>
              <div className="border-bottom pb-3">
                <h3 className="h5 fw-semibold">Upcoming Features</h3>
                <p className="text-muted small">July 10, 2025</p>
                <p className="mt-2">
                  Stay tuned for updates on new features, including advanced signal processing, user authentication, and more receiver integrations.
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Documentation Section (Placeholder) */}
        <Card id="documentation" className={`shadow-sm mb-5 p-4 rounded-lg bg-${theme === 'light' ? 'white' : 'secondary'} text-${theme === 'light' ? 'dark' : 'white'}`}>
          <Card.Body>
            <h2 className="h2 fw-bold mb-4">Documentation</h2>
            <p>
              Our comprehensive documentation provides guides and tutorials for setting up your own receiver, understanding radio concepts, and contributing to the project.
            </p>
            <ul className="list-unstyled mt-4">
              <li><a href="#" className="text-primary text-decoration-none hover-underline">Getting Started Guide</a></li>
              <li><a href="#" className="text-primary text-decoration-none hover-underline">API Reference</a></li>
              <li><a href="#" className="text-primary text-decoration-none hover-underline">Troubleshooting</a></li>
            </ul>
          </Card.Body>
        </Card>

        {/* Community Section (Placeholder) */}
        <Card id="community" className={`shadow-sm mb-5 p-4 rounded-lg bg-${theme === 'light' ? 'white' : 'secondary'} text-${theme === 'light' ? 'dark' : 'white'}`}>
          <Card.Body>
            <h2 className="h2 fw-bold mb-4">Community</h2>
            <p>
              Join our vibrant community! Connect with other radio enthusiasts, share your experiences, and get support from fellow users and developers.
            </p>
            <div className="d-flex gap-3 mt-4">
              <Button variant="info" href="#" className="shadow-sm">Forum</Button>
              <Button variant="danger" href="#" className="shadow-sm">Discord</Button>
              <Button variant="primary" href="#" className="shadow-sm">GitHub</Button>
            </div>
          </Card.Body>
        </Card>

        {/* Receiverbook Section (Now uses the new component) */}
        <ReceiverbookContent theme={theme} /> {/* Pass theme as a prop */}

      </Container>

      {/* Footer */}
      <footer className={`bg-${theme === 'light' ? 'dark' : 'dark'} text-${theme === 'light' ? 'light' : 'white'} p-4 text-center shadow-inner mt-auto`}>
        <Container>
          <p className="mb-1">&copy; 2025 OpenWebRX Project. All rights reserved.</p>
          <p className="small mt-2">Designed with <span className="text-danger">&hearts;</span> using React and Bootstrap</p>
        </Container>
      </footer>

      {/* Custom CSS for hover effects */}
      <style>{`
        .hover-link:hover {
          color: #10b981 !important; /* Green on hover */
          transform: translateY(-2px);
          transition: all 0.2s ease-in-out;
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
}

export default App;

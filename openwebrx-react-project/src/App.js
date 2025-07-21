import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, Button, Card } from 'react-bootstrap';

// Import page components
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import Documentation from './pages/Documentation';
import Community from './pages/Community';
import ReceiverbookContent from './ReceiverbookContent';
import AuthPage from './pages/AuthPage';

// Define protected routes
const PROTECTED_ROUTES = ['home', 'about', 'news', 'documentation', 'community', 'receiverbook'];

function App() {
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check for logged-in user on initial load (e.g., from localStorage)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('openwebrx_current_user');
      if (storedUser) {
        setCurrentUser(storedUser);
        setIsLoggedIn(true);
        setCurrentPage('home'); // If logged in, go to home
      } else {
        setCurrentPage('auth'); // If not logged in, go to auth
      }
    } catch (error) {
      console.error("Failed to read user from localStorage:", error);
      setCurrentPage('auth'); // Fallback to auth if localStorage fails
    }
  }, []);

  // Apply data-bs-theme attribute to HTML element for Bootstrap theming
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Function to handle navigation clicks and set the current page
  const handleNavClick = (page) => {
    if (PROTECTED_ROUTES.includes(page) && !isLoggedIn) {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback for successful login from AuthPage
  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem('openwebrx_current_user', username); // Persist login
    setCurrentPage('home'); // Redirect to home after successful login
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('openwebrx_current_user'); // Clear persisted login
    setCurrentPage('auth'); // Redirect to auth page after logout
  };

  // Determine which component to render based on currentPage and login status
  const renderPage = () => {
    if (!isLoggedIn && currentPage !== 'auth') {
      return <AuthPage theme={theme} setIsLoggedIn={handleLoginSuccess} setCurrentUser={setCurrentUser} />;
    }

    switch (currentPage) {
      case 'home':
        return <Home theme={theme} onNavClick={handleNavClick} />;
      case 'about':
        return <About theme={theme} />;
      case 'news':
        return <News theme={theme} />;
      case 'documentation':
        return <Documentation theme={theme} />;
      case 'community':
        return <Community theme={theme} />;
      case 'receiverbook':
        return <ReceiverbookContent theme={theme} />;
      case 'auth':
        return <AuthPage theme={theme} setIsLoggedIn={handleLoginSuccess} setCurrentUser={setCurrentUser} />;
      default:
        return <Home theme={theme} onNavClick={handleNavClick} />;
    }
  };

  return (
    <div className={`d-flex flex-column min-vh-100 app-container bg-${theme === 'light' ? 'light' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}>
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-lg py-3"> {/* Added py-3 for more padding */}
        <Container>
          <Navbar.Brand href="#home" onClick={() => handleNavClick('home')} className="text-white fs-4 fw-bold p-2 rounded bg-secondary brand-glow">
            OpenWebRX Project
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="ms-auto align-items-center">
              {isLoggedIn && (
                <>
                  <Nav.Link
                    href="#home"
                    onClick={() => handleNavClick('home')}
                    className={`mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link ${currentPage === 'home' ? 'active-nav-link' : 'text-light'}`}
                  >
                    Home
                  </Nav.Link>
                  <Nav.Link
                    href="#about"
                    onClick={() => handleNavClick('about')}
                    className={`mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link ${currentPage === 'about' ? 'active-nav-link' : 'text-light'}`}
                  >
                    About
                  </Nav.Link>
                  <Nav.Link
                    href="#news"
                    onClick={() => handleNavClick('news')}
                    className={`mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link ${currentPage === 'news' ? 'active-nav-link' : 'text-light'}`}
                  >
                    News
                  </Nav.Link>
                  <Nav.Link
                    href="#documentation"
                    onClick={() => handleNavClick('documentation')}
                    className={`mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link ${currentPage === 'documentation' ? 'active-nav-link' : 'text-light'}`}
                  >
                    Documentation
                  </Nav.Link>
                  <Nav.Link
                    href="#community"
                    onClick={() => handleNavClick('community')}
                    className={`mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link ${currentPage === 'community' ? 'active-nav-link' : 'text-light'}`}
                  >
                    Community
                  </Nav.Link>
                  <Nav.Link
                    href="#receiverbook"
                    onClick={() => handleNavClick('receiverbook')}
                    className={`mx-2 fs-5 fw-medium rounded-pill px-3 py-2 hover-link ${currentPage === 'receiverbook' ? 'active-nav-link' : 'text-light'}`}
                  >
                    Receiverbook
                  </Nav.Link>
                </>
              )}

              {/* Theme Changer Button */}
              <Button
                variant={theme === 'light' ? 'outline-light' : 'outline-warning'}
                onClick={toggleTheme}
                className="ms-3 rounded-pill px-3 py-1 theme-toggle-btn"
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Button>

              {/* Login/Logout Buttons */}
              {isLoggedIn ? (
                <>
                  <Navbar.Text className={`ms-3 text-${theme === 'light' ? 'light' : 'white'} fw-semibold`}>
                    Welcome, {currentUser}!
                  </Navbar.Text>
                  <Button variant="outline-danger" onClick={handleLogout} className="ms-3 rounded-pill px-3 py-1 logout-btn">
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="outline-info" onClick={() => handleNavClick('auth')} className="ms-3 rounded-pill px-3 py-1 login-register-btn">
                  Login / Register
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Area - Conditionally Rendered Pages */}
      <Container className="flex-grow-1 py-5">
        {renderPage()}
      </Container>

      {/* Footer */}
      <footer className={`bg-dark text-${theme === 'light' ? 'light' : 'white'} p-4 text-center shadow-inner mt-auto`}>
        <Container>
          <p className="mb-1">&copy; 2025 OpenWebRX Project. All rights reserved.</p>
          <p className="small mt-2">Designed with <span className="text-danger">&hearts;</span> using React and Bootstrap</p>
        </Container>
      </footer>

      {/* Custom CSS for hover effects and active nav link */}
      <style>{`
        .app-container {
          transition: background-color 0.5s ease-in-out, color 0.5s ease-in-out;
        }
        .hover-link:hover {
          color: #10b981 !important; /* Green on hover */
          transform: translateY(-2px);
          transition: all 0.2s ease-in-out;
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
        .active-nav-link {
          color: #10b981 !important; /* Active link color */
          font-weight: 600 !important; /* Make active link bolder */
          border-bottom: 2px solid #10b981; /* Underline active link */
          padding-bottom: 6px; /* Adjust padding for underline */
        }
        .brand-glow {
          transition: text-shadow 0.3s ease-in-out;
        }
        .brand-glow:hover {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
        }
        .theme-toggle-btn, .login-register-btn, .logout-btn {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default App;

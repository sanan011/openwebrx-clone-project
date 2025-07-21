import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';

function AuthPage({ theme, setIsLoggedIn, setCurrentUser }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null); // { type: 'success' | 'danger', text: '...' }

  const cardBg = theme === 'light' ? 'white' : 'dark';
  const cardText = theme === 'light' ? 'dark' : 'white';
  const inputBg = theme === 'light' ? 'white' : '#495057'; // Darker input background for dark mode
  const inputText = theme === 'light' ? 'dark' : 'white';
  const inputBorder = theme === 'light' ? 'border-secondary' : 'border-info'; // Brighter border for dark mode inputs
  const linkColor = theme === 'light' ? 'text-primary' : 'text-info'; // Use info for links in dark mode

  // Helper to get users from localStorage
  const getUsers = () => {
    try {
      const users = localStorage.getItem('openwebrx_users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Error parsing users from localStorage:", error);
      return [];
    }
  };

  // Helper to save users to localStorage
  const saveUsers = (users) => {
    try {
      localStorage.setItem('openwebrx_users', JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Passwords do not match!' });
      return;
    }
    if (username.length < 3 || password.length < 6) {
      setMessage({ type: 'danger', text: 'Username must be at least 3 characters and password at least 6 characters.' });
      return;
    }

    const users = getUsers();
    if (users.some(user => user.username === username)) {
      setMessage({ type: 'danger', text: 'Username already exists!' });
      return;
    }

    const newUser = { username, password }; // In a real app, hash password!
    saveUsers([...users, newUser]);
    setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
    setIsRegistering(false); // Switch to login form after successful registration
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setMessage(null);

    const users = getUsers();
    const foundUser = users.find(user => user.username === username && user.password === password); // In real app, compare hashed passwords

    if (foundUser) {
      setMessage({ type: 'success', text: `Welcome, ${username}!` });
      setIsLoggedIn(foundUser.username); // Pass username to setIsLoggedIn
      // setCurrentUser is handled by setIsLoggedIn in App.js
      setUsername('');
      setPassword('');
    } else {
      setMessage({ type: 'danger', text: 'Invalid username or password.' });
    }
  };

  return (
    <Card className={`shadow-lg mb-5 p-4 rounded-lg mx-auto auth-card bg-${cardBg} text-${cardText}`}> {/* Added shadow-lg and auth-card */}
      <Card.Body>
        <h2 className="h2 fw-bold text-center mb-4">{isRegistering ? 'Register' : 'Login'}</h2>

        {message && <Alert variant={message.type} className="text-center">{message.text}</Alert>}

        <Form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`form-control-lg bg-${inputBg} text-${inputText} ${inputBorder}`}
              style={{
                '::placeholder': { color: theme === 'light' ? '#6c757d' : '#adb5bd' },
                'WebkitTextFillColor': theme === 'light' ? '#212529' : '#f8f9fa' // For autofill
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`form-control-lg bg-${inputBg} text-${inputText} ${inputBorder}`}
              style={{
                '::placeholder': { color: theme === 'light' ? '#6c757d' : '#adb5bd' },
                'WebkitTextFillColor': theme === 'light' ? '#212529' : '#f8f9fa' // For autofill
              }}
            />
          </Form.Group>

          {isRegistering && (
            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`form-control-lg bg-${inputBg} text-${inputText} ${inputBorder}`}
                style={{
                  '::placeholder': { color: theme === 'light' ? '#6c757d' : '#adb5bd' },
                  'WebkitTextFillColor': theme === 'light' ? '#212529' : '#f8f9fa' // For autofill
                }}
              />
            </Form.Group>
          )}

          <Button variant="primary" type="submit" className="w-100 mt-3 btn-lg auth-btn">
            {isRegistering ? 'Register' : 'Login'}
          </Button>
        </Form>

        <p className="text-center mt-3">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <span className={`${linkColor} cursor-pointer hover-underline`} onClick={() => { setIsRegistering(false); setMessage(null); }}>Login here</span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span className={`${linkColor} cursor-pointer hover-underline`} onClick={() => { setIsRegistering(true); setMessage(null); }}>Register here</span>
            </>
          )}
        </p>
      </Card.Body>
      <style>{`
        .auth-card {
          transition: background-color 0.5s ease-in-out, color 0.5s ease-in-out, box-shadow 0.5s ease-in-out;
        }
        .auth-card.bg-dark {
            box-shadow: 0 0.5rem 1rem rgba(0, 255, 0, 0.15) !important; /* Subtle green glow in dark mode */
        }
        .auth-card.bg-white {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
        /* Custom styles for input placeholder and autofill text color */
        .form-control.bg-dark::placeholder {
          color: #adb5bd !important; /* Lighter placeholder for dark mode */
        }
        .form-control.bg-white::placeholder {
          color: #6c757d !important; /* Darker placeholder for light mode */
        }
        /* For autofill text color */
        .form-control:-webkit-autofill,
        .form-control:-webkit-autofill:hover,
        .form-control:-webkit-autofill:focus,
        .form-control:-webkit-autofill:active {
            -webkit-text-fill-color: ${theme === 'light' ? '#212529' : '#f8f9fa'} !important;
            -webkit-box-shadow: 0 0 0px 1000px ${theme === 'light' ? '#ffffff' : '#495057'} inset !important; /* Match background */
            transition: background-color 5000s ease-in-out 0s;
        }
        .auth-btn {
            transition: all 0.3s ease-in-out;
        }
        .auth-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </Card>
  );
}

export default AuthPage;

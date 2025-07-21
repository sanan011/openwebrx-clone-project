import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Table, Button, Row, Col, Form } from 'react-bootstrap'; // Added Form for sliders
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet for custom icon

// Fix for default marker icon not showing up
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Dummy data for receivers with coordinates
const dummyReceivers = [
  { id: 1, name: 'IZ0FKE - ROMA', location: 'Rome, Italy', frequencyRange: 'HF, VHF', status: 'Online', url: '#', lat: 41.9028, lng: 12.4964 },
  { id: 2, name: 'DL1ABC - BERLIN', location: 'Berlin, Germany', frequencyRange: 'VHF, UHF', status: 'Online', url: '#', lat: 52.5200, lng: 13.4050 },
  { id: 3, name: 'W1XYZ - NEW YORK', location: 'New York, USA', frequencyRange: 'HF', status: 'Offline', url: '#', lat: 40.7128, lng: -74.0060 },
  { id: 4, name: 'JA7DEF - TOKYO', location: 'Tokyo, Japan', frequencyRange: 'UHF', status: 'Online', url: '#', lat: 35.6895, lng: 139.6917 },
  { id: 5, name: 'VK2GHI - SYDNEY', location: 'Sydney, Australia', frequencyRange: 'HF, VHF', status: 'Online', url: '#', lat: -33.8688, lng: 151.2093 },
  { id: 6, name: 'G8PQR - LONDON', location: 'London, UK', frequencyRange: 'VHF', status: 'Online', url: '#', lat: 51.5074, lng: -0.1278 },
  { id: 7, name: 'F5STU - PARIS', location: 'Paris, France', frequencyRange: 'UHF', status: 'Offline', url: '#', lat: 48.8566, lng: 2.3522 },
  { id: 8, name: 'VE3UVW - TORONTO', location: 'Toronto, Canada', frequencyRange: 'HF', status: 'Online', url: '#', lat: 43.6532, lng: -79.3832 },
];

function ReceiverbookContent({ theme }) {
  const [meteoData, setMeteoData] = useState('Loading meteo data...');
  const [issPass, setIssPass] = useState('Loading next ISS pass...');
  const [view, setView] = useState('list'); // 'list' or 'map'
  const [selectedReceiver, setSelectedReceiver] = useState(null); // State for selected receiver

  // Refs for the spectrum and waterfall canvases
  const spectrumCanvasRef = useRef(null);
  const waterfallCanvasRef = useRef(null);
  const animationFrameId = useRef(null); // To store animation frame ID for cleanup

  // State for waterfall color levels
  const [waterfallMinLevel, setWaterfallMinLevel] = useState(-100); // dBm
  const [waterfallMaxLevel, setWaterfallMaxLevel] = useState(-30); // dBm

  // Determine Bootstrap variant for Card and Table based on theme
  const cardBg = theme === 'light' ? 'white' : 'dark';
  const cardText = theme === 'light' ? 'dark' : 'white';
  const tableVariant = theme === 'light' ? 'light' : 'dark';

  // Simulate API calls
  useEffect(() => {
    const fetchMeteoData = () => {
      console.log('Fetching simulated meteo data...');
      setTimeout(() => {
        const mockMeteo = {
          current: {
            temperature_2m: (20 + Math.random() * 10).toFixed(1),
            wind_speed_10m: (5 + Math.random() * 15).toFixed(1),
            wind_direction_10m: Math.floor(Math.random() * 360)
          }
        };
        setMeteoData(
          `ROMA METEO: Temp Attuale: ${mockMeteo.current.temperature_2m}°C, Vento: ${mockMeteo.current.wind_speed_10m} km/h (${mockMeteo.current.wind_direction_10m}°).`
        );
      }, 1500);
    };

    const fetchIssPass = () => {
      console.log('Fetching simulated ISS pass data...');
      setTimeout(() => {
        const mockIss = {
          passes: [
            {
              startUTC: Date.now() / 1000 + 3600 + Math.random() * 7200,
              startAzCompass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
              startAz: Math.floor(Math.random() * 360)
            }
          ]
        };
        const nextPassTimeUTC = new Date(mockIss.passes[0].startUTC * 1000);
        const romeTime = nextPassTimeUTC.toLocaleString('en-US', {
          timeZone: 'Europe/Rome',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        setIssPass(
          `Next ISS Pass: ${mockIss.passes[0].startAzCompass} at ${mockIss.passes[0].startAz}° @ ${romeTime}`
        );
      }, 2000);
    };

    fetchMeteoData();
    fetchIssPass();

    const meteoInterval = setInterval(fetchMeteoData, 900000);
    const issInterval = setInterval(fetchIssPass, 900000);

    return () => {
      clearInterval(meteoInterval);
      clearInterval(issInterval);
    };
  }, []);

  // Function to generate simulated frequency data
  const generateSimulatedData = useCallback((numPoints) => {
    const data = new Float32Array(numPoints);
    const centerFreq = numPoints / 2;
    const bandwidth = numPoints * 0.4; // 40% of the width

    for (let i = 0; i < numPoints; i++) {
      // Base noise level
      let value = -120 + Math.random() * 30; // -120 dBm to -90 dBm

      // Add a wide hump in the middle
      const distFromCenter = Math.abs(i - centerFreq);
      if (distFromCenter < bandwidth / 2) {
        value += 50 * (1 - (distFromCenter / (bandwidth / 2)) ** 2); // Parabolic hump
      }

      // Add a few random, sharper peaks
      if (Math.random() < 0.01) { // 1% chance for a peak
        const peakWidth = numPoints * (0.01 + Math.random() * 0.02); // 1-3% of width
        const peakHeight = 30 + Math.random() * 40; // 30-70 dBm
        for (let j = 0; j < peakWidth; j++) {
          const idx = i + j - Math.floor(peakWidth / 2);
          if (idx >= 0 && idx < numPoints) {
            const peakFactor = Math.sin((j / peakWidth) * Math.PI);
            data[idx] = Math.max(data[idx] || value, value + peakHeight * peakFactor);
          }
        }
      }
      data[i] = Math.min(0, Math.max(-150, value + (Math.sin(i * 0.1 + performance.now() * 0.001) * 5))); // Add slight oscillation
    }
    return data;
  }, []);

  // Function to get color from signal level for waterfall
  const getWaterfallColor = useCallback((level) => {
    // Normalize level to 0-1 range based on min/max levels
    const normalizedLevel = (level - waterfallMinLevel) / (waterfallMaxLevel - waterfallMinLevel);
    const clampedLevel = Math.max(0, Math.min(1, normalizedLevel));

    // Create a color gradient (e.g., blue -> green -> yellow -> red)
    const r = Math.floor(255 * clampedLevel);
    const g = Math.floor(255 * (1 - clampedLevel));
    const b = 0; // Keep blue low for warmer colors at high signal
    return `rgb(${r}, ${g}, ${b})`;
  }, [waterfallMinLevel, waterfallMaxLevel]);


  // Effect for drawing the live spectrum and waterfall
  useEffect(() => {
    const spectrumCanvas = spectrumCanvasRef.current;
    const waterfallCanvas = waterfallCanvasRef.current;
    if (!spectrumCanvas || !waterfallCanvas || !selectedReceiver) {
      cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const spectrumCtx = spectrumCanvas.getContext('2d');
    const waterfallCtx = waterfallCanvas.getContext('2d');

    const spectrumWidth = spectrumCanvas.width;
    const spectrumHeight = spectrumCanvas.height;
    const waterfallWidth = waterfallCanvas.width;
    const waterfallHeight = waterfallCanvas.height;

    // Set canvas dimensions to match display size for sharp rendering
    const updateCanvasDimensions = () => {
      const container = spectrumCanvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        spectrumCanvas.width = rect.width;
        spectrumCanvas.height = spectrumHeight; // Keep fixed height for spectrum
        waterfallCanvas.width = rect.width;
        waterfallCanvas.height = waterfallHeight; // Keep fixed height for waterfall
      }
    };
    updateCanvasDimensions(); // Initial set
    window.addEventListener('resize', updateCanvasDimensions); // Update on resize

    let lastFrameTime = performance.now();
    const frameRate = 30; // Target 30 frames per second for waterfall update
    const interval = 1000 / frameRate;

    const draw = (currentTime) => {
      if (!selectedReceiver) {
        cancelAnimationFrame(animationFrameId.current);
        return;
      }

      const deltaTime = currentTime - lastFrameTime;

      // Only update waterfall and generate new data at a slower rate
      if (deltaTime > interval) {
        lastFrameTime = currentTime - (deltaTime % interval); // Adjust lastFrameTime

        const data = generateSimulatedData(spectrumWidth);

        // --- Draw Spectrum ---
        spectrumCtx.clearRect(0, 0, spectrumWidth, spectrumHeight);
        spectrumCtx.fillStyle = theme === 'light' ? '#e0e0e0' : '#333';
        spectrumCtx.fillRect(0, 0, spectrumWidth, spectrumHeight);

        spectrumCtx.strokeStyle = theme === 'light' ? '#28a745' : '#00ff00'; // Green
        spectrumCtx.lineWidth = 2;
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(0, spectrumHeight - (data[0] - waterfallMinLevel) / (waterfallMaxLevel - waterfallMinLevel) * spectrumHeight);

        for (let i = 0; i < spectrumWidth; i++) {
          const y = spectrumHeight - (data[i] - waterfallMinLevel) / (waterfallMaxLevel - waterfallMinLevel) * spectrumHeight;
          spectrumCtx.lineTo(i, y);
        }
        spectrumCtx.stroke();

        // Fill below spectrum
        spectrumCtx.fillStyle = theme === 'light' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(0, 255, 0, 0.2)';
        spectrumCtx.lineTo(spectrumWidth, spectrumHeight);
        spectrumCtx.lineTo(0, spectrumHeight);
        spectrumCtx.closePath();
        spectrumCtx.fill();

        // Add center frequency marker
        spectrumCtx.strokeStyle = theme === 'light' ? '#dc3545' : '#ffc107'; // Red/Yellow
        spectrumCtx.lineWidth = 1;
        spectrumCtx.setLineDash([5, 5]);
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(spectrumWidth / 2, 0);
        spectrumCtx.lineTo(spectrumWidth / 2, spectrumHeight);
        spectrumCtx.stroke();
        spectrumCtx.setLineDash([]);

        // Add frequency labels
        spectrumCtx.fillStyle = theme === 'light' ? '#333' : '#eee';
        spectrumCtx.font = '12px Arial';
        spectrumCtx.textAlign = 'center';
        spectrumCtx.fillText('Center Freq', spectrumWidth / 2, spectrumHeight - 10);
        spectrumCtx.textAlign = 'left';
        spectrumCtx.fillText('Low Freq', 10, spectrumHeight - 10);
        spectrumCtx.textAlign = 'right';
        spectrumCtx.fillText('High Freq', spectrumWidth - 10, spectrumHeight - 10);

        // --- Draw Waterfall ---
        // Shift existing pixels up by one row
        waterfallCtx.drawImage(waterfallCanvas, 0, 1, waterfallWidth, waterfallHeight - 1, 0, 0, waterfallWidth, waterfallHeight - 1);

        // Draw new data row at the bottom
        for (let i = 0; i < waterfallWidth; i++) {
          waterfallCtx.fillStyle = getWaterfallColor(data[i]);
          waterfallCtx.fillRect(i, waterfallHeight - 1, 1, 1);
        }
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    animationFrameId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [selectedReceiver, theme, generateSimulatedData, getWaterfallColor, waterfallMinLevel, waterfallMaxLevel]);


  // Function to handle tuning in to a receiver
  const handleTuneIn = (receiver) => {
    setSelectedReceiver(receiver);
    // Optionally scroll to the spectrum section
    setTimeout(() => {
      const spectrumSection = document.getElementById('spectrum-display');
      if (spectrumSection) {
        spectrumSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Small delay to allow state update and render
  };

  return (
    <Card className={`shadow-sm mb-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
      <Card.Body>
        <h2 className="h2 fw-bold mb-4">Receiverbook</h2>
        <p className="leading-relaxed mb-4">
          The Receiverbook lists publicly accessible OpenWebRX receivers around the world. Find a receiver near you or explore signals from distant locations!
        </p>

        {/* View Switcher Buttons */}
        <div className="d-flex justify-content-center mb-4 gap-3">
          <Button
            variant={view === 'list' ? 'success' : 'outline-success'}
            onClick={() => setView('list')}
            className="fw-semibold px-4 py-2 rounded-pill"
          >
            List View
          </Button>
          <Button
            variant={view === 'map' ? 'primary' : 'outline-primary'}
            onClick={() => setView('map')}
            className="fw-semibold px-4 py-2 rounded-pill"
          >
            Map View
          </Button>
        </div>

        {/* Dynamic Content based on view state */}
        {view === 'list' ? (
          <div className="receiver-list-view">
            <h3 className="h4 fw-bold mb-3">Available Receivers (List)</h3>
            <Table responsive striped bordered hover variant={tableVariant} className="text-center mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Freq. Range</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dummyReceivers.map((receiver) => (
                  <tr key={receiver.id}>
                    <td className={receiver.status === 'Online' ? 'text-success' : 'text-danger'}>
                      {receiver.name}
                    </td>
                    <td>{receiver.location}</td>
                    <td>{receiver.frequencyRange}</td>
                    <td>
                      <span className={`badge ${receiver.status === 'Online' ? 'bg-success' : 'bg-danger'}`}>
                        {receiver.status}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleTuneIn(receiver)} // Use onClick to set selected receiver
                        disabled={receiver.status === 'Offline'}
                      >
                        Tune In
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="receiver-map-view text-center">
            <h3 className="h4 fw-bold mb-3">Receiver Map</h3>
            <div className="map-container" style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {dummyReceivers.map((receiver) => (
                  <Marker key={receiver.id} position={[receiver.lat, receiver.lng]}>
                    <Popup>
                      <strong>{receiver.name}</strong><br />
                      Location: {receiver.location}<br />
                      Freq. Range: {receiver.frequencyRange}<br />
                      Status: <span className={receiver.status === 'Online' ? 'text-success' : 'text-danger'}>{receiver.status}</span><br />
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleTuneIn(receiver)} // Use onClick to set selected receiver
                        disabled={receiver.status === 'Offline'}
                        className="mt-2"
                      >
                        Tune In
                      </Button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <p className="mt-3">
              Click on markers to see receiver details and tune in.
            </p>
          </div>
        )}

        <hr className={`border-${theme === 'light' ? 'secondary' : 'light'} my-4`} />

        {/* Original DX Cluster and ISS/Meteo Data */}
        <div className="dx-table-container border border-secondary p-3 rounded-lg">
          <Table responsive striped bordered hover variant={tableVariant} className="text-center mb-0">
            <tbody>
              <tr>
                <td colSpan="3" className="animated-row py-2 text-warning">
                  Telnet DX Cluster @ clx.noantri.org:23
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="animated-row py-2 text-warning">
                  APRS Server @ aprs.noantri.org:14580
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="animated-row py-2">
                  <a href="https://webclx.noantri.org" target="_blank" rel="noopener noreferrer" className="text-danger text-decoration-none mx-2 fw-bold">WEBCLX</a>
                  <a href="https://sdr.noantri.org/hamclock-live/live.html" target="_blank" rel="noopener noreferrer" className="text-danger text-decoration-none mx-2 fw-bold">HAMCLOCK</a>
                  <a href="https://sdr.noantri.org/dash/hamdash.html" target="_blank" rel="noopener noreferrer" className="text-danger text-decoration-none mx-2 fw-bold">DASHBOARD</a>
                </td>
              </tr>
              <tr>
                <td colSpan="3" className={`py-2 bg-${theme === 'light' ? 'light' : 'secondary'} text-${theme === 'light' ? 'dark' : 'light'}`}>
                  {meteoData}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className={`py-2 bg-${theme === 'light' ? 'light' : 'secondary'} text-${theme === 'light' ? 'dark' : 'light'}`}>
                  {issPass}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>

      {/* Spectrum and Waterfall Display Section - Conditionally rendered */}
      {selectedReceiver && (
        <Card id="spectrum-display" className={`shadow-sm mt-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h4 fw-bold mb-0">Live Spectrum & Waterfall for {selectedReceiver.name}</h3>
              <Button variant="danger" size="sm" onClick={() => setSelectedReceiver(null)}>
                Close Display
              </Button>
            </div>
            <p className="text-muted small">
              Simulated live display for {selectedReceiver.location} ({selectedReceiver.frequencyRange})
            </p>

            {/* Spectrum Canvas */}
            <h5 className="mt-4 mb-2 text-primary">Spectrum</h5>
            <div className="spectrum-canvas-container" style={{ position: 'relative', width: '100%', height: '250px', border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`, borderRadius: '4px', overflow: 'hidden' }}>
              <canvas ref={spectrumCanvasRef} width="800" height="250" style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
            </div>

            {/* Waterfall Canvas */}
            <h5 className="mt-4 mb-2 text-primary">Waterfall</h5>
            <div className="waterfall-canvas-container" style={{ position: 'relative', width: '100%', height: '200px', border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`, borderRadius: '4px', overflow: 'hidden' }}>
              <canvas ref={waterfallCanvasRef} width="800" height="200" style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
            </div>

            {/* Waterfall Controls */}
            <div className="mt-4">
              <h5 className="mb-3 text-primary">Waterfall Color Levels (dBm)</h5>
              <Row className="align-items-center mb-3">
                <Col xs={12} md={2}>
                  <Form.Label className="mb-0">Min Level: {waterfallMinLevel} dBm</Form.Label>
                </Col>
                <Col xs={12} md={10}>
                  <Form.Range
                    min="-150"
                    max="-50"
                    step="1"
                    value={waterfallMinLevel}
                    onChange={(e) => setWaterfallMinLevel(parseInt(e.target.value))}
                    className={`form-range-${theme}`}
                  />
                </Col>
              </Row>
              <Row className="align-items-center">
                <Col xs={12} md={2}>
                  <Form.Label className="mb-0">Max Level: {waterfallMaxLevel} dBm</Form.Label>
                </Col>
                <Col xs={12} md={10}>
                  <Form.Range
                    min="-40"
                    max="0"
                    step="1"
                    value={waterfallMaxLevel}
                    onChange={(e) => setWaterfallMaxLevel(parseInt(e.target.value))}
                    className={`form-range-${theme}`}
                  />
                </Col>
              </Row>
            </div>

            <p className="mt-3 text-muted small">
              This is a simulated live spectrum and waterfall display. In a real OpenWebRX project, this would visualize actual radio signals.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Custom CSS for the animated row and links, mimicking the original */}
      <style>{`
        .dx-table-container table {
          font-family: Arial, sans-serif;
          font-size: 11px;
        }
        .dx-table-container th,
        .dx-table-container td {
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          padding: 4px !important;
          text-align: left;
          background-color: rgba(0, 0, 0, 0.6) !important; /* Keep dark background for these cells */
        }
        .dx-table-container th {
          background-color: rgba(34, 34, 34, 0.8) !important; /* Keep dark background for these headers */
        }
        .animated-row {
          background-color: rgba(34, 34, 34, 0.8) !important; /* Keep dark background for animated row */
          animation: colorChange 5s infinite;
        }
        @keyframes colorChange {
          0% { color: yellow; }
          25% { color: white; }
          50% { color: yellow; }
          75% { color: white; }
          100% { color: yellow; }
        }
        @media (max-width: 600px) {
          .dx-table-container table {
            font-size: 9px;
          }
          .dx-table-container th, .dx-table-container td {
            padding: 2px !important;
          }
        }
        /* Custom styling for Bootstrap Form.Range to adapt to themes */
        .form-range-light::-webkit-slider-thumb {
          background-color: #0d6efd; /* Bootstrap primary blue */
        }
        .form-range-light::-moz-range-thumb {
          background-color: #0d6efd;
        }
        .form-range-dark::-webkit-slider-thumb {
          background-color: #0dcaf0; /* Bootstrap info light blue */
        }
        .form-range-dark::-moz-range-thumb {
          background-color: #0dcaf0;
        }
      `}</style>
    </Card>
  );
}

export default ReceiverbookContent;

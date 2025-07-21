import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Table, Button, Row, Col, Form } from 'react-bootstrap';
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
  { id: 1, name: 'IZ0FKE - ROMA', location: 'Rome, Italy', frequencyRange: 'HF, VHF', status: 'Online', url: '#', lat: 41.9028, lng: 12.4964, defaultFreq: 145.675 },
  { id: 2, name: 'DL1ABC - BERLIN', location: 'Berlin, Germany', frequencyRange: 'VHF, UHF', status: 'Online', url: '#', lat: 52.5200, lng: 13.4050, defaultFreq: 433.000 },
  { id: 3, name: 'W1XYZ - NEW YORK', location: 'New York, USA', frequencyRange: 'HF', status: 'Offline', url: '#', lat: 40.7128, lng: -74.0060, defaultFreq: 7.100 },
  { id: 4, name: 'JA7DEF - TOKYO', location: 'Tokyo, Japan', frequencyRange: 'UHF', status: 'Online', url: '#', lat: 35.6895, lng: 139.6917, defaultFreq: 446.000 },
  { id: 5, name: 'VK2GHI - SYDNEY', location: 'Sydney, Australia', frequencyRange: 'HF, VHF', status: 'Online', url: '#', lat: -33.8688, lng: 151.2093, defaultFreq: 28.500 },
  { id: 6, name: 'G8PQR - LONDON', location: 'London, UK', frequencyRange: 'VHF', status: 'Online', url: '#', lat: 51.5074, lng: -0.1278, defaultFreq: 144.800 },
  { id: 7, name: 'F5STU - PARIS', location: 'Paris, France', frequencyRange: 'UHF', status: 'Offline', url: '#', lat: 48.8566, lng: 2.3522, defaultFreq: 430.000 },
  { id: 8, name: 'VE3UVW - TORONTO', location: 'Toronto, Canada', frequencyRange: 'HF', status: 'Online', url: '#', lat: 43.6532, lng: -79.3832, defaultFreq: 14.200 },
];

// Dummy data for station markers (relative to the center of the displayed spectrum)
const dummyStationMarkers = [
  { callsign: 'IZ0RIN', freqOffsetKHz: -50, type: 'Voice' },
  { callsign: 'PACKET', freqOffsetKHz: 20, type: 'Data' },
  { callsign: 'IQ0FP', freqOffsetKHz: 100, type: 'Voice' },
  { callsign: 'FT8-DX', freqOffsetKHz: -120, type: 'Digital' },
  { callsign: 'DMR-TG', freqOffsetKHz: 70, type: 'Digital' },
];

// Define the total bandwidth displayed by the spectrum canvas in kHz
const DISPLAYED_SPECTRUM_BANDWIDTH_KHZ = 200; // e.g., 200 kHz

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

  // Receiver Control States
  const [currentFrequency, setCurrentFrequency] = useState(null); // MHz
  const [selectedMode, setSelectedMode] = useState('FM');
  const [volume, setVolume] = useState(70); // 0-100
  const [squelch, setSquelch] = useState(-90); // dBm
  const [bandwidth, setBandwidth] = useState('12.5 kHz');
  const [noiseReduction, setNoiseReduction] = useState(0); // -10 to 10
  const [isRecording, setIsRecording] = useState(false);
  const [currentSignalLevel, setCurrentSignalLevel] = useState(-100); // dBm
  const [currentTime, setCurrentTime] = useState(''); // UTC time

  // State for tuning cursor position and dragging
  const [tuningCursorX, setTuningCursorX] = useState(0); // Pixel position on spectrum canvas
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);

  // Determine Bootstrap variant for Card and Table based on theme
  const cardBg = theme === 'light' ? 'white' : 'dark';
  const cardText = theme === 'light' ? 'dark' : 'white';
  const tableVariant = theme === 'light' ? 'light' : 'dark';
  const inputBg = theme === 'light' ? 'white' : '#495057'; // Darker input background for dark mode
  const inputText = theme === 'light' ? 'dark' : 'white';
  const inputBorder = theme === 'light' ? 'border-secondary' : 'border-info'; // Brighter border for dark mode inputs
  const linkColor = theme === 'light' ? 'text-primary' : 'text-info'; // Use info for links in dark mode
  const mutedText = theme === 'light' ? 'text-muted' : 'text-light'; // For small, muted text


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
    const centerFreqIndex = numPoints / 2;
    const bandwidthIndex = numPoints * 0.4; // 40% of the width

    for (let i = 0; i < numPoints; i++) {
      // Base noise level
      let value = -120 + Math.random() * 30; // -120 dBm to -90 dBm

      // Add a wide hump in the middle
      const distFromCenter = Math.abs(i - centerFreqIndex);
      if (distFromCenter < bandwidthIndex / 2) {
        value += 50 * (1 - (distFromCenter / (bandwidthIndex / 2)) ** 2); // Parabolic hump
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

    // Create a color gradient (more vibrant)
    // Using HSL for better control over color transitions
    let h, s, l;
    if (clampedLevel < 0.5) {
      // Transition from blue (low) to green (mid)
      h = 240 - (clampedLevel * 2 * 120); // 240 (blue) to 120 (green)
      s = 100;
      l = 20 + (clampedLevel * 2 * 30); // Darker blue to brighter green
    } else {
      // Transition from green (mid) to red (high)
      h = 120 - ((clampedLevel - 0.5) * 2 * 120); // 120 (green) to 0 (red)
      s = 100;
      l = 50 - ((clampedLevel - 0.5) * 2 * 20); // Brighter green to slightly darker red
    }
    return `hsl(${h}, ${s}%, ${l}%)`;
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

    const spectrumHeight = spectrumCanvas.height;
    const waterfallHeight = waterfallCanvas.height;

    // Set canvas dimensions to match display size for sharp rendering
    const updateCanvasDimensions = () => {
      const container = spectrumCanvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        spectrumCanvas.width = rect.width;
        waterfallCanvas.width = rect.width;
        // Initialize tuning cursor to center if it's the first render or receiver changes
        if (tuningCursorX === 0 || tuningCursorX === 800) { // Check for initial or default width
          setTuningCursorX(rect.width / 2);
        }
      }
    };
    updateCanvasDimensions(); // Initial set
    window.addEventListener('resize', updateCanvasDimensions); // Update on resize

    let lastFrameTime = performance.now();
    const frameRate = 30; // Target 30 frames per second for waterfall update
    const interval = 1000 / frameRate;

    const draw = (currentTimeStamp) => {
      if (!selectedReceiver) {
        cancelAnimationFrame(animationFrameId.current);
        return;
      }

      const deltaTime = currentTimeStamp - lastFrameTime;

      if (deltaTime > interval) {
        lastFrameTime = currentTimeStamp - (deltaTime % interval);

        const spectrumWidth = spectrumCanvas.width;
        const waterfallWidth = waterfallCanvas.width;

        const data = generateSimulatedData(spectrumWidth);

        // Calculate frequency at cursor position
        const pixelsPerKHz = spectrumWidth / DISPLAYED_SPECTRUM_BANDWIDTH_KHZ;
        const frequencyAtCursorKHz = (selectedReceiver.defaultFreq * 1000 - (DISPLAYED_SPECTRUM_BANDWIDTH_KHZ / 2)) + (tuningCursorX / pixelsPerKHz);
        setCurrentFrequency((frequencyAtCursorKHz / 1000).toFixed(4));

        // Simulate signal level (e.g., average of data points)
        const avgSignal = data.reduce((sum, val) => sum + val, 0) / data.length;
        setCurrentSignalLevel(avgSignal.toFixed(1));

        // Update current time
        setCurrentTime(new Date().toUTCString().split(' ')[4] + ' UTC');

        // --- Draw Spectrum ---
        spectrumCtx.clearRect(0, 0, spectrumWidth, spectrumHeight);
        spectrumCtx.fillStyle = theme === 'light' ? '#e0e0e0' : '#333';
        spectrumCtx.fillRect(0, 0, spectrumWidth, spectrumHeight);

        // Draw horizontal grid lines
        spectrumCtx.strokeStyle = theme === 'light' ? '#ccc' : '#555';
        spectrumCtx.lineWidth = 0.5;
        for (let i = 1; i < 5; i++) {
          const y = (spectrumHeight / 5) * i;
          spectrumCtx.beginPath();
          spectrumCtx.moveTo(0, y);
          spectrumCtx.lineTo(spectrumWidth, y);
          spectrumCtx.stroke();
        }

        // Draw spectrum line
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

        // Add tuning cursor
        spectrumCtx.strokeStyle = theme === 'light' ? '#dc3545' : '#ffc107'; // Red/Yellow
        spectrumCtx.lineWidth = 2; // Make cursor line a bit thicker
        spectrumCtx.setLineDash([5, 5]); // Dashed line for tuning cursor
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(tuningCursorX, 0);
        spectrumCtx.lineTo(tuningCursorX, spectrumHeight);
        spectrumCtx.stroke();
        spectrumCtx.setLineDash([]); // Reset line dash

        // Draw tuning cursor triangle
        spectrumCtx.fillStyle = theme === 'light' ? '#dc3545' : '#ffc107';
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(tuningCursorX - 5, 0);
        spectrumCtx.lineTo(tuningCursorX + 5, 0);
        spectrumCtx.lineTo(tuningCursorX, 10);
        spectrumCtx.closePath();
        spectrumCtx.fill();

        // Add frequency labels (relative to fixed displayed bandwidth)
        spectrumCtx.fillStyle = theme === 'light' ? '#333' : '#eee';
        spectrumCtx.font = '12px Arial';
        spectrumCtx.textAlign = 'center';

        // Center frequency label
        spectrumCtx.fillText(
          `${(selectedReceiver.defaultFreq).toFixed(3)} MHz (Center)`,
          spectrumWidth / 2,
          spectrumHeight - 10
        );

        // Low and High frequency labels
        const lowFreq = (selectedReceiver.defaultFreq - DISPLAYED_SPECTRUM_BANDWIDTH_KHZ / 2000).toFixed(3);
        const highFreq = (selectedReceiver.defaultFreq + DISPLAYED_SPECTRUM_BANDWIDTH_KHZ / 2000).toFixed(3);
        spectrumCtx.textAlign = 'left';
        spectrumCtx.fillText(`${lowFreq} MHz`, 10, spectrumHeight - 10);
        spectrumCtx.textAlign = 'right';
        spectrumCtx.fillText(`${highFreq} MHz`, spectrumWidth - 10, spectrumHeight - 10);


        // --- Draw Station Markers ---
        dummyStationMarkers.forEach(marker => {
          // Calculate x position based on frequency offset from the *center of the displayed spectrum*
          const markerX = (spectrumWidth / 2) + (marker.freqOffsetKHz * pixelsPerKHz);

          if (markerX >= 0 && markerX <= spectrumWidth) {
            // Draw vertical line for marker
            spectrumCtx.strokeStyle = theme === 'light' ? '#007bff' : '#00bcd4'; // Blue/Cyan for markers
            spectrumCtx.lineWidth = 1;
            spectrumCtx.beginPath();
            spectrumCtx.moveTo(markerX, 0);
            spectrumCtx.lineTo(markerX, spectrumHeight);
            spectrumCtx.stroke();

            // Draw callsign text
            spectrumCtx.fillStyle = theme === 'light' ? '#007bff' : '#00bcd4'; // Blue/Cyan text
            spectrumCtx.font = '10px Arial';
            spectrumCtx.textAlign = 'center';
            // Position text slightly above the bottom or top, rotate for better readability
            spectrumCtx.save();
            spectrumCtx.translate(markerX, spectrumHeight - 25);
            spectrumCtx.rotate(-Math.PI / 4); // Rotate -45 degrees
            spectrumCtx.fillText(marker.callsign, 0, 0);
            spectrumCtx.restore();
          }
        });


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
  }, [selectedReceiver, theme, generateSimulatedData, getWaterfallColor, waterfallMinLevel, waterfallMaxLevel, tuningCursorX]);


  // Function to handle tuning in to a receiver
  const handleTuneIn = (receiver) => {
    setSelectedReceiver(receiver);
    // Initialize tuning cursor to center when a receiver is selected
    const canvas = spectrumCanvasRef.current;
    if (canvas) {
      setTuningCursorX(canvas.width / 2);
    } else {
      setTuningCursorX(400); // Fallback if canvas ref not ready (initial render)
    }
    setCurrentFrequency(receiver.defaultFreq); // Set initial frequency
    // Optionally scroll to the receiver control panel
    setTimeout(() => {
      const receiverPanel = document.getElementById('receiver-control-panel');
      if (receiverPanel) {
        receiverPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100); // Small delay to allow state update and render
  };

  // Mouse event handlers for tuning cursor
  const handleMouseDown = (e) => {
    setIsDraggingCursor(true);
    setTuningCursorX(e.nativeEvent.offsetX);
  };

  const handleMouseMove = (e) => {
    if (isDraggingCursor) {
      let newX = e.nativeEvent.offsetX;
      const canvas = spectrumCanvasRef.current;
      if (canvas) {
        newX = Math.max(0, Math.min(canvas.width, newX));
      }
      setTuningCursorX(newX);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCursor(false);
  };

  const handleMouseLeave = () => {
    setIsDraggingCursor(false); // Stop dragging if mouse leaves canvas area
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
            className="fw-semibold px-4 py-2 rounded-pill hover-btn-scale"
          >
            List View
          </Button>
          <Button
            variant={view === 'map' ? 'primary' : 'outline-primary'}
            onClick={() => setView('map')}
            className="fw-semibold px-4 py-2 rounded-pill hover-btn-scale"
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
                        className="hover-btn-scale-sm"
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
                        className="mt-2 hover-btn-scale-sm"
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
                  <a href="https://webclx.noantri.org" target="_blank" rel="noopener noreferrer" className={`${linkColor} text-decoration-none hover-underline`}>WEBCLX</a>
                  <a href="https://sdr.noantri.org/hamclock-live/live.html" target="_blank" rel="noopener noreferrer" className={`${linkColor} text-decoration-none mx-2 fw-bold hover-underline`}>HAMCLOCK</a>
                  <a href="https://sdr.noantri.org/dash/hamdash.html" target="_blank" rel="noopener noreferrer" className={`${linkColor} text-decoration-none hover-underline`}>DASHBOARD</a>
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

      {/* Receiver Controls Panel and Frequency Spectrum and Station Activity Panel - Conditionally rendered */}
      {selectedReceiver && (
        <>
          <Card id="receiver-control-panel" className={`shadow-sm mt-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h4 fw-bold mb-0">Main Receiver Control Panel: {selectedReceiver.name}</h3>
                <Button variant="danger" size="sm" onClick={() => setSelectedReceiver(null)} className="hover-btn-scale-sm">
                  Close Receiver
                </Button>
              </div>
              <p className={`${mutedText} small mb-4`}>
                Controlling {selectedReceiver.location} ({selectedReceiver.frequencyRange})
              </p>

              {/* Frequency Display */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Frequency:</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <div className={`p-2 rounded text-center fw-bold fs-5 bg-${inputBg} text-${inputText} border border-info`}>
                    {currentFrequency ? currentFrequency : 'N/A'} MHz
                  </div>
                </Col>
              </Row>

              {/* Receiver Selection (Static for this template) */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Receiver:</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Control
                    as="select"
                    value={selectedReceiver.id}
                    onChange={(e) => handleTuneIn(dummyReceivers.find(r => r.id === parseInt(e.target.value)))}
                    className={`bg-${inputBg} text-${inputText} ${inputBorder}`}
                  >
                    {dummyReceivers.map(r => (
                      <option key={r.id} value={r.id}>
                        #{r.id} {r.name} ({r.frequencyRange})
                      </option>
                    ))}
                  </Form.Control>
                </Col>
              </Row>

              {/* Modes */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Mode:</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Control
                    as="select"
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className={`bg-${inputBg} text-${inputText} ${inputBorder}`}
                  >
                    <option>AM</option>
                    <option>FM</option>
                    <option>USB</option>
                    <option>LSB</option>
                    <option>CW</option>
                    <option>DMR</option>
                    <option>FT8</option>
                  </Form.Control>
                </Col>
              </Row>

              {/* Volume Control */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Volume: {volume}</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Range
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className={`form-range-${theme}`}
                  />
                </Col>
              </Row>

              {/* Squelch Control */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Squelch (SQ): {squelch} dBm</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Range
                    min="-120"
                    max="-30"
                    value={squelch}
                    onChange={(e) => setSquelch(parseInt(e.target.value))}
                    className={`form-range-${theme}`}
                  />
                </Col>
              </Row>

              {/* Bandwidth Selector */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Bandwidth:</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Control
                    as="select"
                    value={bandwidth}
                    onChange={(e) => setBandwidth(e.target.value)}
                    className={`bg-${inputBg} text-${inputText} ${inputBorder}`}
                  >
                    <option>2.4 kHz</option>
                    <option>6 kHz</option>
                    <option>9 kHz</option>
                    <option>12.5 kHz</option>
                    <option>25 kHz</option>
                    <option>100 kHz</option>
                    <option>200 kHz</option>
                  </Form.Control>
                </Col>
              </Row>

              {/* Noise Reduction Control */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Noise Reduction (NR): {noiseReduction}</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Range
                    min="-10"
                    max="10"
                    value={noiseReduction}
                    onChange={(e) => setNoiseReduction(parseInt(e.target.value))}
                    className={`form-range-${theme}`}
                  />
                </Col>
              </Row>

              {/* Record Button */}
              <Row className="mb-3">
                <Col xs={12} md={4}>
                  <Form.Label className="mb-0 fw-bold">Record Audio:</Form.Label>
                </Col>
                <Col xs={12} md={8}>
                  <Button
                    variant={isRecording ? 'danger' : 'success'}
                    onClick={() => setIsRecording(!isRecording)}
                    className="w-100 hover-btn-scale-sm"
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                </Col>
              </Row>

              {/* Time and Signal Level Display */}
              <Row className="mb-3 align-items-center">
                <Col xs={12} md={6}>
                  <div className={`p-2 rounded text-center fw-bold bg-${inputBg} text-${inputText} border border-info`}>
                    Time: {currentTime}
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className={`p-2 rounded text-center fw-bold bg-${inputBg} text-${inputText} border border-info`}>
                    Signal: {currentSignalLevel} dB
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Frequency Spectrum and Station Activity Panel */}
          <Card id="frequency-spectrum-panel" className={`shadow-sm mt-5 p-4 rounded-lg bg-${cardBg} text-${cardText}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h4 fw-bold mb-0">Frequency Spectrum and Station Activity Panel</h3>
                {/* Placeholder for Navigation & Display Tools (top-right icons) */}
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" title="Help" className="hover-btn-scale-sm">?</Button>
                  <Button variant="outline-secondary" size="sm" title="Status" className="hover-btn-scale-sm">S</Button>
                  <Button variant="outline-secondary" size="sm" title="Log" className="hover-btn-scale-sm">L</Button>
                  <Button variant="outline-secondary" size="sm" title="Receiver" className="hover-btn-scale-sm">Rx</Button>
                  <Button variant="outline-secondary" size="sm" title="Map" className="hover-btn-scale-sm">M</Button>
                  <Button variant="outline-secondary" size="sm" title="Files" className="hover-btn-scale-sm">F</Button>
                  <Button variant="outline-secondary" size="sm" title="Settings" className="hover-btn-scale-sm">⚙️</Button>
                </div>
              </div>
              <p className={`${mutedText} small`}>
                Displaying activity for {selectedReceiver.name} ({selectedReceiver.location}, Grid: JN61fw - simulated)
              </p>

              {/* Spectrum Canvas */}
              <h5 className={`mt-4 mb-2 text-${theme === 'light' ? 'primary' : 'info'}`}>Spectrum</h5>
              <div className="spectrum-canvas-container" style={{ position: 'relative', width: '100%', height: '250px', border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`, borderRadius: '4px', overflow: 'hidden', cursor: isDraggingCursor ? 'grabbing' : 'grab' }}>
                <canvas
                  ref={spectrumCanvasRef}
                  width="800"
                  height="250"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave} // Stop dragging if mouse leaves canvas area
                ></canvas>
              </div>

              {/* Waterfall Canvas */}
              <h5 className={`mt-4 mb-2 text-${theme === 'light' ? 'primary' : 'info'}`}>Waterfall</h5>
              <div className="waterfall-canvas-container" style={{ position: 'relative', width: '100%', height: '200px', border: `1px solid ${theme === 'light' ? '#ccc' : '#555'}`, borderRadius: '4px', overflow: 'hidden' }}>
                <canvas ref={waterfallCanvasRef} width="800" height="200" style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
              </div>

              {/* Waterfall Controls */}
              <div className="mt-4">
                <h5 className={`mb-3 text-${theme === 'light' ? 'primary' : 'info'}`}>Waterfall Color Levels (dBm)</h5>
                <Row className="align-items-center mb-3">
                  <Col xs={12} md={2}>
                    <Form.Label className={`mb-0 text-${cardText}`}>Min Level: {waterfallMinLevel} dBm</Form.Label>
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
                    <Form.Label className={`mb-0 text-${cardText}`}>Max Level: {waterfallMaxLevel} dBm</Form.Label>
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

              <p className={`${mutedText} mt-3 small`}>
                This panel displays simulated real-time spectrum and waterfall data, along with station markers. Drag the vertical cursor on the spectrum to simulate tuning.
              </p>
            </Card.Body>
          </Card>
        </>
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

        /* Small button hover effect */
        .hover-btn-scale-sm {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-btn-scale-sm:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Card>
  );
}

export default ReceiverbookContent;

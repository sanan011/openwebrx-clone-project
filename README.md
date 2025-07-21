# OpenWebRX Frontend Simulation

![OpenWebRX Project Banner](https://placehold.co/1200x400/333333/00ff00?text=OpenWebRX+Frontend+Simulation)

## 🌟 Project Overview

This project is a modern, interactive web-based frontend application that simulates the core features and user experience of a Software-Defined Radio (SDR) receiver, heavily inspired by the popular open-source [OpenWebRX](https://www.openwebrx.de/) platform.

**Please Note:** This is purely a **frontend simulation**. All real-time radio data (spectrum, waterfall, signal levels) and receiver controls are dynamically generated and simulated within the browser and are **not** connected to a live SDR backend. The authentication system uses local storage for demonstration purposes and is **not secure for production environments.**

## ✨ Features

* **Dynamic Theme Changer:** Seamlessly switch between elegant Light and Dark modes for enhanced user comfort and aesthetic preference.
* **Single Page Application (SPA) Navigation:** Fluid routing between different sections (Home, About, News, Documentation, Community, Receiverbook) without full page reloads.
* **User Authentication System:** Basic login and registration functionality to manage access to protected content (users are stored in browser's local storage).
* **Receiverbook Explorer:** Browse a list or map view of simulated global SDR receivers.
* **Simulated Spectrum and Waterfall Display:** Real-time-like visualizations of radio frequency activity using HTML Canvas, with dynamic data generation and vibrant color mapping.
* **Interactive Tuning Cursor:** Drag the cursor across the spectrum to simulate tuning to different frequencies, with the displayed frequency updating in real-time.
* **Simulated Station Markers:** Visual indicators for "known" stations on the spectrum, mimicking real SDR interfaces.
* **Comprehensive Receiver Control Panel:** Adjust simulated receiver parameters including:
    * Frequency Display
    * Receiver Selection
    * Modulation Modes (AM, FM, USB, LSB, DMR, etc.)
    * Volume Control
    * Squelch (SQ)
    * Bandwidth Selector
    * Noise Reduction (NR)
    * Record Button (simulated)
    * Real-time Time and Signal Level display

## 🚀 Technologies Used

This project is built with a modern and robust frontend technology stack:

* **React.js:** The core JavaScript library for building the dynamic and interactive user interface.
* **Bootstrap 5:** A powerful CSS framework providing responsive design, pre-built UI components, and a robust grid system.
* **React-Bootstrap:** Re-implements Bootstrap components as React components for seamless integration.
* **Leaflet & React-Leaflet:** Used for the interactive map view in the Receiverbook, enabling display of simulated receiver locations.
* **HTML Canvas API:** Directly utilized for high-performance rendering of the simulated spectrum and waterfall displays.
* **JavaScript (ES6+):** The primary programming language for all application logic, state management (using React Hooks like `useState`, `useEffect`, `useRef`), and interactive features.
* **Local Storage:** Employed for client-side persistence of user authentication data (for demonstration purposes only).

## 📦 Setup and Installation

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (LTS version recommended)
* npm (comes with Node.js) or Yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
    cd YOUR_REPOSITORY_NAME
    ```
    (Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub details.)

2.  **Install NPM packages:**
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Run the application:**
    ```bash
    npm start
    # OR
    yarn start
    ```

The application will open in your default browser at `http://localhost:3000`.

## 💡 Usage

1.  **Authentication:** Upon first launch, you will be directed to the Login/Register page. You can register a new account (e.g., username: `test`, password: `password123`) and then log in.
2.  **Navigation:** Use the navigation bar at the top to switch between different sections of the application.
3.  **Theme Toggle:** Click the "Light Mode" / "Dark Mode" button in the navbar to switch themes.
4.  **Receiverbook:** Navigate to the "Receiverbook" page.
    * Choose between "List View" (tabular display of receivers) and "Map View" (interactive map with markers).
    * Click "Tune In" on any receiver to open the control panels.
5.  **Receiver Controls:**
    * Observe the simulated frequency, time, and signal level.
    * Adjust sliders (Volume, Squelch, Noise Reduction) and dropdowns (Mode, Bandwidth) to see visual changes.
    * Drag the vertical cursor on the "Spectrum" display to simulate tuning to different frequencies.
6.  **Logout:** Click "Logout" in the navbar to return to the authentication page.

## 📂 Project Structure


openwebrx-frontend-simulation/
├── public/                 # Static assets (index.html, favicon, etc.)
├── src/
│   ├── App.js              # Main application component, handles routing and global state
│   ├── index.js            # React entry point
│   ├── ReceiverbookContent.js # Component for Receiverbook, spectrum, waterfall, and controls
│   └── pages/              # Directory for main content pages
│       ├── AuthPage.js     # Login/Register component
│       ├── Home.js         # Home page content
│       ├── About.js        # About page content
│       ├── News.js         # News page content
│       ├── Documentation.js# Documentation page content
│       └── Community.js    # Community page content
├── .gitignore
├── package.json
├── README.md               # This file
└── ...


## ⚠️ Simulations & Limitations

As mentioned, this project is a frontend simulation. Key limitations include:
* **No Real SDR Connection:** All radio data is simulated; there is no actual connection to SDR hardware.
* **Basic Authentication:** User data is stored in `localStorage`, which is not secure for production.
* **Static Data:** Receiver and station marker data are hardcoded.

## 💡 Future Enhancements

* **Integration with Live OpenWebRX Backend:** Connect to a real OpenWebRX server via WebSockets for live audio and data streaming.
* **Advanced Signal Processing:** Implement client-side digital signal processing (DSP) for more realistic filtering, noise reduction, and demodulation.
* **Digital Mode Decoders:** Add decoders for various digital modes (e.g., FT8, DMR, SSTV) to display decoded text/images.
* **User Profiles & Customization:** Allow users to save favorite frequencies, personalize interface layouts, and manage profiles with a proper backend.
* **Search & Filtering:** Implement search and filtering capabilities for the Receiverbook.
* **Mobile Responsiveness Refinements:** Further optimize for smaller screens and touch interactions.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgements

* Inspired by the incredible [OpenWebRX](https://www.openwebrx.de/) project by András Retzler (HA7ILM).
* Built with [React](https://react.dev/) and [Bootstrap](https://getbootstrap.com/).
* Map integration powered by [Leaflet](https://leafletjs.com/) and [React-Leaflet](https://react-leaflet.js.org/).

---

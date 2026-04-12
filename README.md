![SkyTrack Hero Banner](banner.png)

# ✈️ SkyTrack | Premium Flight Explorer

SkyTrack is a sophisticated, real-time flight scouting application designed for precision and clarity. Built with a focus on premium aesthetics and robust performance, it allows users to explore global flight routes, monitor live schedules, and manage travel plans with intuitive intelligence.

## ✨ Key Features

- **🌐 Real-Time Route Intelligence** — Instant access to global flight paths between any two airports, powered by the AirLabs v9 API.
- **🌗 Adaptive Design System** — A high-fidelity interface featuring a seamless Dark Mode toggle, built with a modern, glassmorphic aesthetic.
- **⚡ Proactive Search & Suggestions** — Intelligent autocomplete and debounced search fields ensure a smooth, error-free input experience for over 150+ major airports.
- **🕒 Advanced Temporal Filtering** — Categorize results by Morning, Afternoon, Evening, or Night, and sort by departure time to find the perfect flight.
- **📊 Live Status Updates** — Real-time tracking of delays, active flight states, and landing confirmations for same-day searches.
- **🚀 Performance Optimized** — Smart in-memory caching (TTL-based) to ensure blazing-fast responses and minimal API overhead.

## 🛠️ Architecture & Tech Stack

The project is built using a "Lean-Core" philosophy—leveraging modern browser capabilities without the overhead of heavy frameworks.

- **Frontend**: Vanilla JavaScript (ES6+), Semantic HTML5, CSS3 with custom design tokens.
- **Icons**: [Lucide Icons](https://lucide.dev/) for crisp, consistent iconography.
- **API**: [AirLabs API](https://airlabs.co/) for authoritative aviation data.
- **Logic**: 
  - **Higher-Order Functions**: Extensive use of `.map()`, `.filter()`, and `.sort()` for data normalization.
  - **Debouncing**: Custom implementation to optimize API calls and UI state changes.
  - **State Management**: Lightweight local state for flight data and UI theme persistence.

## 📁 Project Structure

```text
flight_tracker/
├── index.html      ← Main entry point & layout
├── style.css       ← Premium design system & theme variables
├── airports.js     ← Curated dataset of global airports
├── api.js          ← API integration, caching, & normalization
├── app.js          ← Core UI logic & event orchestration
└── README.md       ← Project documentation
```

## 🚀 Getting Started

1.  **Obtain API Credentials**: Sign up at [airlabs.co](https://airlabs.co) to get your free API key.
2.  **Configure API**: Open `api.js` and insert your key into the `API.key` constant.
3.  **Launch**: Open `index.html` in any modern web browser. 
    *Note: No build steps or server environments are required.*
4.  **Explore**: Enter your origin (e.g., `JFK`), destination (e.g., `LHR`), select a date, and begin your search.

## 📈 Learning Objectives

This project serves as a showcase for several core frontend engineering patterns:
- **Asynchronous Data Handling**: Managing multi-step API flows with `async/await`.
- **Closure-based Utilities**: Implementing robust autocomplete logic.
- **CSS Architecture**: using CSS variables for a maintainable, theme-capable design system.
- **Data Integrity**: Handling inconsistent external API responses with defensive programming and default values.

---

*Precision in every flight. Intelligence in every route.*

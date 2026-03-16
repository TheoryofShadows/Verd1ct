# VERD1CT — Prediction Exchange

> **Trade on real-world outcomes. Every resolution is triple-verified, on-chain, and paid out in 60 seconds.**

VERD1CT is a cinematic prediction market platform built with React 18 and Vite. Users buy YES/NO contracts on real-world events — sports, politics, crypto, tech, and more — with instant payouts backed by the Proof Mesh™ resolution system.

---

## Features

- **Proof Mesh™** — Every market resolved by AI analysis + 500-person jury + cryptographic on-chain proof
- **10 Live Markets** across Sports, Politics, Crypto, Tech, Culture, Climate, and Econ
- **Real-time trading** — buy YES/NO contracts with instant balance deduction and portfolio tracking
- **Cinematic UI** — ambient mesh gradients, sparkline charts, glass-morphism modals
- **Leaderboard** — follow top predictors and track all-time ROI
- **Instant withdrawals** — bank, card, crypto, Apple Pay, Google Pay
- **Proof Log** — public, auditable record of every resolved market with cryptographic hash

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | React 18 with hooks                 |
| Build tool  | Vite 5                              |
| Styling     | CSS-in-JS (inline styles) + CSS file for animations |
| Typography  | Outfit (UI) + JetBrains Mono (numbers) via Google Fonts |
| Charts      | Bespoke SVG sparklines              |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# Clone the repo
git clone <repo-url>
cd Verd1ct

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

---

## Project Structure

```
Verd1ct/
├── index.html                  # HTML entry point (fonts, meta tags)
├── vite.config.js              # Vite configuration
├── package.json
└── src/
    ├── main.jsx                # React root mount
    ├── index.css               # Global styles & keyframe animations
    ├── App.jsx                 # Main shell: routing, state, layout
    ├── constants/
    │   ├── colors.js           # Design system color palette
    │   └── data.js             # Market, leader, and resolution log data
    └── components/
        ├── Spark.jsx           # SVG sparkline chart
        ├── ConfBar.jsx         # Confidence / progress bar
        ├── Card.jsx            # Market card with hover effects
        └── Modal.jsx           # Trade modal (trade / proof / social tabs)
```

---

## How Proof Mesh™ Works

1. **AI Analysis** — monitors the declared official source in real time
2. **500 Random Jurors** — verified traders with 90%+ accuracy vote equally
3. **Cryptographic Proof** — immutable hash published at exact resolution moment
4. **60-Second Payout** — funds released automatically on consensus

---

## License

MIT © 2026 VERD1CT

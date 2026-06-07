# BaseOnchain Dashboard

> **Live onchain intelligence for the Base ecosystem** — TVL, top protocols, block data, and market prices in a single, beautiful dashboard.

[![Live Demo](https://img.shields.io/badge/demo-live-0052FF?style=for-the-badge&logo=github)](https://nwfella.github.io/base-onchain-dashboard)
[![Built for Base](https://img.shields.io/badge/built%20for-Base-0052FF?style=for-the-badge&logo=coinbase)](https://base.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

![Dashboard Preview](https://raw.githubusercontent.com/nwfella/base-onchain-dashboard/main/preview.svg)

---

## 📝 Dev.to Tutorial

Read the full walkthrough on how this was built:
👉 **[Building a Base Ecosystem Dashboard: From Zero to Live dApp in a Day](devto-tutorial.md)**

Covers everything: architecture, smart contract deployment, wallet connection, NFT minting, and GitHub Pages deployment.

## ✨ Features

- **🔵 Live Base Chain Stats** — Block height, gas prices, Chain ID via direct RPC connection
- **🏗️ Top Protocols** — Ranked by TVL from DeFiLlama, with 7d change indicators
- **📊 Market Overview** — ETH & BTC prices with 24h changes (CoinGecko + Coinbase API fallback)
- **⛓️ Recent Blocks** — Real-time block feed from the Base RPC
- **📈 Ecosystem Stats** — Protocol count, combined TVL, bridge data, and OP Stack info
- **🌙 Dark Theme** — Coinbase-inspired design system with smooth animations
- **⚡ Auto-refresh** — Block data every 30s, prices every 60s, protocols every 2min

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML/CSS/JS — zero frameworks, zero build step |
| **Blockchain** | Ethers.js 5.7 (Base mainnet RPC) |
| **APIs** | DeFiLlama (protocols/TVL), CoinGecko (prices), Coinbase (fallback) |
| **Design** | Custom design system with CSS custom properties |
| **Deployment** | GitHub Pages (static, no backend needed) |

## 🚀 Quick Start

### View Live

The dashboard is live at **[nwfella.github.io/base-onchain-dashboard](https://nwfella.github.io/base-onchain-dashboard)** — no install required.

### Run Locally

```bash
# Clone the repo
git clone https://github.com/nwfella/base-onchain-dashboard.git
cd base-onchain-dashboard

# Serve locally (any static file server works)
python -m http.server 8000
# or
npx serve
# or
npx live-server
```

Open http://localhost:8000 in your browser. That's it — no build step, no npm install, no API keys needed.

## 🔧 Architecture

```
base-onchain-dashboard/
├── index.html          # Single-file dashboard (HTML + CSS + JS)
├── README.md           # This file
└── LICENSE             # MIT license
```

The entire application is a **single HTML file** — intentional design for maximum portability and minimal maintenance. All data is fetched client-side:

1. **Base RPC** (`ethers.providers.JsonRpcProvider`) → block height, gas prices, recent blocks
2. **DeFiLlama API** → protocol TVL rankings, chain-level TVL, ecosystem stats
3. **CoinGecko API** → ETH/BTC spot prices and 24h changes
4. **Coinbase API** (fallback) → price data if CoinGecko is unavailable

## 📡 Data Sources

- **[Base RPC](https://mainnet.base.org)** — Public JSON-RPC endpoint for onchain data
- **[DeFiLlama](https://defillama.com)** — Open TVL and protocol analytics
- **[CoinGecko](https://coingecko.com)** — Cryptocurrency price data
- **[Coinbase API](https://docs.cloud.coinbase.com)** — Spot price fallback

## 🤝 Contributing

This is a portfolio project aimed at showcasing Base ecosystem development. Contributions, issues, and feature requests are welcome!

**Ideas for improvement:**
- [ ] Add wallet connection (Coinbase Wallet SDK)
- [ ] Add transaction simulator
- [ ] Show gas price history chart
- [ ] Add protocol detail views
- [ ] Integrate CDP SDK for onchain actions

## 📄 License

MIT — feel free to use this as inspiration for your own Base projects.

---

<p align="center">
  Built for the <a href="https://base.org">Base</a> ecosystem · 
  <a href="https://nwfella.github.io/base-onchain-dashboard">Live Demo</a> ·
  <a href="https://docs.base.org">Base Docs</a>
</p>

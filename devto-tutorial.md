---
title: "Building a Base Ecosystem Dashboard: From Zero to Live dApp in a Day"
description: "How I built a live onchain dashboard for Base (Coinbase's L2) with wallet connection, real-time data, and an NFT mint — all in a single HTML file deployed on GitHub Pages."
published: false
tags: [base, coinbase, web3, blockchain, javascript]
canonical_url: https://nwfella.github.io/base-onchain-dashboard/
cover_image: https://raw.githubusercontent.com/nwfella/base-onchain-dashboard/main/preview.svg
---

_This is a portfolio project built while job-hunting for a Developer Relations role at Coinbase. The full source is on [GitHub](https://github.com/nwfella/base-onchain-dashboard), and the live dashboard is **[right here](https://nwfella.github.io/base-onchain-dashboard/)**._

---

## Why I Built This

I wanted to land a Developer Relations role at Coinbase. But my GitHub was mostly forks and a Polymarket tracker — nothing that showed I could **build on Base**, Coinbase's own L2 blockchain.

So I set out to build a single project that would prove I could:

- Build and deploy on the **Base ecosystem**
- Write and deploy **Solidity smart contracts**
- Integrate the **Coinbase Wallet SDK**
- Ship polished, production-quality **frontend code**
- **Document and teach** the whole process

The result? A live **Base Ecosystem Dashboard** with real-time onchain data, clickable blocks linked to BaseScan, wallet connection, and a free NFT mint on Base Sepolia. All in a **single HTML file** deployed on GitHub Pages. No build tools. No backend. No API keys.

Let me walk you through how I built it.

---

## The Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Vanilla HTML/CSS/JS | Zero build step, deploys anywhere |
| **Blockchain** | Ethers.js 5.7 | Battle-tested, works in the browser |
| **Smart Contract** | Solidity 0.8.28 + OpenZeppelin | Industry standard |
| **Wallet** | EIP-1193 (`window.ethereum`) | Works with MetaMask, Coinbase Wallet |
| **APIs** | DeFiLlama, CoinGecko, Base RPC | Free, no API keys needed |
| **Deployment** | GitHub Pages | Free, automatic from repo |
| **Testnet** | Base Sepolia (chain ID 84532) | Free testnet from Coinbase |

The whole thing is **under 900 lines of HTML** — CSS, markup, and JavaScript all in one file. This isn't just a project; it's an ethos. DevRel engineers ship demos that anyone can run with zero setup.

---

## Step 1: The Dashboard

I started with a dark-themed dashboard inspired by Coinbase's design system — blue accents, glassmorphism cards, and a clean grid layout. The hero section shows four live stats pulled from the Base RPC:

```
Chain ID: 8453
Latest Block: 46,970,568
Bridged TVL: $3.81B
Gas Price: 0.006 gwei
```

The chain ID is set immediately (it's static), and everything else loads asynchronously via ethers.js:

```javascript
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');

// Get latest block
const block = await provider.getBlock('latest');
document.getElementById('heroBlockHeight').textContent = formatNumber(block.number);

// Get gas price with precision (L2 fees are tiny!)
const feeData = await provider.getFeeData();
const gwei = parseFloat(ethers.utils.formatUnits(feeData.gasPrice, 'gwei'));
```

**Pro tip:** On L2s like Base, gas prices are measured in **thousand-wei**, not gwei. `0.006 gwei` is about 6,000 wei — completely normal for an OP Stack rollup. Don't format this with `.toFixed(1)` or you'll always get `0.0`!

---

## Step 2: Protocol Rankings with DeFiLlama

The dashboard needed to show what's actually **happening** on Base. DeFiLlama's free API was perfect:

```javascript
const data = await fetchJSON('https://api.llama.fi/protocols');

// Filter for protocols on Base, sorted by TVL
const baseProtocols = data
  .filter(p => p.chains.some(c => c.toLowerCase().includes('base')))
  .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
  .slice(0, 12);
```

This gave me a live, ranked list of top protocols on Base with their TVL and 7-day change. Aerodrome, Uniswap, Morpho — all the heavy hitters.

---

## Step 3: Making Blocks Clickable

Block data from the RPC is just numbers. To make it useful, I linked every block number directly to BaseScan:

```javascript
// In the recent blocks timeline
`<a href="https://basescan.org/block/${block.number}" target="_blank">
  #${formatNumber(block.number)} ↗
</a>`

// And the hero stat
el('heroBlockHeight').innerHTML = 
  `<a href="https://basescan.org/block/${block.number}" ...>
    ${formatNumber(block.number)} ↗
  </a>`;
```

Now anyone can click a block number and verify the data on BaseScan. **Trust, but verify.** This is a DevRel mindset — make everything auditable.

---

## Step 4: The Smart Contract

The crown jewel is the **Base Explorer NFT** — a free mint on Base Sepolia. I wrote a minimal ERC-721 contract that tracks per-address minting:

```solidity
contract BaseExplorer {
    uint256 public constant MAX_SUPPLY = 500;
    uint256 public totalSupply;
    mapping(address => bool) public hasMinted;

    function mint() external returns (uint256) {
        if (totalSupply >= MAX_SUPPLY) revert MaxSupplyReached();
        if (hasMinted[msg.sender]) revert AlreadyMinted();

        totalSupply++;
        hasMinted[msg.sender] = true;
        _owners[totalSupply] = msg.sender;

        emit Minted(msg.sender, totalSupply);
        return totalSupply;
    }
}
```

No OpenZeppelin imports, no complex inheritance — just the bare minimum ERC-721 implementation. For a testnet demo, simpler is better. It's about showing you **understand the primitives**, not that you can copy-paste from OpenZeppelin.

> **Contract deployed at:** [`0x33EA8eCbd652a3464DBb32fBb602f405e7680359`](https://sepolia.basescan.org/address/0x33EA8eCbd652a3464DBb32fBb602f405e7680359) on Base Sepolia

### Compiling

I compiled with `solc` directly — no Hardhat, no Foundry, no Truffle:

```bash
npx solcjs --bin --abi contracts/BaseExplorer.sol -o build
```

The ABI gets embedded directly into the HTML. The bytecode gets deployed via a simple Node.js script using ethers.js:

```javascript
const factory = new ethers.ContractFactory(abi, bytecode, deployer);
const contract = await factory.deploy();
await contract.waitForDeployment();
```

**Total deployment cost on Base Sepolia:** ~0.0003 ETH. That's about <$0.001 at current prices.

---

## Step 5: Wallet Connection

For the wallet connection, I used the **EIP-1193 provider** (`window.ethereum`), which works with any injected wallet — MetaMask, Coinbase Wallet extension, Brave Wallet, etc.

The flow:

1. User clicks **"Connect Wallet"** in the header
2. Wallet prompts for approval
3. We check the chain ID — if not Base Sepolia, we **auto-switch** or **auto-add** the network
4. We set up a `Web3Provider` from ethers.js
5. We create a `Contract` instance with the signer

```javascript
// Auto-switch to Base Sepolia
if (chainId !== '0x14A34') { // 84532 in hex
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x14A34' }]
  });
}
```

The **network switching** is a critical UX detail. Most dApps fail here — they show you an error instead of just doing the switch. In DevRel, you ship demos that **delight**, not frustrate.

---

## Step 6: The Mint Flow

Once connected, the user sees the mint card with:
- Live supply counter (e.g., "Minted: 42 / 500")
- A check if they've already minted (1 per wallet)
- The big gradient **"Mint Your Explorer Badge"** button

```javascript
async function mintNft() {
  const tx = await nftContract.mint();
  // Show pending state with tx hash link
  result.innerHTML = `⏳ Submitted... 
    <a href="https://sepolia.basescan.org/tx/${tx.hash}">View ↗</a>`;

  const receipt = await tx.wait();
  // Find token ID from the Minted event
  const tokenId = receipt.events.find(e => e.event === 'Minted').args.tokenId;
  result.innerHTML = `✅ Minted! Token #${tokenId} ...
    <a href="https://sepolia.basescan.org/token/${CONTRACT_ADDRESS}?a=${tokenId}">View ↗</a>`;
}
```

Every transaction links to BaseScan. Every state is clear: **pending, success, or error.** Good UX isn't optional — it's the whole point of DevRel.

---

## Step 7: Deployment to GitHub Pages

This was the simplest step:

```bash
# Create the repo, push, enable Pages
gh repo create base-onchain-dashboard --public --push
gh api -X POST repos/nwfella/base-onchain-dashboard/pages \
  --input - <<< '{"source":{"branch":"master","path":"/"}}'
```

And that's it. A single `index.html` file, live at `https://nwfella.github.io/base-onchain-dashboard/`. No build step. No CI/CD. No Vercel/Netlify account. Just GitHub.

---

## What I Learned

### 1. L2 gas is different
On Base, `block.baseFeePerGas` is often 0 because the sequencer sets fees differently. Use `provider.getFeeData().gasPrice` instead.

### 2. Chain switching is table stakes
If you're building on a specific L2, your dApp should **auto-switch** the user's wallet. If you don't, 90% of users will bounce.

### 3. Single-file apps are underrated
One HTML file = zero build, zero config, zero deps. For demos, hackathons, and portfolio pieces, this is the way.

### 4. GitHub Pages is instant
No DNS, no SSL certs, no CDN config. `git push` and it's live. Perfect for prototypes.

### 5. Deploy on testnet first
Deploying to Base Sepolia cost me <$0.001 in gas. If I'd gone straight to mainnet, it would've been $50+. Testnets are there for a reason.

---

## Try It Yourself

The dashboard is live at **[nwfella.github.io/base-onchain-dashboard](https://nwfella.github.io/base-onchain-dashboard)**.

1. Open it in your browser
2. Click **Connect Wallet** (MetaMask or Coinbase Wallet)
3. Switch to **Base Sepolia** (auto-prompted)
4. Click **Mint Your Explorer Badge**
5. 🎉 You now own a Base Explorer NFT on testnet

The full source code is on GitHub at **[github.com/nwfella/base-onchain-dashboard](https://github.com/nwfella/base-onchain-dashboard)** — everything from the HTML to the Solidity contract to the deployment script.

---

## What's Next

This project is my portfolio piece for a **Developer Relations Engineer** role at Coinbase. Here's what I'd add next:

- [ ] **Coinbase Wallet SDK** integration (not just `window.ethereum`)
- [ ] **CDP AgentKit** — let an AI agent interact with the contract
- [ ] **IPFS metadata** — real NFT art stored on IPFS
- [ ] **Mainnet deployment** — deploy to Base mainnet for real

---

## The Pitch

If you're reading this and you work at Coinbase — I'm actively looking for a **DevRel Engineer** role. I build things that make developers want to build on Base. I write code that teaches. I ship demos that work.

**[→ Check out my GitHub](https://github.com/nwfella)** · **[→ See the live dashboard](https://nwfella.github.io/base-onchain-dashboard/)**

---

_Built with ❤️ on [Base](https://base.org) · Data from DeFiLlama, CoinGecko, and the Base RPC_

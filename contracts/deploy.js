/**
 * Base Explorer NFT — Deployment Script
 * 
 * Deploys the BaseExplorer contract to Base Sepolia.
 * 
 * Usage:
 *   1. Fund the deployer wallet from Base Sepolia faucet:
 *      https://docs.base.org/docs/tools/faucets/
 *   2. Run: node deploy.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Base Sepolia RPC
const RPC_URL = 'https://sepolia.base.org';
const CHAIN_ID = 84532;

async function main() {
  // Read compiled contract
  const abi = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'build', 'contracts_BaseExplorer_sol_BaseExplorer.abi'), 'utf8')
  );
  const bytecode = '0x' + fs.readFileSync(
    path.join(__dirname, '..', 'build', 'contracts_BaseExplorer_sol_BaseExplorer.bin'), 'utf8'
  ).trim();

  // --- GENERATE DEPLOYER WALLET ---
  // If DEPLOYER_KEY env var is set, use it. Otherwise generate a new one.
  let privateKey = process.env.DEPLOYER_KEY;
  if (!privateKey) {
    const wallet = ethers.Wallet.createRandom();
    privateKey = wallet.privateKey;
    console.log('\n🚀 NEW DEPLOYER WALLET GENERATED');
    console.log('   Address:', wallet.address);
    console.log('   Private Key:', wallet.privateKey);
    console.log('\n📋 STEP 1: Fund this wallet with Base Sepolia ETH');
    console.log('   Go to: https://docs.base.org/docs/tools/faucets/');
    console.log('   Or use: https://www.alchemy.com/faucets/base-sepolia');
    console.log('   You need ~0.001 ETH for deployment (gas is near-free on L2)\n');
    console.log('📋 STEP 2: Re-run with the funded key:');
    console.log(`   DEPLOYER_KEY="${wallet.privateKey}" node deploy.js\n`);
    return;
  }

  // --- CONNECT AND DEPLOY ---
  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'base-sepolia'
  });

  const deployer = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(deployer.address);

  console.log('\n🔑 Deployer:', deployer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.error('\n❌ Deployer wallet has no funds!');
    console.log('   Please fund it from a Base Sepolia faucet first.');
    process.exit(1);
  }

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  console.log('\n⏳ Deploying BaseExplorer contract...');
  
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  const txHash = contract.deploymentTransaction().hash;

  console.log('\n✅ CONTRACT DEPLOYED!');
  console.log('   Address:', contractAddress);
  console.log('   TX Hash:', txHash);
  console.log('   Explorer:', `https://sepolia.basescan.org/address/${contractAddress}`);
  console.log('   Network: Base Sepolia (Chain ID: 84532)\n');

  // Save deployment info
  const deployment = {
    network: 'base-sepolia',
    chainId: CHAIN_ID,
    contractAddress,
    txHash,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    abi,
    bytecode
  };

  fs.writeFileSync(
    path.join(__dirname, 'deployment.json'),
    JSON.stringify(deployment, null, 2)
  );
  console.log('📄 Deployment info saved to deployment.json\n');
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});

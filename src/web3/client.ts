import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { localhost } from 'viem/chains';

import ERC20Mock from './ERC20MockABI.json';
import PotluckVault from './PotluckVaultABI.json';
import PrizePool from './PrizePoolABI.json';

// Use the local hardhat node for testing
export const chain = localhost;

// 1. Setup Public Client (For reading from the blockchain)
export const publicClient = createPublicClient({
    chain,
    // Use http() instead of window.ethereum for public reads so it works even if wallet isn't connected
    transport: http(import.meta.env.VITE_LOCAL_RPC || 'http://127.0.0.1:8545')
});

// 2. Setup Wallet Client (For writing to the blockchain)
// Note: We initialize this lazily in the UI when the user clicks "Connect" 
// because we need their injected browser extension (MetaMask/Rabby).
export const getWalletClient = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found. Please install it.");

    // Request accounts from the extension
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    return createWalletClient({
        chain,
        transport: custom(window.ethereum)
    });
};

export const CONTRACTS = {
    VAULT: import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`,
    USDC: import.meta.env.VITE_MOCK_USDC_ADDRESS as `0x${string}`,
    PRIZE_POOL: import.meta.env.VITE_PRIZE_POOL_ADDRESS as `0x${string}`,
};

export const ABIs = {
    VAULT: PotluckVault.abi,
    USDC: ERC20Mock.abi,
    PRIZE_POOL: PrizePool.abi,
};

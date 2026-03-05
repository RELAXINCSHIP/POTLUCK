# Potluck: App & Codebase Breakdown

This document provides a comprehensive overview of the Potluck application, its architecture, core features, and how it aligns with the 3-Phase Go-To-Market (GTM) strategy.

## 1. Product Overview
Potluck is a prize-linked savings "super-app" built on the Abstract L2 ecosystem. It fixes the boring nature of traditional savings accounts, the extractive nature of lotteries, and the gated nature of premium credit cards. 

**The 3-Phase Rollout Strategy:**
- **Phase 1: The Pot (Live)**. A prize-linked savings account. Users deposit USDC, which generates DeFi yield (via Aave), building a shared prize pool. A provably fair Chainlink VRF draw occurs every 90 days. The user's principal is never at risk.
- **Phase 2: The Meridian (Gated)**. An ultra-premium metal card that unlocks the Rewards ecosystem (travel deals, AMEX-style perks, streak multipliers). 
- **Phase 3: Banking & Wealth (Gated)**. A fully integrated financial hub with checking, high-yield savings, and asset management.

---

## 2. Tech Stack & Architecture
- **Frontend Framework:** React (Vite)
- **Styling:** Vanilla CSS (`index.css`, component-specific CSS) with inline styles for dynamic rendering.
- **Backend / Database:** Supabase (PostgreSQL, Auth, RPC functions).
- **Web3 Integration:** `viem` for interacting with the Abstract L2 testnet/mainnet, connecting to USDC and Vault smart contracts.
- **Fiat / Traditional Finance:** Plaid API integration for linking traditional bank accounts.

---

## 3. Application Structure (`src/App.jsx`)

The entire application runs as a Single Page Application (SPA) driven by state-based routing (`screen` state variable). 

### Main Navigation (`BottomNav`)
The app utilizes a persistent 5-tab bottom navigation bar:
1. **Home (`home`) — "The Pot"**
   - The core Phase 1 experience.
   - Displays the Live Grand Pot (prize pool), countdown timer, user's current streak, entries, and odds.
   - Allows users to watch the live draw via `LiveDrawBroadcast.jsx`.
2. **Money (`savings`) — "Banking & Wealth"**
   - **Current State:** Gated behind `PhaseTwoScreen`.
   - **Future State:** Will house the unified checking account, Plaid-linked asset tracking (`SavingsHome`, `AssetsPage`, `TransactionsPage`), and portfolio performance.
3. **Rewards (`rewards`)**
   - **Current State:** Gated behind `MeridianLockedScreen`. 
   - **Future State:** Houses AMEX-style benefits (Lounge access, dining credits), exclusive travel deals (fetched from API), and streak-based multipliers (e.g., 5-draw streak unlocks 2x entry multiplier).
4. **Community (`community`)**
   - Handles social mechanics. 
   - Features Daily Check-ins for bonus entries, Leaderboards of highest streaks, and Private Syndicates (where 100+ members unlock a dedicated prize pool just for their group).
5. **Profile (`profile`)**
   - User settings, deposit tracking, monthly limits, and linked Plaid accounts.
   - Houses the Admin Growth Simulator to project growth phases.

---

## 4. Key Gating Mechanisms (Phase Rollout)
To ensure the app reflects the strategic roadmap, UI gates have been implemented using React wrapper components inside `App.jsx`:

### `PhaseTwoScreen`
- Wraps the `savings` tab.
- Prevents access to the asset management/banking features.
- Displays a "Phase 2 · Coming Soon" message.
- **Admin Bypass:** Users with the email `kenny6b47@gmail.com` see an "🛠️ Admin: Enter Phase 2" button to bypass this wall for testing.

### `MeridianLockedScreen`
- Wraps the `rewards` tab.
- Prevents access to the travel and perks dashboard.
- Prompts the user to "Unlock The Meridian" which redirects to the `#/meridian` pitch page (`MeridianIdentity.jsx`).
- **Admin Bypass:** Users with the email `kenny6b47@gmail.com` see an "🛠️ Admin: View Rewards" button to bypass this wall.

---

## 5. Web3 & Smart Contract Flow
Handled in `web3/client.js` and `App.jsx` (`DepositScreen` and Draw logic).
1. **Deposits:** Users can deposit Fiat (via Plaid ACH simulation) or Crypto. Crypto deposits trigger a `viem` `simulateContract` / `writeContract` flow to approve USDC and deposit it into the Potluck Vault contract.
2. **Draw Execution:** A mock smart-contract execution flow exists to sweep yield from the Vault to the Prize Pool, and then trigger the VRF draw. (Currently falls back to a demo winner for frontend showcase purposes).

---

## 6. Supabase Backend Integration (`api.js`)
All persistent state is stored in Supabase:
- `users`: Balances, total entries, name, location.
- `draws`: Global state of current mini and grand draws (countdown, prize pool).
- `streaks`: Tracks consecutive draws entered.
- `syndicates`: Tracks pool unlocking and members for group gameplay.
- **RPC Functions:** Complex database transactions (like executing a draw, depositing funds, checking in daily) are handled via stored procedures (`.sql` files in the root repo) called from the frontend.

---

## Summary for Claude
This codebase is a highly polished, V3-ready React prototype connected to a live Supabase backend and Web3 testnet tools. It uses **Admin-bypassable UI Gates** to hide Phase 2 features (Banking) and requires the **Meridian Card** to unlock Rewards, perfectly aligning the technical architecture with the business's Go-To-Market and product timing strategy.

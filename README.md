### VIDEO DEMO WITH COMMENTARY: https://youtu.be/kt3_NVAyZpo
### LIVE DEPLOYED APP: https://shadow-bid.vercel.app/

---

# ShadowBid

A sealed-bid auction protocol built on Solana, leveraging Inco Lightning for confidential computing. ShadowBid enables truly private auctions where bid amounts remain encrypted throughout the entire auction lifecycle, ensuring fairness, preventing front-running, and preserving bidder privacy.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Technical Architecture](#technical-architecture)
- [Inco Lightning Integration](#inco-lightning-integration)
- [Smart Contract Design](#smart-contract-design)
- [User Flow](#user-flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Overview

ShadowBid is a decentralized sealed-bid auction platform where:

- All bids are encrypted client-side and stored on-chain as encrypted handles
- No party (including validators, other bidders, or the seller) can view bid amounts
- Winner determination occurs entirely through encrypted computation
- Only the winning bid amount is revealed at settlement
- Losing bids are never exposed

This implementation targets the **DeFi** category of the Inco Privacy Hackathon, demonstrating how confidential computing can solve real problems in decentralized finance where information asymmetry and front-running are persistent challenges.

---

## Problem Statement

Traditional blockchain auctions suffer from several fundamental issues:

### Transparency Problem
On public blockchains, all transaction data is visible. In standard auction implementations, bid amounts are publicly readable, creating multiple attack vectors:

1. **Front-running**: Miners/validators can see pending bids and front-run with their own higher bids
2. **Bid sniping**: Competitors can observe bids and place last-second higher bids
3. **Strategic underbidding**: Bidders wait to see others' bids before placing minimal winning bids
4. **Collusion**: Multiple parties can coordinate based on visible bid information

### Commit-Reveal Limitations
The traditional workaround uses commit-reveal schemes:
1. Bidders submit hash commitments of their bids
2. After bidding closes, bidders reveal their actual bids

This approach has significant drawbacks:
- Requires two separate transactions from each bidder
- Bidders can choose not to reveal losing bids (griefing)
- Complex timeout and penalty mechanisms needed
- Still vulnerable during the reveal phase

---

## Solution

ShadowBid eliminates these problems through Inco Lightning's confidential computing:

### Single-Transaction Bidding
Bidders encrypt their bid client-side and submit in a single transaction. No reveal phase required.

### Encrypted Winner Determination
The smart contract compares encrypted bids using Inco's homomorphic operations (`e_ge`, `e_select`). The winner is determined without ever decrypting individual bids.

### Selective Disclosure
Only the winner can decrypt their own bid (via Inco's `allow` mechanism), and only after they've been confirmed as the winner.

### Attested Settlement
The winner proves their decrypted bid amount through Inco's TEE-backed attestation, enabling trustless payment transfer.

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Next.js App   │    │  Inco SDK       │    │ Solana Wallet   │         │
│  │                 │◄──►│  (Encryption)   │◄──►│   Adapter       │         │
│  └────────┬────────┘    └─────────────────┘    └─────────────────┘         │
│           │                                                                  │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SOLANA BLOCKCHAIN                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        ShadowBid Program                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Auction   │  │     Bid     │  │ Instruction │  │   Events   │ │   │
│  │  │   Account   │  │   Account   │  │  Handlers   │  │            │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 │ CPI                                       │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Inco Lightning Program                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │ new_euint128│  │    e_ge     │  │  e_select   │  │   allow    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INCO TEE NETWORK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    ┌───────────────────┐    ┌──────────────────┐    │
│  │  Encrypted Value  │    │   Homomorphic     │    │    Attested      │    │
│  │     Storage       │    │    Operations     │    │   Decryption     │    │
│  └───────────────────┘    └───────────────────┘    └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Encryption**: Client encrypts bid using Inco's public key via `encryptValue()`
2. **Storage**: Encrypted ciphertext is converted to a handle via `new_euint128` CPI
3. **Computation**: Winner determined via `e_ge` (comparison) and `e_select` (conditional update)
4. **Permission**: Winner granted decryption rights via `allow`
5. **Decryption**: Winner decrypts their bid through Inco's TEE using `decrypt()`
6. **Settlement**: On-chain verification via `is_validsignature` and SOL transfer

---

## Inco Lightning Integration

### Overview

Inco Lightning provides confidential computing infrastructure for Solana. It enables programs to work with encrypted data through a Cross-Program Invocation (CPI) interface, where the actual cryptographic operations occur in a Trusted Execution Environment (TEE).

**Inco Lightning Program ID**: `5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj`

### Encrypted Types Used

| Type | Description | Usage in ShadowBid |
|------|-------------|-------------------|
| `Euint128` | 128-bit encrypted unsigned integer | Stores encrypted bid amounts |
| `Ebool` | Encrypted boolean | Result of bid comparisons |

### CPI Operations

#### `new_euint128`
Converts client-encrypted ciphertext into an on-chain handle.

```rust
use inco_lightning::cpi::new_euint128;
use inco_lightning::types::Euint128;

let cpi_ctx = CpiContext::new(
    ctx.accounts.inco_lightning_program.to_account_info(),
    Operation {
        signer: ctx.accounts.bidder.to_account_info(),
    },
);

let encrypted_amount: Euint128 = new_euint128(cpi_ctx, ciphertext, 0)?;
bid.encrypted_amount = encrypted_amount.0;
```

#### `e_ge` (Encrypted Greater-Than-Or-Equal)
Compares two encrypted values, returning an encrypted boolean.

```rust
use inco_lightning::cpi::e_ge;
use inco_lightning::types::Ebool;

let is_higher_or_equal: Ebool = e_ge(cpi_ctx, this_bid, current_highest, 0)?;
```

#### `e_select` (Encrypted Conditional Selection)
Conditionally selects between two encrypted values based on an encrypted boolean.

```rust
use inco_lightning::cpi::e_select;

let new_highest: Euint128 = e_select(
    cpi_ctx,
    is_higher_or_equal,  // condition
    this_bid,            // if true
    current_highest,     // if false
    0,
)?;
```

#### `allow`
Grants decryption permission to a specific address for a specific handle.

```rust
use inco_lightning::cpi::accounts::Allow;
use inco_lightning::cpi::allow;

let cpi_ctx = CpiContext::new(
    ctx.accounts.inco_lightning_program.to_account_info(),
    Allow {
        allowance_account: ctx.accounts.allowance_account.to_account_info(),
        signer: ctx.accounts.caller.to_account_info(),
        allowed_address: ctx.accounts.winner_address.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    },
);

allow(cpi_ctx, auction.highest_bid_handle, true, auction.current_leader)?;
```

#### `is_validsignature`
Verifies TEE attestation that proves correct decryption.

```rust
use inco_lightning::cpi::accounts::VerifySignature;
use inco_lightning::cpi::is_validsignature;

let cpi_ctx = CpiContext::new(
    ctx.accounts.inco_lightning_program.to_account_info(),
    VerifySignature {
        instructions: ctx.accounts.instructions.to_account_info(),
        signer: ctx.accounts.winner.to_account_info(),
    },
);

is_validsignature(
    cpi_ctx,
    1,                           // expected signature count
    Some(vec![handle_bytes]),    // handles being verified
    Some(vec![plaintext_bytes]), // claimed plaintext values
)?;
```

### Client-Side Encryption

```typescript
import { encryptValue } from "@inco/solana-sdk/encryption";
import { hexToBuffer } from "@inco/solana-sdk/utils";

// Encrypt bid amount
const bidAmountLamports = BigInt(1_000_000_000); // 1 SOL
const encryptedHex = await encryptValue(bidAmountLamports);
const ciphertext = hexToBuffer(encryptedHex);
```

### Attested Decryption

```typescript
import { decrypt } from "@inco/solana-sdk/attested-decrypt";
import { handleToBuffer, plaintextToBuffer } from "@inco/solana-sdk/utils";

// Decrypt with proof for on-chain verification
const result = await decrypt([handle.toString()], {
  address: publicKey,
  signMessage: wallet.signMessage,
});

// result contains:
// - plaintexts[0]: The decrypted value
// - handles[0]: The handle that was decrypted
// - signatures[0]: The TEE attestation signature
// - ed25519Instructions: Instructions for on-chain verification
```

---

## Smart Contract Design

### Account Structures

#### Auction Account
Stores all auction metadata and state. Derived as a PDA using seeds `["auction", seller, auction_id]`.

| Field | Type | Size | Description |
|-------|------|------|-------------|
| `seller` | `Pubkey` | 32 | Creator of the auction |
| `item_mint` | `Pubkey` | 32 | Optional NFT being auctioned |
| `title` | `[u8; 64]` | 64 | Human-readable title |
| `description` | `[u8; 256]` | 256 | Auction description |
| `reserve_price` | `u64` | 8 | Minimum acceptable bid (lamports) |
| `start_time` | `i64` | 8 | Unix timestamp when bidding opens |
| `end_time` | `i64` | 8 | Unix timestamp when bidding closes |
| `state` | `AuctionState` | 1 | Current lifecycle state |
| `bid_count` | `u32` | 4 | Total bids placed |
| `bids_processed` | `u32` | 4 | Bids processed in winner determination |
| `highest_bid_handle` | `u128` | 16 | Encrypted handle of current highest bid |
| `current_leader` | `Pubkey` | 32 | Address of current leading bidder |
| `winner` | `Pubkey` | 32 | Final winner (set after finalization) |
| `winning_amount` | `u64` | 8 | Revealed winning amount (set after settlement) |
| `auction_id` | `u64` | 8 | Unique identifier |
| `bump` | `u8` | 1 | PDA bump seed |

**Total Space**: 8 (discriminator) + 504 = 512 bytes

#### Bid Account
Stores individual encrypted bids. Derived as a PDA using seeds `["bid", auction, bidder]`.

| Field | Type | Size | Description |
|-------|------|------|-------------|
| `auction` | `Pubkey` | 32 | Associated auction |
| `bidder` | `Pubkey` | 32 | Bidder's address |
| `encrypted_amount` | `u128` | 16 | Inco handle to encrypted bid |
| `created_at` | `i64` | 8 | First bid timestamp |
| `updated_at` | `i64` | 8 | Last update timestamp |
| `processed` | `bool` | 1 | Whether processed in winner determination |
| `bump` | `u8` | 1 | PDA bump seed |

**Total Space**: 8 (discriminator) + 98 = 106 bytes

### Auction State Machine

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AuctionState {
    Open,              // Auction is open for bidding
    Closed,            // Bidding period has ended, awaiting winner determination
    WinnerDetermined,  // Winner confirmed, awaiting settlement
    Settled,           // Auction completed, payment transferred
    Cancelled,         // Auction was cancelled
}
```

```
                    ┌──────────────┐
                    │    Open      │◄──── create_auction
                    └──────┬───────┘
                           │
              end_time reached, close_bidding called
                           │
                           ▼
    ┌──────────────┐     ┌──────────────┐
    │  Cancelled   │◄────│    Closed    │
    └──────────────┘     └──────┬───────┘
         ▲                      │
         │         all bids processed, finalize_winner called
         │                      │
         │                      ▼
         │               ┌──────────────────┐
         └───────────────│ WinnerDetermined │
        (if no winner)   └────────┬─────────┘
                                  │
                     winner calls settle_auction with proof
                                  │
                                  ▼
                         ┌──────────────┐
                         │   Settled    │
                         └──────────────┘
```

### Instructions

| Instruction | Caller | Description |
|-------------|--------|-------------|
| `create_auction` | Seller | Creates new auction with parameters |
| `place_bid` | Bidder | Places or updates an encrypted bid |
| `close_bidding` | Anyone | Closes bidding after end_time (permissionless) |
| `determine_winner` | Anyone | Processes one bid for comparison (permissionless) |
| `finalize_winner` | Anyone | Confirms winner and grants decrypt permission |
| `settle_auction` | Winner | Verifies decryption proof and transfers payment |
| `cancel_auction` | Seller | Cancels auction (only before winner determined) |

---

## User Flow

### End-to-End Auction Lifecycle

#### Phase 1: Auction Creation
1. Seller connects wallet
2. Seller fills in auction details (title, description, reserve price, duration)
3. Frontend derives Auction PDA address using `findAuctionPda(seller, auctionId)`
4. Transaction calls `create_auction` with parameters
5. Auction account is created in `Open` state
6. `AuctionCreated` event is emitted

#### Phase 2: Bidding
1. Bidder views auction details (reserve price is public)
2. Bidder enters bid amount (must be >= reserve price)
3. Frontend encrypts bid using `encryptBid(amountLamports)`
4. Frontend derives Bid PDA using `findBidPda(auction, bidder)`
5. Transaction calls `place_bid` with ciphertext
6. On-chain: `new_euint128` CPI creates encrypted handle
7. Bid account stores handle; auction updates `bid_count`
8. If first bid: `highest_bid_handle` and `current_leader` are set
9. Bidder can update bid by calling `place_bid` again (same PDA)
10. `BidPlaced` or `BidUpdated` event is emitted

#### Phase 3: Close Bidding
1. After `end_time`, anyone can call `close_bidding`
2. If `bid_count > 0`: auction state → `Closed`
3. If `bid_count == 0`: auction state → `Cancelled`
4. `BiddingClosed` event is emitted

#### Phase 4: Winner Determination
1. For each bid, anyone calls `determine_winner` with that bid's account
2. On-chain encrypted comparison:
   - `e_ge` compares current bid against `highest_bid_handle`
   - `e_select` conditionally updates `highest_bid_handle`
   - `current_leader` is updated if this bid is higher
3. `processed` flag is set to prevent double-counting
4. Process repeats until all bids are processed
5. `BidProcessed` event is emitted for each bid
6. **Note**: The actual bid values remain encrypted throughout

#### Phase 5: Finalization
1. After `bids_processed >= bid_count`, anyone calls `finalize_winner`
2. `winner` is set to `current_leader`
3. Allowance PDA is derived: `findAllowancePda(highestBidHandle, currentLeader)`
4. `allow` CPI grants winner decryption permission for their bid
5. Auction state → `WinnerDetermined`
6. `WinnerDetermined` event is emitted

#### Phase 6: Settlement
1. Winner requests decryption from Inco TEE via `decryptWithProof()`
2. TEE returns plaintext value with Ed25519 attestation signature
3. Winner calls `settle_auction` with:
   - `handle_bytes` (the encrypted bid handle as bytes)
   - `plaintext_bytes` (the decrypted amount as bytes)
   - Transaction includes Ed25519 verification instructions from SDK
4. On-chain verification:
   - `is_validsignature` verifies TEE attestation
   - Amount validated against `reserve_price`
5. SOL transferred from winner to seller
6. Auction state → `Settled`
7. `AuctionSettled` event is emitted

### Sequence Diagram

```
Seller          Frontend        ShadowBid       Inco Lightning      Bidder A        Bidder B
  │                │               │                  │                 │               │
  │──create───────►│               │                  │                 │               │
  │                │──create_auction──►               │                 │               │
  │                │◄──────────────│                  │                 │               │
  │                │               │                  │                 │               │
  │                │               │                  │            bid 5 SOL            │
  │                │               │                  │◄──encryptValue──│               │
  │                │               │                  │──ciphertext────►│               │
  │                │               │◄───place_bid────────────────────────│               │
  │                │               │──new_euint128───►│                 │               │
  │                │               │◄────handle───────│                 │               │
  │                │               │                  │                 │               │
  │                │               │                  │                 │          bid 7 SOL
  │                │               │                  │◄───────encryptValue──────────────│
  │                │               │                  │────────ciphertext───────────────►│
  │                │               │◄──────────────place_bid─────────────────────────────│
  │                │               │──new_euint128───►│                 │               │
  │                │               │◄────handle───────│                 │               │
  │                │               │                  │                 │               │
  │                │               │                  │    [end_time reached]           │
  │                │               │                  │                 │               │
  │                │◄──close_bidding──────────────────│                 │               │
  │                │               │                  │                 │               │
  │                │◄─determine_winner(bid_a)─────────│                 │               │
  │                │               │──e_ge, e_select─►│                 │               │
  │                │               │◄────results──────│                 │               │
  │                │               │                  │                 │               │
  │                │◄─determine_winner(bid_b)─────────│                 │               │
  │                │               │──e_ge, e_select─►│                 │               │
  │                │               │◄────results──────│  (B now leads)  │               │
  │                │               │                  │                 │               │
  │                │◄─finalize_winner─────────────────│                 │               │
  │                │               │──allow(B)───────►│                 │               │
  │                │               │                  │                 │               │
  │                │               │                  │◄─────decrypt────────────────────│
  │                │               │                  │─────plaintext+sig──────────────►│
  │                │               │◄──────────────settle_auction(proof)────────────────│
  │                │               │──is_validsignature──►│             │               │
  │                │               │◄─────valid───────│                 │               │
  │                │               │                  │                 │               │
  │◄───7 SOL───────│◄──────────────│                  │                 │               │
  │                │               │                  │                 │               │
```

---

## Project Structure

```
shadowbid/
├── programs/
│   └── shadowbid/
│       ├── src/
│       │   ├── lib.rs                    # Program entrypoint, declares all instructions
│       │   ├── constants.rs              # PDA seeds, duration limits, program IDs
│       │   ├── errors.rs                 # Custom error definitions (ShadowBidError enum)
│       │   ├── events.rs                 # Anchor events for indexing
│       │   ├── state/
│       │   │   ├── mod.rs
│       │   │   ├── auction.rs            # Auction account structure and methods
│       │   │   └── bid.rs                # Bid account structure and methods
│       │   └── instructions/
│       │       ├── mod.rs
│       │       ├── create_auction.rs     # Auction creation logic
│       │       ├── place_bid.rs          # Bid placement with encryption CPI
│       │       ├── close_bidding.rs      # Close bidding period
│       │       ├── determine_winner.rs   # Encrypted comparison logic (e_ge, e_select)
│       │       ├── finalize_winner.rs    # Grant decrypt permission (allow)
│       │       ├── settle_auction.rs     # Verify proof and transfer (is_validsignature)
│       │       └── cancel_auction.rs     # Auction cancellation
│       ├── Cargo.toml
│       └── Xargo.toml
├── app/
│   ├── src/
│   │   ├── app/                          # Next.js App Router pages
│   │   │   ├── layout.tsx                # Root layout with providers
│   │   │   ├── page.tsx                  # Home page - all auctions list
│   │   │   ├── globals.css               # Global styles and Tailwind
│   │   │   ├── auction/
│   │   │   │   ├── create/page.tsx       # Create auction page
│   │   │   │   └── [id]/page.tsx         # Auction detail page with bidding
│   │   │   ├── my-auctions/
│   │   │   │   └── page.tsx              # User's created auctions
│   │   │   └── my-bids/
│   │   │       └── page.tsx              # User's placed bids
│   │   ├── components/
│   │   │   ├── auction/
│   │   │   │   ├── AuctionCard.tsx       # Auction preview card component
│   │   │   │   ├── AuctionActions.tsx    # Action buttons (close, process, settle)
│   │   │   │   ├── CreateAuctionForm.tsx # Auction creation form
│   │   │   │   └── BidForm.tsx           # Bid submission form with encryption
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx            # Navigation header
│   │   │   │   └── Footer.tsx            # Page footer
│   │   │   ├── providers/
│   │   │   │   ├── index.tsx             # Combined providers wrapper
│   │   │   │   ├── WalletProvider.tsx    # Solana wallet context
│   │   │   │   └── QueryProvider.tsx     # React Query context
│   │   │   └── ui/
│   │   │       ├── Card.tsx              # Reusable card components
│   │   │       └── Countdown.tsx         # Auction countdown timer
│   │   ├── hooks/
│   │   │   ├── useAuction.ts             # Single auction fetching hook
│   │   │   ├── useAuctions.ts            # Auction list fetching hook
│   │   │   └── useEncryption.ts          # Inco encryption hooks
│   │   └── lib/
│   │       ├── constants.ts              # Program IDs, network config, helpers
│   │       ├── encryption.ts             # Inco SDK wrappers (encrypt, decrypt)
│   │       ├── pda.ts                    # PDA derivation helpers
│   │       ├── program.ts                # Anchor program instance
│   │       ├── utils.ts                  # General utilities
│   │       └── idl/
│   │           ├── shadowbid.json        # Generated IDL
│   │           └── shadowbid.ts          # TypeScript IDL types
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── next.config.mjs
│   └── tsconfig.json
├── tests/
│   └── shadowbid.ts                      # Integration tests
├── Anchor.toml                           # Anchor configuration
├── Cargo.toml                            # Rust workspace
├── Cargo.lock
├── package.json                          # Root package
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Rust | Latest stable | [rustup.rs](https://rustup.rs/) |
| Solana CLI | 1.18+ | [docs.solana.com](https://docs.solana.com/cli/install-solana-cli-tools) |
| Anchor | 0.31.1 | `avm install 0.31.1 && avm use 0.31.1` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Included with Node.js |

### Installation

```bash
# Clone the repository
git clone https://github.com/Ge0frey/shadowbid
cd shadowbid

# Install root dependencies
npm install

# Install frontend dependencies
cd app && npm install && cd ..

# Build the Solana program
anchor build

# Copy IDL to frontend
npm run copy-idl
```

### Configuration

1. **Configure Solana CLI for Devnet**
   ```bash
   solana config set --url devnet
   ```

2. **Create or use existing wallet**
   ```bash
   # Create new wallet
   solana-keygen new -o ~/.config/solana/shadowbid.json
   
   # Fund wallet
   solana airdrop 5 --keypair ~/.config/solana/shadowbid.json
   ```

3. **Update Anchor.toml wallet path** (if needed)
   ```toml
   [provider]
   cluster = "devnet"
   wallet = "~/.config/solana/shadowbid.json"
   ```

4. **Configure RPC URL (Optional)**
   
   Create `app/.env.local` with your preferred RPC:
   ```bash
   # Copy the example env file
   cp app/.env.example app/.env.local
   
   # Edit with your RPC URL (Helius recommended for better rate limits)
   NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=your-api-key
   ```
   
   > The app falls back to the public Solana devnet RPC if no custom RPC is configured.

### Deployment

```bash
# Deploy to Devnet
anchor deploy

# Note the Program ID from output
# Update in these files if it changed:
# - programs/shadowbid/src/lib.rs (declare_id!)
# - Anchor.toml ([programs.devnet])
# - app/src/lib/constants.ts (SHADOWBID_PROGRAM_ID)

# Rebuild after updating Program ID
anchor build
```

**Current Deployed Program ID**: `GGanQwYdzturA2hMuPbR69toMaiHPaGox86YifLjMVzQ`

### Running the Frontend

```bash
cd app
npm run dev
```

Access the application at `http://localhost:3000`

---

## API Reference

### Program Instructions

#### `create_auction`

Creates a new sealed-bid auction.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `auction_id` | `u64` | Unique identifier for PDA derivation |
| `title` | `String` | Auction title (max 64 bytes) |
| `description` | `String` | Auction description (max 256 bytes) |
| `reserve_price` | `u64` | Minimum bid in lamports |
| `duration` | `i64` | Auction duration (120 - 604800 seconds) |
| `item_mint` | `Option<Pubkey>` | Optional NFT mint address |

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `seller` | `Signer, Mut` | Auction creator, pays rent |
| `auction` | `Init` | Auction PDA (seeds: `["auction", seller, auction_id]`) |
| `system_program` | `Program` | System program |

**Constraints:**
- `title.len() <= 64`
- `description.len() <= 256`
- `duration >= 120` (2 minutes minimum for testing)
- `duration <= 604800` (7 days maximum)
- `reserve_price > 0`

---

#### `place_bid`

Places or updates an encrypted bid.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `ciphertext` | `Vec<u8>` | Encrypted bid amount from Inco SDK |

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `bidder` | `Signer, Mut` | Bidder, pays rent for new bids |
| `auction` | `Mut` | Target auction |
| `bid` | `InitIfNeeded` | Bid PDA (seeds: `["bid", auction, bidder]`) |
| `inco_lightning_program` | `Program` | Inco Lightning for `new_euint128` |
| `system_program` | `Program` | System program |

**Constraints:**
- `auction.state == Open`
- `auction.seller != bidder` (seller cannot bid)
- `auction.is_bidding_open(current_time)`

---

#### `close_bidding`

Closes the bidding period. Permissionless after `end_time`.

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `caller` | `Signer, Mut` | Any account |
| `auction` | `Mut` | Auction to close |

**Constraints:**
- `auction.state == Open`
- `current_time >= auction.end_time`

**Behavior:**
- If `bid_count > 0`: state → `Closed`
- If `bid_count == 0`: state → `Cancelled`

---

#### `determine_winner`

Processes one bid for winner determination using encrypted comparison.

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `caller` | `Signer, Mut` | Any account (permissionless) |
| `auction` | `Mut` | Auction being processed |
| `bid` | `Mut` | Bid to process |
| `inco_lightning_program` | `Program` | Inco Lightning for `e_ge`, `e_select` |

**Constraints:**
- `auction.state == Closed`
- `bid.auction == auction.key()`
- `bid.processed == false`

**Behavior:**
1. Compares bid against `highest_bid_handle` using `e_ge`
2. Updates `highest_bid_handle` using `e_select`
3. Updates `current_leader` if this bid is higher
4. Marks bid as processed
5. Increments `bids_processed`

---

#### `finalize_winner`

Confirms winner and grants decryption permission.

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `caller` | `Signer, Mut` | Any account (permissionless) |
| `auction` | `Mut` | Auction to finalize |
| `allowance_account` | `Mut, Unchecked` | Inco allowance PDA |
| `winner_address` | `Unchecked` | The winner's address |
| `inco_lightning_program` | `Program` | Inco Lightning for `allow` |
| `system_program` | `Program` | System program |

**Constraints:**
- `auction.state == Closed`
- `auction.all_bids_processed()`
- `winner_address == auction.current_leader`
- `auction.current_leader != Pubkey::default()`

**Behavior:**
1. Calls `allow(highest_bid_handle, true, current_leader)`
2. Sets `winner = current_leader`
3. State → `WinnerDetermined`

---

#### `settle_auction`

Settles auction with attested decryption proof.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `handle_bytes` | `Vec<u8>` | Winning bid handle (16 bytes LE) |
| `plaintext_bytes` | `Vec<u8>` | Decrypted amount (16 bytes LE) |

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `winner` | `Signer, Mut` | Auction winner |
| `auction` | `Mut` | Auction to settle |
| `seller` | `Mut, Unchecked` | Payment recipient |
| `instructions` | `Unchecked` | Instructions sysvar |
| `inco_lightning_program` | `Program` | Inco Lightning for `is_validsignature` |
| `system_program` | `Program` | System program |

**Constraints:**
- `winner.key() == auction.winner`
- `auction.state == WinnerDetermined`
- `seller.key() == auction.seller`
- `winning_amount >= auction.reserve_price`
- Ed25519 signature verification passes

**Behavior:**
1. Verifies TEE attestation via `is_validsignature`
2. Parses `winning_amount` from plaintext bytes
3. Transfers SOL from winner to seller
4. Sets `winning_amount` on auction
5. State → `Settled`

---

#### `cancel_auction`

Cancels an auction (seller only).

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `reason` | `String` | Cancellation reason |

**Accounts:**
| Account | Type | Description |
|---------|------|-------------|
| `seller` | `Signer, Mut` | Must be auction seller |
| `auction` | `Mut` | Auction to cancel |

**Constraints:**
- `seller.key() == auction.seller`
- `auction.state == Open || auction.state == Closed`
- If `Closed` with bids: `bids_processed == 0`
- If `Open` with bids: `current_time >= end_time`

---

### Events

| Event | Fields | Description |
|-------|--------|-------------|
| `AuctionCreated` | `auction`, `seller`, `title`, `reserve_price`, `start_time`, `end_time` | New auction created |
| `BidPlaced` | `auction`, `bidder`, `bid_number`, `timestamp` | New bid placed |
| `BidUpdated` | `auction`, `bidder`, `timestamp` | Existing bid updated |
| `BiddingClosed` | `auction`, `total_bids`, `timestamp` | Bidding period ended |
| `BidProcessed` | `auction`, `bidder`, `bids_processed` | Bid processed in winner determination |
| `WinnerDetermined` | `auction`, `winner`, `timestamp` | Final winner confirmed |
| `AuctionSettled` | `auction`, `winner`, `winning_amount`, `timestamp` | Auction settled, payment transferred |
| `AuctionCancelled` | `auction`, `seller`, `reason`, `timestamp` | Auction cancelled |

---

### Error Codes

| Error | Code | Description |
|-------|------|-------------|
| `DurationTooShort` | 6000 | Auction duration < 120 seconds |
| `DurationTooLong` | 6001 | Auction duration > 604800 seconds |
| `AuctionNotStarted` | 6002 | Auction hasn't started yet |
| `BiddingNotEnded` | 6003 | Bidding period hasn't ended |
| `BiddingEnded` | 6004 | Bidding period has ended |
| `AuctionNotOpen` | 6005 | Auction is not in Open state |
| `AuctionNotClosed` | 6006 | Auction is not in Closed state |
| `WinnerNotDetermined` | 6007 | Winner hasn't been determined |
| `AuctionAlreadySettled` | 6008 | Auction already settled/cancelled |
| `AuctionCancelled` | 6009 | Auction was cancelled |
| `NoBidsPlaced` | 6010 | No bids were placed |
| `NotSeller` | 6011 | Caller is not the seller |
| `NotWinner` | 6012 | Caller is not the winner |
| `SellerCannotBid` | 6013 | Seller cannot bid on own auction |
| `BidAuctionMismatch` | 6014 | Bid doesn't belong to auction |
| `BidAlreadyProcessed` | 6015 | Bid already processed |
| `InvalidBidCiphertext` | 6016 | Invalid encrypted bid data |
| `TitleTooLong` | 6017 | Title exceeds 64 bytes |
| `DescriptionTooLong` | 6018 | Description exceeds 256 bytes |
| `InvalidReservePrice` | 6019 | Reserve price must be > 0 |
| `EncryptionFailed` | 6020 | Failed to create encrypted handle |
| `ComparisonFailed` | 6021 | Failed to compare encrypted values |
| `AttestationVerificationFailed` | 6022 | Failed to verify attestation |
| `InvalidDecryptionProof` | 6023 | Invalid decryption proof |
| `WinnerNotSet` | 6024 | Winner has not been set |
| `InsufficientRemainingAccounts` | 6025 | Missing required accounts |

---

## Security Considerations

### Implemented Protections

| Threat | Mitigation |
|--------|------------|
| **Front-running** | All bids encrypted; validators cannot read bid amounts |
| **Bid sniping** | Encrypted bids prevent strategic last-second bidding |
| **Collusion** | Bid amounts invisible to all parties including other bidders |
| **Replay attacks** | PDA-based bid accounts prevent duplicate bids |
| **Double processing** | `processed` flag prevents bids from being counted twice |
| **Seller self-bidding** | Constraint prevents seller from bidding on own auction |
| **Invalid decryption** | TEE attestation via `is_validsignature` ensures correct decryption |
| **Reserve manipulation** | Reserve price is immutable after creation |
| **Unauthorized settlement** | Only verified winner can settle |

### Trust Assumptions

1. **Inco TEE Network**: Trusted to correctly perform encrypted operations and provide valid attestations
2. **Solana Validators**: Trusted for transaction ordering (but cannot see encrypted data)
3. **Client-side Encryption**: Users must use official SDK for proper encryption

### Known Limitations

1. **Gas Costs**: Winner determination requires N transactions for N bids
2. **Timing**: Relies on Solana clock for auction timing
3. **Tiebreaking**: Current implementation favors later bids in ties (could add `e_rand` for fair tiebreaking)
4. **Minimum Duration**: Set to 2 minutes for testing purposes

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Blockchain | Solana (Devnet) | Settlement and state storage |
| Confidential Computing | Inco Lightning | Encrypted operations in TEE |
| Smart Contracts | Anchor 0.31.1 | Solana program framework |
| Frontend | Next.js 14 | Web application |
| Styling | Tailwind CSS | UI components |
| State Management | React Query | Data fetching and caching |
| Wallet | Solana Wallet Adapter | Wallet integration |
| Encryption SDK | @inco/solana-sdk ^0.0.2 | Client-side encryption/decryption |

### Key Dependencies

**Program (Rust):**
- `anchor-lang` ^0.31.1
- `inco-lightning` (Inco Lightning CPI)

**Frontend (TypeScript):**
- `@coral-xyz/anchor` ^0.31.1
- `@inco/solana-sdk` ^0.0.2
- `@solana/web3.js` ^1.98.0
- `@solana/wallet-adapter-*`
- `@tanstack/react-query` ^5.51.0
- `next` 14.2.4

---

## License

MIT License

---

## Acknowledgments

- [Inco Network](https://inco.org) for confidential computing infrastructure
- [Helius RPC](https://helius.dev) Fast, reliable RPC with enhanced rate limits
- [Solana Foundation](https://solana.com) for the high-performance blockchain
- [Coral](https://coral.xyz) for the Anchor framework

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

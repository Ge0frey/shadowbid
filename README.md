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

1. **Encryption**: Client encrypts bid using Inco's public key
2. **Storage**: Encrypted ciphertext is converted to a handle via `new_euint128` CPI
3. **Computation**: Winner determined via `e_ge` (comparison) and `e_select` (conditional update)
4. **Permission**: Winner granted decryption rights via `allow`
5. **Decryption**: Winner decrypts their bid through Inco's TEE
6. **Settlement**: On-chain verification via `is_validsignature` and SOL transfer

---

## Inco Lightning Integration

### Overview

Inco Lightning provides confidential computing infrastructure for Solana. It enables programs to work with encrypted data through a Cross-Program Invocation (CPI) interface, where the actual cryptographic operations occur in a Trusted Execution Environment (TEE).

### Encrypted Types Used

| Type | Description | Usage in ShadowBid |
|------|-------------|-------------------|
| `Euint128` | 128-bit encrypted unsigned integer | Stores encrypted bid amounts |
| `Ebool` | Encrypted boolean | Result of bid comparisons |

### CPI Operations

#### `new_euint128`
Converts client-encrypted ciphertext into an on-chain handle.

```rust
let encrypted_amount: Euint128 = new_euint128(cpi_ctx, ciphertext, 0)?;
bid.encrypted_amount = encrypted_amount.0;
```

#### `e_ge` (Encrypted Greater-Than-Or-Equal)
Compares two encrypted values, returning an encrypted boolean.

```rust
let is_higher_or_equal: Ebool = e_ge(cpi_ctx, this_bid, current_highest, 0)?;
```

#### `e_select` (Encrypted Conditional Selection)
Conditionally selects between two encrypted values based on an encrypted boolean.

```rust
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
allow(cpi_ctx, handle, winner_pubkey)?;
```

#### `is_validsignature`
Verifies TEE attestation that proves correct decryption.

```rust
is_validsignature(
    cpi_ctx,
    1,                            // signature count
    Some(vec![handle_bytes]),     // handles
    Some(vec![plaintext_bytes]),  // plaintexts
)?;
```

### Client-Side Encryption

```typescript
import { encryptValue } from "@inco/solana-sdk/encryption";

const bidAmountLamports = BigInt(1_000_000_000); // 1 SOL
const encryptedHex = await encryptValue(bidAmountLamports);
const ciphertext = hexToBuffer(encryptedHex);
```

### Attested Decryption

```typescript
import { decrypt } from "@inco/solana-sdk/attested-decrypt";

const result = await decrypt([handle.toString()], {
  address: publicKey,
  signMessage: wallet.signMessage,
});
// result.plaintexts[0] contains the decrypted value
// result.ed25519Instructions contains verification instructions
```

---

## Smart Contract Design

### Account Structures

#### Auction Account
Stores all auction metadata and state. Derived as a PDA using seeds `["auction", seller, auction_id]`.

| Field | Type | Description |
|-------|------|-------------|
| `seller` | `Pubkey` | Creator of the auction |
| `item_mint` | `Pubkey` | Optional NFT being auctioned |
| `title` | `[u8; 64]` | Human-readable title |
| `description` | `[u8; 256]` | Auction description |
| `reserve_price` | `u64` | Minimum acceptable bid (lamports) |
| `start_time` | `i64` | Unix timestamp when bidding opens |
| `end_time` | `i64` | Unix timestamp when bidding closes |
| `state` | `AuctionState` | Current lifecycle state |
| `bid_count` | `u32` | Total bids placed |
| `bids_processed` | `u32` | Bids processed in winner determination |
| `highest_bid_handle` | `u128` | Encrypted handle of current highest bid |
| `current_leader` | `Pubkey` | Address of current leading bidder |
| `winner` | `Pubkey` | Final winner (set after finalization) |
| `winning_amount` | `u64` | Revealed winning amount (set after settlement) |
| `auction_id` | `u64` | Unique identifier |
| `bump` | `u8` | PDA bump seed |

#### Bid Account
Stores individual encrypted bids. Derived as a PDA using seeds `["bid", auction, bidder]`.

| Field | Type | Description |
|-------|------|-------------|
| `auction` | `Pubkey` | Associated auction |
| `bidder` | `Pubkey` | Bidder's address |
| `encrypted_amount` | `u128` | Inco handle to encrypted bid |
| `created_at` | `i64` | First bid timestamp |
| `updated_at` | `i64` | Last update timestamp |
| `processed` | `bool` | Whether processed in winner determination |
| `bump` | `u8` | PDA bump seed |

### State Machine

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
3. Frontend derives Auction PDA address
4. Transaction calls `create_auction` with parameters
5. Auction account is created in `Open` state

#### Phase 2: Bidding
1. Bidder views auction details (reserve price is public)
2. Bidder enters bid amount (must be >= reserve price)
3. Frontend encrypts bid using `encryptValue(bidAmountLamports)`
4. Transaction calls `place_bid` with ciphertext
5. On-chain: `new_euint128` CPI creates encrypted handle
6. Bid account stores handle; auction updates bid_count
7. Bidder can update bid by calling `place_bid` again (same PDA)

#### Phase 3: Close Bidding
1. After `end_time`, anyone can call `close_bidding`
2. Auction state transitions to `Closed`
3. If no bids were placed, auction moves to `Cancelled`

#### Phase 4: Winner Determination
1. For each bid, anyone calls `determine_winner` with that bid's account
2. On-chain encrypted comparison:
   - `e_ge` compares current bid against highest_bid_handle
   - `e_select` conditionally updates highest_bid_handle
3. Process repeats until all bids are processed
4. Note: The actual bid values remain encrypted throughout

#### Phase 5: Finalization
1. After all bids processed, anyone calls `finalize_winner`
2. Winner is set to `current_leader`
3. `allow` CPI grants winner decryption permission for their bid
4. Auction state transitions to `WinnerDetermined`

#### Phase 6: Settlement
1. Winner requests decryption from Inco TEE via SDK
2. TEE returns plaintext value with Ed25519 attestation signature
3. Winner calls `settle_auction` with:
   - Handle bytes (the encrypted bid handle)
   - Plaintext bytes (the decrypted amount)
4. On-chain verification:
   - `is_validsignature` verifies TEE attestation
   - Amount validated against reserve price
5. SOL transferred from winner to seller
6. Auction state transitions to `Settled`

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
│       │   ├── errors.rs                 # Custom error definitions
│       │   ├── events.rs                 # Anchor events for indexing
│       │   ├── state/
│       │   │   ├── mod.rs
│       │   │   ├── auction.rs            # Auction account structure
│       │   │   └── bid.rs                # Bid account structure
│       │   └── instructions/
│       │       ├── mod.rs
│       │       ├── create_auction.rs     # Auction creation logic
│       │       ├── place_bid.rs          # Bid placement with encryption
│       │       ├── close_bidding.rs      # Close bidding period
│       │       ├── determine_winner.rs   # Encrypted comparison logic
│       │       ├── finalize_winner.rs    # Grant decrypt permission
│       │       ├── settle_auction.rs     # Verify proof and transfer
│       │       └── cancel_auction.rs     # Auction cancellation
│       ├── Cargo.toml
│       └── Xargo.toml
├── app/
│   ├── src/
│   │   ├── app/                          # Next.js App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Home page
│   │   │   └── auction/
│   │   │       ├── create/page.tsx       # Create auction page
│   │   │       └── [id]/page.tsx         # Auction detail page
│   │   ├── components/
│   │   │   ├── auction/
│   │   │   │   ├── AuctionCard.tsx       # Auction preview card
│   │   │   │   ├── CreateAuctionForm.tsx # Auction creation form
│   │   │   │   └── BidForm.tsx           # Bid submission form
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── providers/
│   │   │   │   ├── index.tsx             # Combined providers
│   │   │   │   ├── WalletProvider.tsx    # Solana wallet context
│   │   │   │   └── QueryProvider.tsx     # React Query context
│   │   │   └── ui/
│   │   │       ├── Card.tsx
│   │   │       └── Countdown.tsx
│   │   ├── hooks/
│   │   │   ├── useAuction.ts             # Single auction fetching
│   │   │   ├── useAuctions.ts            # Auction list fetching
│   │   │   └── useEncryption.ts          # Inco encryption hooks
│   │   └── lib/
│   │       ├── constants.ts              # Program IDs, network config
│   │       ├── encryption.ts             # Inco SDK wrappers
│   │       ├── pda.ts                    # PDA derivation helpers
│   │       ├── program.ts                # Anchor program instance
│   │       ├── utils.ts                  # General utilities
│   │       └── idl/
│   │           └── shadowbid.json        # Generated IDL
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
├── tests/
│   └── shadowbid.ts                      # Integration tests
├── Anchor.toml                           # Anchor configuration
├── Cargo.toml                            # Rust workspace
├── package.json                          # Root package
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

3. **Update Anchor.toml wallet path**
   ```toml
   [provider]
   cluster = "devnet"
   wallet = "~/.config/solana/shadowbid.json"
   ```

### Deployment

```bash
# Deploy to Devnet
anchor deploy

# Note the Program ID from output
# Update in these files:
# - programs/shadowbid/src/lib.rs (declare_id!)
# - Anchor.toml ([programs.devnet])
# - app/src/lib/constants.ts (SHADOWBID_PROGRAM_ID)

# Rebuild after updating Program ID
anchor build
```

### Running the Frontend

```bash
cd app
npm run dev
```

Access the application at `http://localhost:3000`

---

## API Reference

### Program Instructions

#### create_auction

Creates a new sealed-bid auction.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `title` | `String` | Auction title (max 64 bytes) |
| `description` | `String` | Auction description (max 256 bytes) |
| `reserve_price` | `u64` | Minimum bid in lamports |
| `duration_seconds` | `i64` | Auction duration (3600 - 604800 seconds) |

**Accounts:**
- `seller` (signer, mut): Auction creator
- `auction` (init): Auction PDA
- `system_program`: System program

#### place_bid

Places or updates an encrypted bid.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `ciphertext` | `Vec<u8>` | Encrypted bid amount |

**Accounts:**
- `bidder` (signer, mut): Bidder
- `auction` (mut): Target auction
- `bid` (init_if_needed): Bid PDA
- `inco_lightning_program`: Inco Lightning
- `system_program`: System program

#### close_bidding

Closes the bidding period. Permissionless after end_time.

**Accounts:**
- `caller` (signer): Any account
- `auction` (mut): Auction to close

#### determine_winner

Processes one bid for winner determination. Permissionless.

**Accounts:**
- `caller` (signer, mut): Any account
- `auction` (mut): Auction being processed
- `bid` (mut): Bid to process
- `inco_lightning_program`: Inco Lightning

#### finalize_winner

Confirms winner and grants decryption permission.

**Accounts:**
- `caller` (signer, mut): Any account
- `auction` (mut): Auction to finalize
- `inco_lightning_program`: Inco Lightning
- Remaining accounts for allowance PDA

#### settle_auction

Settles auction with attested decryption proof.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `handle_bytes` | `Vec<u8>` | Winning bid handle |
| `plaintext_bytes` | `Vec<u8>` | Decrypted amount |

**Accounts:**
- `winner` (signer, mut): Auction winner
- `auction` (mut): Auction to settle
- `seller` (mut): Payment recipient
- `instructions`: Instructions sysvar
- `inco_lightning_program`: Inco Lightning
- `system_program`: System program

### Events

| Event | Fields | Description |
|-------|--------|-------------|
| `AuctionCreated` | auction, seller, title, reserve_price, start_time, end_time | New auction created |
| `BidPlaced` | auction, bidder, bid_number, timestamp | New bid placed |
| `BidUpdated` | auction, bidder, timestamp | Existing bid updated |
| `BiddingClosed` | auction, total_bids, timestamp | Bidding period ended |
| `BidProcessed` | auction, bidder, bids_processed | Bid processed in winner determination |
| `WinnerDetermined` | auction, winner, timestamp | Final winner confirmed |
| `AuctionSettled` | auction, winner, winning_amount, timestamp | Auction settled, payment transferred |
| `AuctionCancelled` | auction, seller, reason, timestamp | Auction cancelled |

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
| **Invalid decryption** | TEE attestation ensures correct decryption |
| **Reserve manipulation** | Reserve price is immutable after creation |

### Trust Assumptions

1. **Inco TEE Network**: Trusted to correctly perform encrypted operations and provide valid attestations
2. **Solana Validators**: Trusted for transaction ordering (but cannot see encrypted data)
3. **Client-side Encryption**: Users must use official SDK for proper encryption

### Known Limitations

1. **Gas Costs**: Winner determination requires N transactions for N bids
2. **Timing**: Relies on Solana clock for auction timing
3. **Tiebreaking**: Current implementation may favor later bids in ties (could add `e_rand`)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Blockchain | Solana (Devnet) | Settlement and state storage |
| Confidential Computing | Inco Lightning | Encrypted operations |
| Smart Contracts | Anchor 0.31.1 | Program framework |
| Frontend | Next.js 14 | Web application |
| Styling | Tailwind CSS | UI components |
| State Management | React Query | Data fetching |
| Wallet | Solana Wallet Adapter | Wallet integration |

---

## License

MIT License

---

## Acknowledgments

- [Inco Network](https://inco.org) for confidential computing infrastructure
- [Solana Foundation](https://solana.com) for the high-performance blockchain
- [Coral](https://coral.xyz) for the Anchor framework

---


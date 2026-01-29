use anchor_lang::prelude::*;

/// Emitted when a new auction is created
#[event]
pub struct AuctionCreated {
    /// The auction's public key
    pub auction: Pubkey,
    /// The seller's public key
    pub seller: Pubkey,
    /// Auction title
    pub title: String,
    /// Reserve price in lamports
    pub reserve_price: u64,
    /// Unix timestamp when bidding starts
    pub start_time: i64,
    /// Unix timestamp when bidding ends
    pub end_time: i64,
}

/// Emitted when a bid is placed
#[event]
pub struct BidPlaced {
    /// The auction's public key
    pub auction: Pubkey,
    /// The bidder's public key
    pub bidder: Pubkey,
    /// The bid number (1-indexed)
    pub bid_number: u32,
    /// Unix timestamp when bid was placed
    pub timestamp: i64,
}

/// Emitted when a bid is updated
#[event]
pub struct BidUpdated {
    /// The auction's public key
    pub auction: Pubkey,
    /// The bidder's public key
    pub bidder: Pubkey,
    /// Unix timestamp when bid was updated
    pub timestamp: i64,
}

/// Emitted when bidding period closes
#[event]
pub struct BiddingClosed {
    /// The auction's public key
    pub auction: Pubkey,
    /// Total number of bids
    pub total_bids: u32,
    /// Unix timestamp when bidding closed
    pub timestamp: i64,
}

/// Emitted when a bid is processed during winner determination
#[event]
pub struct BidProcessed {
    /// The auction's public key
    pub auction: Pubkey,
    /// The bidder whose bid was processed
    pub bidder: Pubkey,
    /// Number of bids processed so far
    pub bids_processed: u32,
}

/// Emitted when winner is determined
#[event]
pub struct WinnerDetermined {
    /// The auction's public key
    pub auction: Pubkey,
    /// The winner's public key
    pub winner: Pubkey,
    /// Unix timestamp when winner was determined
    pub timestamp: i64,
}

/// Emitted when auction is settled
#[event]
pub struct AuctionSettled {
    /// The auction's public key
    pub auction: Pubkey,
    /// The winner's public key
    pub winner: Pubkey,
    /// The winning bid amount (revealed)
    pub winning_amount: u64,
    /// Unix timestamp when auction was settled
    pub timestamp: i64,
}

/// Emitted when auction is cancelled
#[event]
pub struct AuctionCancelled {
    /// The auction's public key
    pub auction: Pubkey,
    /// The seller's public key
    pub seller: Pubkey,
    /// Reason for cancellation
    pub reason: String,
    /// Unix timestamp when auction was cancelled
    pub timestamp: i64,
}

use anchor_lang::prelude::*;

use crate::constants::{MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH};

/// Auction state machine
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum AuctionState {
    /// Auction is open for bidding
    Open,
    /// Bidding period has ended, awaiting winner determination
    Closed,
    /// Winner has been determined through encrypted comparison
    WinnerDetermined,
    /// Auction has been settled (payment transferred)
    Settled,
    /// Auction was cancelled
    Cancelled,
}

impl Default for AuctionState {
    fn default() -> Self {
        AuctionState::Open
    }
}

/// Main auction account storing all auction metadata and state
#[account]
pub struct Auction {
    /// The seller who created this auction
    pub seller: Pubkey,
    
    /// Optional: NFT mint being auctioned (for NFT auctions)
    pub item_mint: Pubkey,
    
    /// Auction title (human-readable)
    pub title: [u8; MAX_TITLE_LENGTH],
    
    /// Auction description
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    
    /// Minimum acceptable bid amount (public reserve price in lamports)
    pub reserve_price: u64,
    
    /// Unix timestamp when the auction starts
    pub start_time: i64,
    
    /// Unix timestamp when bidding ends
    pub end_time: i64,
    
    /// Current state of the auction
    pub state: AuctionState,
    
    /// Total number of bids placed
    pub bid_count: u32,
    
    /// Number of bids processed during winner determination
    pub bids_processed: u32,
    
    /// Handle to the current highest bid (encrypted Euint128)
    /// This is updated during winner determination using e_select
    pub highest_bid_handle: u128,
    
    /// Public key of the current leading bidder
    /// Updated alongside highest_bid_handle during e_select
    pub current_leader: Pubkey,
    
    /// Final winner after all bids processed (set during finalize)
    pub winner: Pubkey,
    
    /// The winning bid amount (revealed only after settlement)
    pub winning_amount: u64,
    
    /// Unique auction ID (used in PDA derivation)
    pub auction_id: u64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl Auction {
    /// Space required for the Auction account
    /// 8 (discriminator) + all fields
    pub const SPACE: usize = 8 +  // discriminator
        32 +                       // seller
        32 +                       // item_mint
        MAX_TITLE_LENGTH +         // title
        MAX_DESCRIPTION_LENGTH +   // description
        8 +                        // reserve_price
        8 +                        // start_time
        8 +                        // end_time
        1 +                        // state (enum)
        4 +                        // bid_count
        4 +                        // bids_processed
        16 +                       // highest_bid_handle (u128)
        32 +                       // current_leader
        32 +                       // winner
        8 +                        // winning_amount
        8 +                        // auction_id
        1;                         // bump

    /// Check if the auction is currently accepting bids
    pub fn is_bidding_open(&self, current_time: i64) -> bool {
        self.state == AuctionState::Open 
            && current_time >= self.start_time 
            && current_time < self.end_time
    }

    /// Check if the bidding period has ended
    pub fn is_bidding_ended(&self, current_time: i64) -> bool {
        current_time >= self.end_time
    }

    /// Check if all bids have been processed
    pub fn all_bids_processed(&self) -> bool {
        self.bids_processed >= self.bid_count
    }

    /// Get the title as a string (trimmed)
    pub fn get_title(&self) -> String {
        String::from_utf8_lossy(&self.title)
            .trim_end_matches('\0')
            .to_string()
    }

    /// Get the description as a string (trimmed)
    pub fn get_description(&self) -> String {
        String::from_utf8_lossy(&self.description)
            .trim_end_matches('\0')
            .to_string()
    }
}

use anchor_lang::prelude::*;

/// Seed for deriving Auction PDA
pub const AUCTION_SEED: &[u8] = b"auction";

/// Seed for deriving Bid PDA
pub const BID_SEED: &[u8] = b"bid";

/// Minimum auction duration (60 seconds for testing)
pub const MIN_AUCTION_DURATION: i64 = 60;

/// Maximum auction duration (7 days in seconds)
pub const MAX_AUCTION_DURATION: i64 = 604800;

/// Maximum title length in bytes
pub const MAX_TITLE_LENGTH: usize = 64;

/// Maximum description length in bytes
pub const MAX_DESCRIPTION_LENGTH: usize = 256;

/// Inco Lightning Program ID
pub const INCO_LIGHTNING_PROGRAM_ID: Pubkey = 
    pubkey!("5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj");

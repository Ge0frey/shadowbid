use anchor_lang::prelude::*;

/// Individual bid account - one per bidder per auction
#[account]
pub struct Bid {
    /// The auction this bid belongs to
    pub auction: Pubkey,
    
    /// The bidder's public key
    pub bidder: Pubkey,
    
    /// Encrypted bid amount (Euint128 handle from Inco Lightning)
    /// This is a 128-bit reference to the encrypted value stored in TEE
    pub encrypted_amount: u128,
    
    /// Unix timestamp when the bid was first placed
    pub created_at: i64,
    
    /// Unix timestamp when the bid was last updated
    pub updated_at: i64,
    
    /// Whether this bid has been processed during winner determination
    /// Prevents double-counting in the comparison loop
    pub processed: bool,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl Bid {
    /// Space required for the Bid account
    pub const SPACE: usize = 8 +  // discriminator
        32 +                       // auction
        32 +                       // bidder
        16 +                       // encrypted_amount (u128)
        8 +                        // created_at
        8 +                        // updated_at
        1 +                        // processed
        1;                         // bump

    /// Check if this bid has been processed
    pub fn is_processed(&self) -> bool {
        self.processed
    }

    /// Check if this bid belongs to a specific auction
    pub fn belongs_to_auction(&self, auction: &Pubkey) -> bool {
        self.auction == *auction
    }

    /// Check if this bid was placed by a specific bidder
    pub fn is_from_bidder(&self, bidder: &Pubkey) -> bool {
        self.bidder == *bidder
    }
}

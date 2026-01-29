use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("GGanQwYdzturA2hMuPbR69toMaiHPaGox86YifLjMVzQ");

/// ShadowBid: A sealed-bid auction protocol with Inco Lightning confidential computing
/// 
/// Auction Lifecycle:
/// 1. Seller creates auction with reserve price and duration
/// 2. Bidders place encrypted bids (invisible to everyone)
/// 3. After end time, anyone can close bidding
/// 4. Winner determination: compare encrypted bids using e_ge and e_select
/// 5. Winner is granted decryption permission
/// 6. Winner reveals bid, pays, and settles auction
#[program]
pub mod shadowbid {
    use super::*;

    /// Creates a new sealed-bid auction
    /// 
    /// # Arguments
    /// * `params` - Auction parameters (title, description, reserve_price, duration)
    pub fn create_auction(
        ctx: Context<CreateAuction>,
        params: CreateAuctionParams,
    ) -> Result<()> {
        instructions::create_auction::handler(ctx, params)
    }

    /// Places or updates an encrypted bid
    /// 
    /// # Arguments
    /// * `ciphertext` - The encrypted bid amount (encrypted client-side with Inco SDK)
    pub fn place_bid(ctx: Context<PlaceBid>, ciphertext: Vec<u8>) -> Result<()> {
        instructions::place_bid::handler(ctx, ciphertext)
    }

    /// Closes bidding after the auction end time
    /// 
    /// Permissionless - anyone can call this after end_time
    pub fn close_bidding(ctx: Context<CloseBidding>) -> Result<()> {
        instructions::close_bidding::handler(ctx)
    }

    /// Processes one bid for winner determination
    /// 
    /// Uses encrypted comparison (e_ge) and selection (e_select)
    /// to update the highest bid without revealing any bid amounts.
    /// Must be called once per bid.
    pub fn determine_winner(ctx: Context<DetermineWinner>) -> Result<()> {
        instructions::determine_winner::handler(ctx)
    }

    /// Finalizes the winner after all bids are processed
    /// 
    /// Grants decryption permission to the winner via Inco's allow()
    pub fn finalize_winner(ctx: Context<FinalizeWinner>) -> Result<()> {
        instructions::finalize_winner::handler(ctx)
    }

    /// Settles the auction with attested decryption proof
    /// 
    /// # Arguments
    /// * `handle_bytes` - The winning bid handle as bytes
    /// * `plaintext_bytes` - The decrypted winning amount
    /// 
    /// Requires Ed25519 signature verification instruction in the transaction
    pub fn settle_auction(
        ctx: Context<SettleAuction>,
        handle_bytes: Vec<u8>,
        plaintext_bytes: Vec<u8>,
    ) -> Result<()> {
        instructions::settle_auction::handler(ctx, handle_bytes, plaintext_bytes)
    }

    /// Cancels an auction (seller only)
    /// 
    /// Can only cancel if no winner has been determined
    pub fn cancel_auction(ctx: Context<CancelAuction>, reason: String) -> Result<()> {
        instructions::cancel_auction::handler(ctx, reason)
    }
}

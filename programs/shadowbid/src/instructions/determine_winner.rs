use anchor_lang::prelude::*;
use inco_lightning::cpi::accounts::Operation;
use inco_lightning::cpi::{e_ge, e_select};
use inco_lightning::types::{Euint128, Ebool};
use inco_lightning::ID as INCO_LIGHTNING_ID;

use crate::constants::BID_SEED;
use crate::errors::ShadowBidError;
use crate::events::BidProcessed;
use crate::state::{Auction, AuctionState, Bid};

/// The process:
/// 1. Load the bid's encrypted amount
/// 2. Compare against current highest using e_ge (encrypted greater-than-or-equal)
/// 3. Use e_select to conditionally update highest_bid_handle
/// 4. Track the leader's pubkey alongside the handle
/// 
/// This must be called once for each bid (except the first one which
/// is automatically set as leader during place_bid).
#[derive(Accounts)]
pub struct DetermineWinner<'info> {
    /// Anyone can call this to help process bids (permissionless)
    #[account(mut)]
    pub caller: Signer<'info>,

    /// The auction being processed
    #[account(
        mut,
        constraint = auction.state == AuctionState::Closed @ ShadowBidError::AuctionNotClosed,
    )]
    pub auction: Account<'info, Auction>,

    /// The bid to compare against current highest
    #[account(
        mut,
        seeds = [
            BID_SEED,
            auction.key().as_ref(),
            bid.bidder.as_ref()
        ],
        bump = bid.bump,
        constraint = bid.auction == auction.key() @ ShadowBidError::BidAuctionMismatch,
        constraint = !bid.processed @ ShadowBidError::BidAlreadyProcessed,
    )]
    pub bid: Account<'info, Bid>,

    /// Inco Lightning program for encrypted operations
    /// CHECK: Validated by address constraint
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,
}

pub fn handler(ctx: Context<DetermineWinner>) -> Result<()> {
    let auction = &mut ctx.accounts.auction;
    let bid = &mut ctx.accounts.bid;
    let inco = ctx.accounts.inco_lightning_program.to_account_info();
    let signer = ctx.accounts.caller.to_account_info();

    // Get handles for comparison
    let current_highest = Euint128(auction.highest_bid_handle);
    let this_bid = Euint128(bid.encrypted_amount);

    // If this is the first bid being processed (current_highest is 0),
    // just set it as the leader without comparison
    if auction.highest_bid_handle == 0 {
        auction.highest_bid_handle = bid.encrypted_amount;
        auction.current_leader = bid.bidder;
        bid.processed = true;
        auction.bids_processed = auction.bids_processed.checked_add(1).unwrap();

        emit!(BidProcessed {
            auction: auction.key(),
            bidder: bid.bidder,
            bids_processed: auction.bids_processed,
        });

        msg!("First bid processed, setting as leader: {}", bid.bidder);
        return Ok(());
    }

    // Compare this bid against current highest using encrypted comparison
    // e_ge returns Ebool: true if this_bid >= current_highest
    let cpi_ctx = CpiContext::new(
        inco.clone(),
        Operation { signer: signer.clone() },
    );
    let is_higher_or_equal: Ebool = e_ge(cpi_ctx, this_bid, current_highest, 0)?;

    // Use e_select to conditionally choose the new highest bid
    // If this_bid >= current_highest, select this_bid; otherwise keep current_highest
    let cpi_ctx = CpiContext::new(
        inco.clone(),
        Operation { signer: signer.clone() },
    );
    let new_highest: Euint128 = e_select(
        cpi_ctx,
        is_higher_or_equal,
        this_bid,
        current_highest,
        0,
    )?;

    // Check if the handle changed (indicating this bid is higher)
    // Note: In a production system, you might want to handle ties differently
    // using e_rand for fair tiebreaking
    let handle_changed = new_highest.0 != current_highest.0;

    // Update auction state
    auction.highest_bid_handle = new_highest.0;
    
    // Update leader if this bid is higher
    if handle_changed {
        auction.current_leader = bid.bidder;
        msg!("New leader: {}", bid.bidder);
    }

    // Mark bid as processed
    bid.processed = true;
    auction.bids_processed = auction.bids_processed.checked_add(1).unwrap();

    emit!(BidProcessed {
        auction: auction.key(),
        bidder: bid.bidder,
        bids_processed: auction.bids_processed,
    });

    msg!("Bid processed: {}", bid.bidder);
    msg!("Bids processed: {}/{}", auction.bids_processed, auction.bid_count);

    Ok(())
}

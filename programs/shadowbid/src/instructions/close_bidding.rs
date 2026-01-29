use anchor_lang::prelude::*;

use crate::errors::ShadowBidError;
use crate::events::BiddingClosed;
use crate::state::{Auction, AuctionState};

#[derive(Accounts)]
pub struct CloseBidding<'info> {
    /// Anyone can close bidding after the end time (permissionless)
    #[account(mut)]
    pub caller: Signer<'info>,

    /// The auction to close
    #[account(
        mut,
        constraint = auction.state == AuctionState::Open @ ShadowBidError::AuctionNotOpen,
    )]
    pub auction: Account<'info, Auction>,
}

pub fn handler(ctx: Context<CloseBidding>) -> Result<()> {
    let clock = Clock::get()?;
    let auction = &mut ctx.accounts.auction;

    // Ensure bidding period has ended
    require!(
        auction.is_bidding_ended(clock.unix_timestamp),
        ShadowBidError::BiddingNotEnded
    );

    // Check if there are any bids
    if auction.bid_count == 0 {
        // No bids - cancel the auction
        auction.state = AuctionState::Cancelled;
        msg!("Auction cancelled - no bids received");
    } else {
        // Transition to Closed state
        auction.state = AuctionState::Closed;
        msg!("Bidding closed - {} bids to process", auction.bid_count);
    }

    emit!(BiddingClosed {
        auction: auction.key(),
        total_bids: auction.bid_count,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

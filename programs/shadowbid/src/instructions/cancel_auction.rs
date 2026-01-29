use anchor_lang::prelude::*;

use crate::errors::ShadowBidError;
use crate::events::AuctionCancelled;
use crate::state::{Auction, AuctionState};

#[derive(Accounts)]
pub struct CancelAuction<'info> {
    /// The seller cancelling the auction
    #[account(
        mut,
        constraint = seller.key() == auction.seller @ ShadowBidError::NotSeller,
    )]
    pub seller: Signer<'info>,

    /// The auction to cancel
    #[account(
        mut,
        constraint = auction.state == AuctionState::Open || auction.state == AuctionState::Closed @ ShadowBidError::AuctionAlreadySettled,
    )]
    pub auction: Account<'info, Auction>,
}

pub fn handler(ctx: Context<CancelAuction>, reason: String) -> Result<()> {
    let clock = Clock::get()?;
    let auction = &mut ctx.accounts.auction;

    // Can only cancel if no bids have been placed, or if auction is in a state that allows cancellation
    // If bids exist and winner was determined, cannot cancel
    if auction.state == AuctionState::Closed && auction.bid_count > 0 {
        // If bidding closed with bids, can only cancel if winner determination hasn't started
        require!(
            auction.bids_processed == 0,
            ShadowBidError::AuctionAlreadySettled
        );
    }

    // For open auctions, seller can cancel anytime before end if no bids
    if auction.state == AuctionState::Open && auction.bid_count > 0 {
        // Has bids - check if we're past end time
        require!(
            clock.unix_timestamp >= auction.end_time,
            ShadowBidError::BiddingNotEnded
        );
    }

    auction.state = AuctionState::Cancelled;

    emit!(AuctionCancelled {
        auction: auction.key(),
        seller: auction.seller,
        reason: reason.clone(),
        timestamp: clock.unix_timestamp,
    });

    msg!("Auction cancelled: {}", auction.key());
    msg!("Reason: {}", reason);

    Ok(())
}

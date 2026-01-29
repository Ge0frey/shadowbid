use anchor_lang::prelude::*;
use inco_lightning::cpi::accounts::Operation;
use inco_lightning::cpi::new_euint128;
use inco_lightning::types::Euint128;
use inco_lightning::ID as INCO_LIGHTNING_ID;

use crate::constants::BID_SEED;
use crate::errors::ShadowBidError;
use crate::events::{BidPlaced, BidUpdated};
use crate::state::{Auction, AuctionState, Bid};

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    /// The bidder placing the bid
    #[account(mut)]
    pub bidder: Signer<'info>,

    /// The auction to bid on
    #[account(
        mut,
        constraint = auction.state == AuctionState::Open @ ShadowBidError::AuctionNotOpen,
        constraint = auction.seller != bidder.key() @ ShadowBidError::SellerCannotBid,
    )]
    pub auction: Account<'info, Auction>,

    /// The bid account (created or updated)
    #[account(
        init_if_needed,
        payer = bidder,
        space = Bid::SPACE,
        seeds = [
            BID_SEED,
            auction.key().as_ref(),
            bidder.key().as_ref()
        ],
        bump
    )]
    pub bid: Account<'info, Bid>,

    /// Inco Lightning program for encrypted operations
    /// CHECK: Validated by address constraint
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PlaceBid>, ciphertext: Vec<u8>) -> Result<()> {
    let clock = Clock::get()?;
    let auction = &mut ctx.accounts.auction;
    let bid = &mut ctx.accounts.bid;

    // Check timing constraints
    require!(
        auction.is_bidding_open(clock.unix_timestamp),
        ShadowBidError::BiddingEnded
    );

    // Check if this is a new bid or an update
    let is_new_bid = bid.encrypted_amount == 0;

    // Create encrypted handle from ciphertext via Inco CPI
    let cpi_ctx = CpiContext::new(
        ctx.accounts.inco_lightning_program.to_account_info(),
        Operation {
            signer: ctx.accounts.bidder.to_account_info(),
        },
    );

    // new_euint128 creates an encrypted handle from the ciphertext
    // The ciphertext was encrypted client-side using Inco's public key
    let encrypted_amount: Euint128 = new_euint128(cpi_ctx, ciphertext, 0)?;

    // Store bid data
    bid.auction = auction.key();
    bid.bidder = ctx.accounts.bidder.key();
    bid.encrypted_amount = encrypted_amount.0;
    bid.updated_at = clock.unix_timestamp;
    bid.processed = false;

    if is_new_bid {
        bid.created_at = clock.unix_timestamp;
        bid.bump = ctx.bumps.bid;
        
        // Increment bid count
        auction.bid_count = auction.bid_count.checked_add(1).unwrap();

        // If this is the first bid, set as current leader
        if auction.highest_bid_handle == 0 {
            auction.highest_bid_handle = encrypted_amount.0;
            auction.current_leader = ctx.accounts.bidder.key();
        }

        emit!(BidPlaced {
            auction: auction.key(),
            bidder: bid.bidder,
            bid_number: auction.bid_count,
            timestamp: clock.unix_timestamp,
        });

        msg!("New bid placed on auction {}", auction.key());
        msg!("Bid #{} by {}", auction.bid_count, bid.bidder);
    } else {
        emit!(BidUpdated {
            auction: auction.key(),
            bidder: bid.bidder,
            timestamp: clock.unix_timestamp,
        });

        msg!("Bid updated on auction {}", auction.key());
        msg!("Bidder: {}", bid.bidder);
    }

    msg!("Encrypted amount handle: {}", bid.encrypted_amount);

    Ok(())
}

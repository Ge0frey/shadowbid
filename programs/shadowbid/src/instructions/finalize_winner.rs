use anchor_lang::prelude::*;
use inco_lightning::cpi::accounts::Allow;
use inco_lightning::cpi::allow;
use inco_lightning::ID as INCO_LIGHTNING_ID;

use crate::errors::ShadowBidError;
use crate::events::WinnerDetermined;
use crate::state::{Auction, AuctionState};

/// This instruction:
/// 1. Verifies all bids have been processed
/// 2. Sets the winner from current_leader
/// 3. Grants decryption permission to the winner via Inco's allow()
/// 4. Transitions auction to WinnerDetermined state
#[derive(Accounts)]
pub struct FinalizeWinner<'info> {
    /// Anyone can finalize after all bids processed (permissionless)
    #[account(mut)]
    pub caller: Signer<'info>,

    /// The auction to finalize
    #[account(
        mut,
        constraint = auction.state == AuctionState::Closed @ ShadowBidError::AuctionNotClosed,
        constraint = auction.all_bids_processed() @ ShadowBidError::NoBidsPlaced,
    )]
    pub auction: Account<'info, Auction>,

    /// CHECK: Allowance account PDA for granting decrypt permission
    /// Seeds: [handle_bytes, winner_address]
    #[account(mut)]
    pub allowance_account: AccountInfo<'info>,

    /// CHECK: The winner's address (validated against auction.current_leader)
    pub winner_address: AccountInfo<'info>,

    /// Inco Lightning program for allowance
    /// CHECK: Validated by address constraint
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<FinalizeWinner>) -> Result<()> {
    let clock = Clock::get()?;
    let auction = &mut ctx.accounts.auction;

    // Verify the winner address matches the current leader
    require!(
        ctx.accounts.winner_address.key() == auction.current_leader,
        ShadowBidError::NotWinner
    );

    // Ensure there's actually a winner
    require!(
        auction.current_leader != Pubkey::default(),
        ShadowBidError::WinnerNotSet
    );

    // Grant decryption access to the winner for the winning bid handle
    let cpi_ctx = CpiContext::new(
        ctx.accounts.inco_lightning_program.to_account_info(),
        Allow {
            allowance_account: ctx.accounts.allowance_account.to_account_info(),
            signer: ctx.accounts.caller.to_account_info(),
            allowed_address: ctx.accounts.winner_address.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
    );

    // Grant permission: allow(handle, grant=true, address)
    allow(
        cpi_ctx,
        auction.highest_bid_handle,
        true,
        auction.current_leader,
    )?;

    // Set final winner
    auction.winner = auction.current_leader;
    auction.state = AuctionState::WinnerDetermined;

    emit!(WinnerDetermined {
        auction: auction.key(),
        winner: auction.winner,
        timestamp: clock.unix_timestamp,
    });

    msg!("Winner determined: {}", auction.winner);
    msg!("Decryption permission granted for handle: {}", auction.highest_bid_handle);
    msg!("Winner can now reveal their winning bid");

    Ok(())
}

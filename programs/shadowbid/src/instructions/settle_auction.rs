use anchor_lang::prelude::*;
use inco_lightning::cpi::accounts::VerifySignature;
use inco_lightning::cpi::is_validsignature;
use inco_lightning::ID as INCO_LIGHTNING_ID;

use crate::errors::ShadowBidError;
use crate::events::AuctionSettled;
use crate::state::{Auction, AuctionState};
 
/// This instruction:
/// 1. Verifies the attested decryption proof from Inco
/// 2. Transfers payment from winner to seller
/// 3. Marks auction as settled
/// 
/// The transaction must include Ed25519 signature verification instructions
/// from the Inco SDK before calling this instruction.
#[derive(Accounts)]
pub struct SettleAuction<'info> {
    /// The winner settling the auction
    #[account(
        mut,
        constraint = winner.key() == auction.winner @ ShadowBidError::NotWinner,
    )]
    pub winner: Signer<'info>,

    /// The auction to settle
    #[account(
        mut,
        constraint = auction.state == AuctionState::WinnerDetermined @ ShadowBidError::WinnerNotDetermined,
    )]
    pub auction: Account<'info, Auction>,

    /// The seller receiving payment
    /// CHECK: Validated against auction.seller
    #[account(
        mut,
        constraint = seller.key() == auction.seller @ ShadowBidError::NotSeller,
    )]
    pub seller: AccountInfo<'info>,

    /// Instructions sysvar for Ed25519 signature verification
    /// CHECK: Validated by address constraint
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions: AccountInfo<'info>,

    /// Inco Lightning program for attestation verification
    /// CHECK: Validated by address constraint
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,

    /// System program for transfers
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SettleAuction>,
    handle_bytes: Vec<u8>,
    plaintext_bytes: Vec<u8>,
) -> Result<()> {
    let clock = Clock::get()?;
    let auction = &mut ctx.accounts.auction;

    // Verify the Ed25519 attestation signature from Inco
    // This proves the plaintext_bytes is the correct decryption of handle_bytes
    let cpi_ctx = CpiContext::new(
        ctx.accounts.inco_lightning_program.to_account_info(),
        VerifySignature {
            instructions: ctx.accounts.instructions.to_account_info(),
            signer: ctx.accounts.winner.to_account_info(),
        },
    );

    // Verify the signature
    // This will fail if the Ed25519 instruction isn't in the transaction
    let _results = is_validsignature(
        cpi_ctx,
        1,                           // expected signature count
        Some(vec![handle_bytes]),    // handles being verified
        Some(vec![plaintext_bytes.clone()]), // claimed plaintext values
    )?;

    // Parse the winning amount from plaintext bytes
    // The plaintext is a u128 in little-endian format
    let winning_amount = if plaintext_bytes.len() >= 16 {
        let mut bytes = [0u8; 16];
        bytes.copy_from_slice(&plaintext_bytes[..16]);
        u128::from_le_bytes(bytes) as u64
    } else if plaintext_bytes.len() >= 8 {
        let mut bytes = [0u8; 8];
        bytes.copy_from_slice(&plaintext_bytes[..8]);
        u64::from_le_bytes(bytes)
    } else {
        return Err(ShadowBidError::InvalidDecryptionProof.into());
    };

    // Ensure winning amount meets reserve price
    require!(
        winning_amount >= auction.reserve_price,
        ShadowBidError::InvalidDecryptionProof
    );

    // Transfer payment from winner to seller
    let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
        ctx.accounts.winner.key,
        ctx.accounts.seller.key,
        winning_amount,
    );

    anchor_lang::solana_program::program::invoke(
        &transfer_ix,
        &[
            ctx.accounts.winner.to_account_info(),
            ctx.accounts.seller.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Update auction state
    auction.winning_amount = winning_amount;
    auction.state = AuctionState::Settled;

    emit!(AuctionSettled {
        auction: auction.key(),
        winner: auction.winner,
        winning_amount,
        timestamp: clock.unix_timestamp,
    });

    msg!("Auction settled!");
    msg!("Winner: {}", auction.winner);
    msg!("Winning amount: {} lamports", winning_amount);
    msg!("Payment transferred to seller: {}", auction.seller);

    Ok(())
}

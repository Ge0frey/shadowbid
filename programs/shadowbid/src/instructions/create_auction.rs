use anchor_lang::prelude::*;

use crate::constants::{AUCTION_SEED, MIN_AUCTION_DURATION, MAX_AUCTION_DURATION, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH};
use crate::errors::ShadowBidError;
use crate::events::AuctionCreated;
use crate::state::{Auction, AuctionState};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateAuctionParams {
    /// Unique identifier for this auction
    pub auction_id: u64,
    /// Auction title (max 64 bytes)
    pub title: String,
    /// Auction description (max 256 bytes)
    pub description: String,
    /// Minimum bid amount in lamports
    pub reserve_price: u64,
    /// Duration of the auction in seconds
    pub duration: i64,
    /// Optional: NFT mint address being auctioned
    pub item_mint: Option<Pubkey>,
}

#[derive(Accounts)]
#[instruction(params: CreateAuctionParams)]
pub struct CreateAuction<'info> {
    /// The seller creating this auction
    #[account(mut)]
    pub seller: Signer<'info>,

    /// The auction account to be created
    #[account(
        init,
        payer = seller,
        space = Auction::SPACE,
        seeds = [
            AUCTION_SEED,
            seller.key().as_ref(),
            &params.auction_id.to_le_bytes()
        ],
        bump
    )]
    pub auction: Account<'info, Auction>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateAuction>, params: CreateAuctionParams) -> Result<()> {
    // Validate inputs
    require!(
        params.title.len() <= MAX_TITLE_LENGTH,
        ShadowBidError::TitleTooLong
    );
    require!(
        params.description.len() <= MAX_DESCRIPTION_LENGTH,
        ShadowBidError::DescriptionTooLong
    );
    require!(
        params.duration >= MIN_AUCTION_DURATION,
        ShadowBidError::DurationTooShort
    );
    require!(
        params.duration <= MAX_AUCTION_DURATION,
        ShadowBidError::DurationTooLong
    );
    require!(
        params.reserve_price > 0,
        ShadowBidError::InvalidReservePrice
    );

    let clock = Clock::get()?;
    let auction = &mut ctx.accounts.auction;

    // Initialize title (pad with zeros)
    let mut title_bytes = [0u8; MAX_TITLE_LENGTH];
    let title_slice = params.title.as_bytes();
    title_bytes[..title_slice.len()].copy_from_slice(title_slice);

    // Initialize description (pad with zeros)
    let mut description_bytes = [0u8; MAX_DESCRIPTION_LENGTH];
    let desc_slice = params.description.as_bytes();
    description_bytes[..desc_slice.len()].copy_from_slice(desc_slice);

    // Set auction fields
    auction.seller = ctx.accounts.seller.key();
    auction.item_mint = params.item_mint.unwrap_or(Pubkey::default());
    auction.title = title_bytes;
    auction.description = description_bytes;
    auction.reserve_price = params.reserve_price;
    auction.start_time = clock.unix_timestamp;
    auction.end_time = clock.unix_timestamp + params.duration;
    auction.state = AuctionState::Open;
    auction.bid_count = 0;
    auction.bids_processed = 0;
    auction.highest_bid_handle = 0;
    auction.current_leader = Pubkey::default();
    auction.winner = Pubkey::default();
    auction.winning_amount = 0;
    auction.auction_id = params.auction_id;
    auction.bump = ctx.bumps.auction;

    // Emit event
    emit!(AuctionCreated {
        auction: auction.key(),
        seller: auction.seller,
        title: params.title,
        reserve_price: params.reserve_price,
        start_time: auction.start_time,
        end_time: auction.end_time,
    });

    msg!("Auction created: {}", auction.key());
    msg!("Title: {}", auction.get_title());
    msg!("Reserve price: {} lamports", auction.reserve_price);
    msg!("Ends at: {}", auction.end_time);

    Ok(())
}

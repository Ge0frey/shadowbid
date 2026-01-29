use anchor_lang::prelude::*;

#[error_code]
pub enum ShadowBidError {

    // Timing Errors
    #[msg("Auction duration is too short (minimum 1 hour)")]
    DurationTooShort,

    #[msg("Auction duration is too long (maximum 7 days)")]
    DurationTooLong,

    #[msg("Auction has not started yet")]
    AuctionNotStarted,

    #[msg("Bidding period has not ended yet")]
    BiddingNotEnded,

    #[msg("Bidding period has ended")]
    BiddingEnded,

    // State Errors
    #[msg("Auction is not open for bidding")]
    AuctionNotOpen,

    #[msg("Auction is not in closed state")]
    AuctionNotClosed,

    #[msg("Auction is not in winner determined state")]
    WinnerNotDetermined,

    #[msg("Auction has already been settled")]
    AuctionAlreadySettled,

    #[msg("Auction has been cancelled")]
    AuctionCancelled,

    #[msg("No bids have been placed on this auction")]
    NoBidsPlaced,

    // Authorization Errors
    #[msg("Only the seller can perform this action")]
    NotSeller,

    #[msg("Only the winner can perform this action")]
    NotWinner,

    #[msg("Seller cannot bid on their own auction")]
    SellerCannotBid,

    // Bid Errors
    #[msg("Bid does not belong to this auction")]
    BidAuctionMismatch,

    #[msg("Bid has already been processed in winner determination")]
    BidAlreadyProcessed,

    #[msg("Invalid encrypted bid data")]
    InvalidBidCiphertext,

    // Input Validation Errors
    #[msg("Title is too long (maximum 64 bytes)")]
    TitleTooLong,

    #[msg("Description is too long (maximum 256 bytes)")]
    DescriptionTooLong,

    #[msg("Reserve price must be greater than zero")]
    InvalidReservePrice,

    // Cryptographic Errors
    #[msg("Failed to create encrypted handle")]
    EncryptionFailed,

    #[msg("Failed to compare encrypted values")]
    ComparisonFailed,

    #[msg("Failed to verify attestation signature")]
    AttestationVerificationFailed,

    #[msg("Invalid decryption proof")]
    InvalidDecryptionProof,

    // Account Errors
    #[msg("Winner has not been set")]
    WinnerNotSet,

    #[msg("Insufficient remaining accounts for allowance")]
    InsufficientRemainingAccounts,
}

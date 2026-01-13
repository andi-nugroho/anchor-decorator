use anchor_lang::prelude::*;
use constant_product_curve::CurveError;

#[error_code]
pub enum AmmError {
    #[msg("Default Error")]
    DefaultError,
    #[msg("Offer Expired")]
    OfferExpired,
    #[msg("This pool is locked")]
    PoolLocked,
    #[msg("Slippage exceeded")]
    SlippageExceded,
    #[msg("OverFlow detected")]
    Overflow,
    #[msg("UnderFlow detected")]
    Underflow,
    #[msg("Invalid Token")]
    InvalidToken,
    #[msg("Actual Liquidity is Less than minimum")]
    LiquidityLessThanMinium,
    #[msg("No Liquidity in Pool")]
    NoLiquidityInPool,
    #[msg("Bump Error")]
    BumpError,
    #[msg("Curve Error")]
    CurveError,
    #[msg("Fee is greater than 100%, This is not very good deal")]
    InvalidFee,
    #[msg("Invalid update authority")]
    InvalidAuthority,
    #[msg("No update authority set")]
    NoAuthoritySet,
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Invalid precision")]
    InvalidPrecision,
    #[msg("Insufficient balance")]
    Insufficientbalance,
    #[msg("Zero balance")]
    ZeroBalance,
}

impl From<CurveError> for AmmError {
    fn from(error: CurveError) -> AmmError {
        match error {
            CurveError::InvalidPrecision => AmmError::InvalidPrecision,
            CurveError::Overflow => AmmError::Overflow,
            CurveError::Underflow => AmmError::Underflow,
            CurveError::InvalidFeeAmount => AmmError::InvalidFee,
            CurveError::InsufficientBalance => AmmError::Insufficientbalance,
            CurveError::ZeroBalance => AmmError::ZeroBalance,
            CurveError::SlippageLimitExceeded => AmmError::SlippageExceded,
        }
    }
}
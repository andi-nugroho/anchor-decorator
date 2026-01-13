use anchor_lang::prelude::*;

#[account]
pub struct Config { // this is from platform perspective
    pub seed: u64,      // to create different pools
    pub authority: Option<Pubkey>, // who can create lock unlock the pools change the authority and all
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub fee: u16,
    pub locked: bool,
    pub config_bump: u8,
    pub lp_bump: u8,
}

impl Space for Config {
    const INIT_SPACE: usize = 8 + 8 + 32+1 + 32*2 + 2 + 1 + 1*2 ;
}
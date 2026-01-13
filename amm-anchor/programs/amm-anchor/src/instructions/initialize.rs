use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount}
};

use crate::Config;

#[derive(Accounts)]
#[instruction(seed: u64)] // we will be getting the seed from input arg so we need to put here as instruction arg
pub struct Initialize <'info> {
    #[account(mut)] 
    pub admin: Signer<'info>,

    pub mint_x: Account<'info, Mint>,
    pub mint_y: Account<'info, Mint>,

    #[account( // its a MINT pda interesting we can make anything a PDA
        init,
        payer = admin,
        seeds = [b"lp", config.key.as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = config // we need config to mint the token in program instruction
    )]
    pub mint_lp: Account<'info, Mint>, // creating a lp mint that we will mint to user when they deposit into liquidity

    #[account(
        init,
        payer = admin,
        associated_token::mint = mint_x,
        associated_token::authority = config,
    )]
    pub vault_x: Account<'info, TokenAccount>, // we are only supporting Token account so dont need to use interface so it just support just token-22

    #[account(
        init,
        payer = admin,
        associated_token::mint = mint_y,
        associated_token::authority = config,
    )]
    pub vault_y: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        seeds = [b"config", seed.to_le_bytes().as_ref()], // better  seeds = [b"config", mint_x.key().as_ref(), mint_y.key().as_ref(), config.seed.to_le_bytes().as_ref()],
        bump,
        space = Config::INIT_SPACE,
    )]
    pub config: Account<'info, Config>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl <'info> Initialize <'info> {
    pub fn initialize(&mut self, seed: u64, fee: u16, authority: Option<Pubkey>, bumps: &InitializeBumps) -> Result<()> {
        self.config.set_inner( Config {
            seed,
            authority,
            mint_x: self.mint_x.key(),
            mint_y: self.mint_y.key(),
            fee,
            locked: false,
            config_bump: bumps.config,
            lp_bump: bumps.mint_lp,
        });
        
        
        Ok(())
    }
}

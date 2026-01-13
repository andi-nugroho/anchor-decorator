use anchor_lang::prelude::*;
use crate::{error::AmmError,state::Config};

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer}
};

use constant_product_curve::ConstantProduct;


#[derive(Accounts)]
pub struct Deposit <'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint_x: Account<'info, Mint>,
    pub mint_y: Account<'info, Mint>,

    #[account(
        seeds = [b"config", config.seed.to_le_bytes().as_ref()], // better  seeds = [b"config", mint_x.key().as_ref(), mint_y.key().as_ref(), config.seed.to_le_bytes().as_ref()],
        bump = config.config_bump,
        has_one = mint_x, // cannot directly use config we need to check if it has same mint we are dealing with ?
        has_one = mint_y,
    )]
    pub config: Account<'info, Config>, // tells us about the liquidity pool that we are dealing with

    #[account(
        mut,
        seeds = [b"lp", config.key().as_ref()],
        bump = config.lp_bump,
    )]
    pub mint_lp: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = config,
    )]
    pub vault_x: Account<'info, TokenAccount>, // we are only supporting Token account so dont need to use interface so it just support just token-22

    #[account(
        mut,
        associated_token::mint = mint_y,
        associated_token::authority = config,
    )]
    pub vault_y: Account<'info, TokenAccount>,

    // now we need user ata_x and ata_y to take token from theit ata and deposit into vaults

    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = user,
    )]
    pub user_x: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint_y,
        associated_token::authority = user,
    )]
    pub user_y: Account<'info, TokenAccount>,

    // we also need user LP to depost LP tokens

    #[account(
        // init_if_needed, // better to avoid this and create ATA on client side integrations
        // payer = user,
        mut,
        associated_token::mint = mint_lp,
        associated_token::authority = user,
    )]
    pub user_lp: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

}


impl <'info> Deposit <'info> {

    pub fn deposit (
        &mut self,
        amount: u64, // refers to amount of lp tokens user want to claim
        max_x:u64, // refers user need to deposit max token_x to get amount of lp
        max_y:u64 // refers user need to deposit max token_x to get amount of lp
    ) -> Result<()> {
        
        require!(self.config.locked == false, AmmError::PoolLocked);
        require!(amount != 0, AmmError::InvalidAmount);



        // checking if this is the first deposit then -> we dont need to calculate stuff from the curve because rn curve doesnt exit this deposit will make the curve so we can directly do it
        let (x,y) = match self.mint_lp.supply == 0 && self.vault_x.amount == 0 && self.vault_y.amount == 0 {
            true => (max_x, max_y), // curve doenst exist
            false => {              // curve exist
                let amounts = ConstantProduct::xy_deposit_amounts_from_l(self.vault_x.amount, self.vault_y.amount, self.mint_lp.supply, amount, 6).unwrap();
                (amounts.x, amounts.y)
            }
        };

        require!(x <= max_x && y <= max_y, AmmError::SlippageExceded);
        self.deposit_tokens(true, x)?; // deposting x token
        self.deposit_tokens(false, y)?; // deposting y token

        // now we need to mint amount of lp token into user ata

        self.mint_lp_tokens(amount)

    }
    pub fn deposit_tokens(&mut self, is_x:bool, amount: u64 ) -> Result<()> {
        let (from, to) = match is_x {
            true => (self.user_x.to_account_info(), self.vault_x.to_account_info()),
            false => (self.user_y.to_account_info(), self.vault_y.to_account_info())
        };

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = Transfer {
            from,
            to,
            authority: self.user.to_account_info()
        };

        let ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(ctx, amount) // transfer checkerd is depreciatred for token interface but we are using tokenaccount
    }

    pub fn mint_lp_tokens(&mut self, amount: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = MintTo {
            mint: self.mint_lp.to_account_info(),
            to: self.user_lp.to_account_info(),
            authority: self.config.to_account_info()
        };

        let seeds = &[
            &b"config"[..],
            &self.config.seed.to_le_bytes(),
            &[self.config.config_bump]
        ];

        let signer_seeds = &[&seeds[..]];

        let ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        mint_to(ctx, amount)
    }


}
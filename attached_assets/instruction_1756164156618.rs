use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + USVState::LEN,
        seeds = [b"usv_state"],
        bump
    )]
    pub usv_state: Account<'info, USVState>,
    
    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = mint_authority,
        seeds = [b"mint"],
        bump
    )]
    pub mint: Account<'info, Mint>,
    
    /// CHECK: This is the mint authority PDA
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = admin,
        token::mint = mint,
        token::authority = admin,
    )]
    pub admin_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(count: u32)]
pub struct GenerateQRCodes<'info> {
    #[account(
        mut,
        seeds = [b"usv_state"],
        bump = usv_state.bump,
        has_one = admin
    )]
    pub usv_state: Account<'info, USVState>,
    
    #[account(
        init,
        payer = admin,
        space = 8 + QRCodeAccount::LEN,
        seeds = [b"qr_code", &usv_state.total_qr_codes.to_le_bytes()],
        bump
    )]
    pub qr_code_account: Account<'info, QRCodeAccount>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(qr_code: String)]
pub struct ClaimTokens<'info> {
    #[account(
        mut,
        seeds = [b"usv_state"],
        bump = usv_state.bump
    )]
    pub usv_state: Account<'info, USVState>,
    
    #[account(
        mut,
        seeds = [b"qr_code", qr_code.as_bytes()],
        bump = qr_code_account.bump
    )]
    pub qr_code_account: Account<'info, QRCodeAccount>,
    
    #[account(
        mut,
        token::mint = usv_state.mint,
        token::authority = admin,
    )]
    pub admin_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = claimer,
        token::mint = usv_state.mint,
        token::authority = claimer,
    )]
    pub claimer_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the admin account from state
    #[account(mut, address = usv_state.admin)]
    pub admin: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub claimer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
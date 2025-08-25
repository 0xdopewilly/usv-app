use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("DT43tfD1z2RvbocvkU2dc2a3XNrSpk8UKcxAtQ8xe5VP");

#[program]
pub mod usv_trading {
    use super::*;

    // Initialize trading contract
    pub fn initialize_trading(ctx: Context<InitializeTrading>) -> Result<()> {
        let trading_state = &mut ctx.accounts.trading_state;
        
        trading_state.authority = ctx.accounts.authority.key();
        trading_state.usv_mint = ctx.accounts.usv_mint.key();
        trading_state.fixed_price_cents = 20; // 20 cents USD
        trading_state.is_active = true;
        trading_state.total_sales_volume = 0;
        trading_state.total_purchases = 0;
        trading_state.bump = ctx.bumps.trading_state;

        msg!("USV Trading contract initialized with fixed price: {} cents", trading_state.fixed_price_cents);
        Ok(())
    }

    // Fixed-price token purchase (20 cents USD)
    pub fn buy_tokens_fixed_price(
        ctx: Context<BuyTokensFixedPrice>,
        sol_amount: u64, // Amount in lamports
    ) -> Result<()> {
        require!(ctx.accounts.trading_state.is_active, ErrorCode::TradingPaused);
        
        let trading_state = &mut ctx.accounts.trading_state;
        
        // Mock SOL price (replace with actual oracle in production)
        let sol_price_usd = 100.0; // $100 per SOL
        
        // Calculate how many tokens buyer gets
        let sol_value_usd = (sol_amount as f64 / 1_000_000_000.0) * sol_price_usd;
        let token_amount = ((sol_value_usd / 0.20) * 1_000_000.0) as u64; // Convert to token decimals
        
        require!(token_amount > 0, ErrorCode::InsufficientPayment);

        // Transfer SOL from buyer to authority
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.authority.key(),
            sol_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.authority.to_account_info(),
            ],
        )?;

        // Transfer USV tokens from authority to buyer
        let cpi_accounts = Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, token_amount)?;

        // Update trading statistics
        trading_state.total_sales_volume += sol_amount;
        trading_state.total_purchases += 1;

        emit!(TokenPurchase {
            buyer: ctx.accounts.buyer.key(),
            sol_amount,
            token_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Admin functions
    pub fn update_fixed_price(
        ctx: Context<UpdateFixedPrice>,
        new_price_cents: u64,
    ) -> Result<()> {
        let old_price = ctx.accounts.trading_state.fixed_price_cents;
        ctx.accounts.trading_state.fixed_price_cents = new_price_cents;
        
        emit!(PriceUpdated {
            old_price,
            new_price: new_price_cents,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    pub fn toggle_trading(ctx: Context<ToggleTrading>, is_active: bool) -> Result<()> {
        ctx.accounts.trading_state.is_active = is_active;
        Ok(())
    }

    // Get trading statistics
    pub fn get_trading_stats(ctx: Context<GetTradingStats>) -> Result<()> {
        let trading_state = &ctx.accounts.trading_state;
        
        emit!(TradingStats {
            total_sales_volume: trading_state.total_sales_volume,
            total_purchases: trading_state.total_purchases,
            fixed_price_cents: trading_state.fixed_price_cents,
            is_active: trading_state.is_active,
        });

        Ok(())
    }
}

// State Accounts
#[account]
pub struct TradingState {
    pub authority: Pubkey,
    pub usv_mint: Pubkey,
    pub fixed_price_cents: u64, // Price in USD cents
    pub is_active: bool,
    pub total_sales_volume: u64, // Total SOL received
    pub total_purchases: u64,    // Number of purchases
    pub bump: u8,
}

// Context Structs
#[derive(Accounts)]
pub struct InitializeTrading<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 1 + 8 + 8 + 1,
        seeds = [b"trading_state"],
        bump
    )]
    pub trading_state: Account<'info, TradingState>,

    /// CHECK: USV token mint
    pub usv_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokensFixedPrice<'info> {
    #[account(
        mut,
        seeds = [b"trading_state"],
        bump = trading_state.bump
    )]
    pub trading_state: Account<'info, TradingState>,

    #[account(
        constraint = usv_mint.key() == trading_state.usv_mint @ ErrorCode::InvalidMint
    )]
    pub usv_mint: Account<'info, Mint>,

    #[account(
        mut,
        token::mint = usv_mint,
        token::authority = authority
    )]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = usv_mint,
        token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: Authority from trading state
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFixedPrice<'info> {
    #[account(
        mut,
        seeds = [b"trading_state"],
        bump = trading_state.bump,
        has_one = authority
    )]
    pub trading_state: Account<'info, TradingState>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ToggleTrading<'info> {
    #[account(
        mut,
        seeds = [b"trading_state"],
        bump = trading_state.bump,
        has_one = authority
    )]
    pub trading_state: Account<'info, TradingState>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetTradingStats<'info> {
    #[account(
        seeds = [b"trading_state"],
        bump = trading_state.bump
    )]
    pub trading_state: Account<'info, TradingState>,
}

// Events
#[event]
pub struct TokenPurchase {
    pub buyer: Pubkey,
    pub sol_amount: u64,
    pub token_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PriceUpdated {
    pub old_price: u64,
    pub new_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct TradingStats {
    pub total_sales_volume: u64,
    pub total_purchases: u64,
    pub fixed_price_cents: u64,
    pub is_active: bool,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Trading is currently paused")]
    TradingPaused,
    #[msg("Insufficient payment amount")]
    InsufficientPayment,
    #[msg("Invalid mint provided")]
    InvalidMint,
}

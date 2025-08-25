// programs/usv-token/src/lib.rs - Fixed for Anchor 0.29.0/0.30.0

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, MintTo};
use anchor_spl::associated_token::AssociatedToken;
use sha2::{Sha256, Digest};

declare_id!("BAagt8iyDDDConY335Dd49vvMww18L6mqd8sx4SvvxGX");

#[program]
pub mod usv_token {
    use super::*;

    // Initialize the USV Token system
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let usv_state = &mut ctx.accounts.usv_state;
        
        // Initialize state
        usv_state.authority = ctx.accounts.authority.key();
        usv_state.mint = ctx.accounts.mint.key();
        usv_state.total_supply = 1_000_000_000 * 10_u64.pow(6); // 1 billion tokens with 6 decimals
        usv_state.tokens_claimed = 0;
        usv_state.total_qr_codes = 0;
        usv_state.is_paused = false;
        usv_state.bump = ctx.bumps.usv_state;
      usv_state.mint_bump = ctx.bumps.mint;

        // Mint entire supply to authority
       let mint_authority_bump = ctx.bumps.mint_authority;
        let mint_seeds = &[b"mint_authority".as_ref(), &[mint_authority_bump]];

        let signer = &[&mint_seeds[..]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.authority_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::mint_to(cpi_ctx, usv_state.total_supply)?;

        msg!("USV Token initialized with {} tokens minted to authority", usv_state.total_supply);
        Ok(())
    }

    // Generate QR codes with unique hashes
    pub fn generate_qr_codes(
        ctx: Context<GenerateQRCodes>,
        count: u32,
        partner_id: Option<String>,
        batch_info: String,
    ) -> Result<()> {
        require!(!ctx.accounts.usv_state.is_paused, ErrorCode::ProgramPaused);
        
        let usv_state = &mut ctx.accounts.usv_state;
        let qr_batch = &mut ctx.accounts.qr_batch;

        // Initialize QR batch account
        qr_batch.batch_id = format!("BATCH_{}", Clock::get()?.unix_timestamp);
        qr_batch.count = count;
        qr_batch.partner_id = partner_id;
        qr_batch.batch_info = batch_info;
        qr_batch.created_at = Clock::get()?.unix_timestamp;
        qr_batch.authority = ctx.accounts.authority.key();
      qr_batch.bump = ctx.bumps.qr_batch;

        // Generate QR code hashes
        let mut qr_hashes = Vec::new();
        for i in 0..count {
            let unique_data = format!(
                "USV_{}_{}_{}_{}", 
                usv_state.total_qr_codes + i,
                Clock::get()?.unix_timestamp,
                ctx.accounts.authority.key(),
                i
            );
            
            let mut hasher = Sha256::new();
            hasher.update(unique_data.as_bytes());
            let hash = hasher.finalize();
            let hash_string = format!("{:x}", hash)[..16].to_string(); // First 16 chars
            
            qr_hashes.push(hash_string);
        }
        
        qr_batch.qr_hashes = qr_hashes;
        usv_state.total_qr_codes += count;

        emit!(QRCodesGenerated {
            batch_id: qr_batch.batch_id.clone(),
            count,
            partner_id: qr_batch.partner_id.clone(),
            authority: ctx.accounts.authority.key(),
        });

        Ok(())
    }

    // Claim tokens using QR code hash
    pub fn claim_tokens(
        ctx: Context<ClaimTokens>,
        qr_hash: String,
        user_email: Option<String>,
    ) -> Result<()> {
        require!(!ctx.accounts.usv_state.is_paused, ErrorCode::ProgramPaused);
        
        let usv_state = &mut ctx.accounts.usv_state;
        let qr_claim = &mut ctx.accounts.qr_claim;

        // Initialize claim record
        qr_claim.qr_hash = qr_hash.clone();
        qr_claim.claimer = ctx.accounts.claimer.key();
        qr_claim.claimed_at = Clock::get()?.unix_timestamp;
        qr_claim.user_email = user_email.clone();
        qr_claim.is_claimed = true;
       qr_claim.bump = ctx.bumps.qr_claim;

        // Transfer 1 token from authority to claimer (gas paid by authority)
        let token_amount = 1 * 10_u64.pow(6); // 1 token with 6 decimals
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.claimer_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, token_amount)?;

        usv_state.tokens_claimed += token_amount;

        emit!(TokensClaimed {
            qr_hash: qr_hash.clone(),
            claimer: ctx.accounts.claimer.key(),
            amount: token_amount,
            user_email,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Manual transfer for partner/pharmacy distribution
    pub fn transfer_to_partner(
        ctx: Context<TransferToPartner>,
        amount: u64,
        partner_info: String,
    ) -> Result<()> {
        require!(!ctx.accounts.usv_state.is_paused, ErrorCode::ProgramPaused);
        require!(amount >= 1000 * 10_u64.pow(6), ErrorCode::MinimumPartnerTransfer); // Min 1000 tokens
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.partner_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;

        emit!(PartnerTransfer {
            partner: ctx.accounts.partner.key(),
            amount,
            partner_info,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Security functions
    pub fn set_pause_state(ctx: Context<SetPauseState>, is_paused: bool) -> Result<()> {
        ctx.accounts.usv_state.is_paused = is_paused;
        Ok(())
    }

    // Get program statistics
    pub fn get_stats(ctx: Context<GetStats>) -> Result<()> {
        let usv_state = &ctx.accounts.usv_state;
        
        emit!(ProgramStats {
            total_supply: usv_state.total_supply,
            tokens_claimed: usv_state.tokens_claimed,
            total_qr_codes: usv_state.total_qr_codes,
            is_paused: usv_state.is_paused,
            authority: usv_state.authority,
        });

        Ok(())
    }
}

// State Accounts
#[account]
pub struct USVState {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub tokens_claimed: u64,
    pub total_qr_codes: u32,
    pub is_paused: bool,
    pub bump: u8,
    pub mint_bump: u8,
}

#[account]
pub struct QRBatch {
    pub batch_id: String,
    pub count: u32,
    pub partner_id: Option<String>,
    pub batch_info: String,
    pub qr_hashes: Vec<String>,
    pub created_at: i64,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct QRClaim {
    pub qr_hash: String,
    pub claimer: Pubkey,
    pub claimed_at: i64,
    pub user_email: Option<String>,
    pub is_claimed: bool,
    pub bump: u8,
}

// Context Structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 4 + 1 + 1 + 1,
        seeds = [b"usv_state"],
        bump
    )]
    pub usv_state: Account<'info, USVState>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = mint_authority,
        seeds = [b"mint"],
        bump
    )]
    pub mint: Account<'info, Mint>,

    /// CHECK: PDA for mint authority
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority
    )]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(count: u32, partner_id: Option<String>, batch_info: String)]
pub struct GenerateQRCodes<'info> {
    #[account(
        mut,
        seeds = [b"usv_state"],
        bump = usv_state.bump,
        has_one = authority
    )]
    pub usv_state: Account<'info, USVState>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 64 + 64 + (count as usize * 32) + 8 + 32 + 1,
       // seeds = [b"qr_batch", authority.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        seeds = [b"qr_batch", authority.key().as_ref(), &usv_state.total_qr_codes.to_le_bytes()],
        bump
    )]
    pub qr_batch: Account<'info, QRBatch>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(qr_hash: String)]
pub struct ClaimTokens<'info> {
    #[account(
        mut,
        seeds = [b"usv_state"],
        bump = usv_state.bump
    )]
    pub usv_state: Account<'info, USVState>,

    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 64 + 1 + 1,
        seeds = [b"qr_claim", qr_hash.as_bytes()],
        bump
    )]
    pub qr_claim: Account<'info, QRClaim>,

    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = claimer
    )]
    pub claimer_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = authority.key() == usv_state.authority
    )]
    pub authority: Signer<'info>,

    /// CHECK: The wallet claiming tokens
    pub claimer: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferToPartner<'info> {
    #[account(
        seeds = [b"usv_state"],
        bump = usv_state.bump,
        has_one = authority
    )]
    pub usv_state: Account<'info, USVState>,

    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = partner
    )]
    pub partner_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    /// CHECK: Partner wallet
    pub partner: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPauseState<'info> {
    #[account(
        mut,
        seeds = [b"usv_state"],
        bump = usv_state.bump,
        has_one = authority
    )]
    pub usv_state: Account<'info, USVState>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetStats<'info> {
    #[account(
        seeds = [b"usv_state"],
        bump = usv_state.bump
    )]
    pub usv_state: Account<'info, USVState>,
}

// Events
#[event]
pub struct QRCodesGenerated {
    pub batch_id: String,
    pub count: u32,
    pub partner_id: Option<String>,
    pub authority: Pubkey,
}

#[event]
pub struct TokensClaimed {
    pub qr_hash: String,
    pub claimer: Pubkey,
    pub amount: u64,
    pub user_email: Option<String>,
    pub timestamp: i64,
}

#[event]
pub struct PartnerTransfer {
    pub partner: Pubkey,
    pub amount: u64,
    pub partner_info: String,
    pub timestamp: i64,
}

#[event]
pub struct ProgramStats {
    pub total_supply: u64,
    pub tokens_claimed: u64,
    pub total_qr_codes: u32,
    pub is_paused: bool,
    pub authority: Pubkey,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Program is currently paused")]
    ProgramPaused,
    #[msg("QR code has already been claimed")]
    QRAlreadyClaimed,
    #[msg("Minimum partner transfer is 1000 tokens")]
    MinimumPartnerTransfer,
    #[msg("Invalid QR code hash")]
    InvalidQRHash,
    #[msg("Unauthorized access")]
    Unauthorized,
}

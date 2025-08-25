use anchor_lang::prelude::*;

#[account]
pub struct USVState {
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub tokens_claimed: u64,
    pub total_qr_codes: u32,
    pub token_price_cents: u64,
    pub is_paused: bool,
    pub bump: u8,
}

impl USVState {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 4 + 8 + 1 + 1 + 8;
}

#[account]
pub struct QRCodeAccount {
    pub code: String,
    pub is_claimed: bool,
    pub partner_id: Option<String>,
    pub batch_info: String,
    pub created_at: i64,
    pub claimed_at: Option<i64>,
    pub claimer: Option<Pubkey>,
    pub bump: u8,
}

impl QRCodeAccount {
    pub const LEN: usize = 4 + 32 + 1 + 1 + 4 + 64 + 4 + 64 + 8 + 1 + 8 + 1 + 32 + 1 + 8;
}
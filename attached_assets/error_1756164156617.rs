use anchor_lang::prelude::*;

#[error_code]
pub enum USVError {
    #[msg("The program is currently paused")]
    ProgramPaused,
    
    #[msg("Invalid QR code count. Must be between 1 and 1000")]
    InvalidQRCodeCount,
    
    #[msg("QR code has already been claimed")]
    QRCodeAlreadyClaimed,
    
    #[msg("Invalid QR code provided")]
    InvalidQRCode,
    
    #[msg("Invalid amount specified")]
    InvalidAmount,
    
    #[msg("Insufficient payment for token purchase")]
    InsufficientPayment,
}
const anchor = require("@coral-xyz/anchor");
const { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL 
} = require("@solana/web3.js");
const { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount
} = require("@solana/spl-token");
const { assert } = require("chai");

describe("USV Token Smart Contract Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const usvTokenProgram = anchor.workspace.UsvToken;

  // Test accounts - Generate new ones each run to avoid conflicts
  let authority;
  let user1;
  let user2;
  let partner;
  
  // PDAs
  let usvStatePDA;
  let mintPDA;
  let mintAuthorityPDA;
  
  // Token accounts
  let authorityTokenAccount;
  let user1TokenAccount;
  let user2TokenAccount;
  let partnerTokenAccount;

  // Test data
  const TOTAL_SUPPLY = 1_000_000_000 * 1_000_000; // 1B tokens with 6 decimals
  const TOKEN_AMOUNT = 1 * 1_000_000; // 1 token with 6 decimals
  const PARTNER_MIN_AMOUNT = 1000 * 1_000_000; // 1000 tokens minimum

  before(async () => {
    // Generate fresh test accounts each run
    authority = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();
    partner = Keypair.generate();

    console.log("🔑 Test Authority:", authority.publicKey.toString());

    // Airdrop SOL to test accounts
    const airdropPromises = [
      provider.connection.requestAirdrop(authority.publicKey, 3 * LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(user1.publicKey, 2 * LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(user2.publicKey, 2 * LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(partner.publicKey, 2 * LAMPORTS_PER_SOL)
    ];

    // Wait for all airdrops
    for (const airdropTx of airdropPromises) {
      await provider.connection.confirmTransaction(await airdropTx);
    }

    // Find PDAs - These are deterministic based on seeds
    [usvStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("usv_state")],
      usvTokenProgram.programId
    );

    [mintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      usvTokenProgram.programId
    );

    [mintAuthorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority")],
      usvTokenProgram.programId
    );

    // Get associated token accounts
    authorityTokenAccount = await getAssociatedTokenAddress(mintPDA, authority.publicKey);
    user1TokenAccount = await getAssociatedTokenAddress(mintPDA, user1.publicKey);
    user2TokenAccount = await getAssociatedTokenAddress(mintPDA, user2.publicKey);
    partnerTokenAccount = await getAssociatedTokenAddress(mintPDA, partner.publicKey);

    console.log("📍 USV State PDA:", usvStatePDA.toString());
    console.log("🪙 Mint PDA:", mintPDA.toString());
  });

  describe("USV Token Contract Tests", () => {
    
    describe("Initialize", () => {
      it("Should initialize the USV token contract successfully", async () => {
        const tx = await usvTokenProgram.methods
          .initialize()
          .accounts({
            usvState: usvStatePDA,
            mint: mintPDA,
            mintAuthority: mintAuthorityPDA,
            authorityTokenAccount: authorityTokenAccount,
            authority: authority.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([authority])
          .rpc();

        console.log("✅ Initialize TX:", tx);

        // Verify state
        const usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        assert.equal(usvState.authority.toString(), authority.publicKey.toString());
        assert.equal(usvState.mint.toString(), mintPDA.toString());
        assert.equal(usvState.totalSupply.toString(), TOTAL_SUPPLY.toString());
        assert.equal(usvState.tokensClaimed.toString(), "0");
        assert.equal(usvState.totalQrCodes, 0);
        assert.equal(usvState.isPaused, false);

        // Verify mint exists
        const mintInfo = await provider.connection.getAccountInfo(mintPDA);
        assert.isNotNull(mintInfo);

        // Verify authority has all tokens
        const authorityTokenAccountInfo = await getAccount(provider.connection, authorityTokenAccount);
        assert.equal(authorityTokenAccountInfo.amount.toString(), TOTAL_SUPPLY.toString());

        console.log("✅ USV Token initialized successfully!");
        console.log("🏦 Total Supply:", TOTAL_SUPPLY.toString());
        console.log("💰 Authority Balance:", authorityTokenAccountInfo.amount.toString());
      });

      it("Should fail to initialize twice", async () => {
        try {
          await usvTokenProgram.methods
            .initialize()
            .accounts({
              usvState: usvStatePDA,
              mint: mintPDA,
              mintAuthority: mintAuthorityPDA,
              authorityTokenAccount: authorityTokenAccount,
              authority: authority.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([authority])
            .rpc();
          assert.fail("Should have failed");
        } catch (error) {
          assert.include(error.message, "already in use");
          console.log("✅ Correctly prevented double initialization");
        }
      });
    });

    describe("Generate QR Codes", () => {
      it("Should generate QR codes successfully", async () => {
        const count = 5;
        const partnerId = "PARTNER_001";
        const batchInfo = "Test batch for pharmacy";

        // Get current state to use total_qr_codes as seed
        const usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        
        // Use total_qr_codes as seed (starts at 0)
        const qrCountBytes = Buffer.alloc(4);
        qrCountBytes.writeUInt32LE(usvState.totalQrCodes, 0);

        console.log("⏰ Using QR count as seed:", usvState.totalQrCodes);

        const [qrBatchPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("qr_batch"),
            authority.publicKey.toBuffer(),
            qrCountBytes
          ],
          usvTokenProgram.programId
        );

        console.log("📦 QR Batch PDA:", qrBatchPDA.toString());

        const tx = await usvTokenProgram.methods
          .generateQrCodes(count, partnerId, batchInfo)
          .accounts({
            usvState: usvStatePDA,
            qrBatch: qrBatchPDA,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();

        console.log("✅ Generate QR TX:", tx);

        // Verify QR batch was created
        const qrBatch = await usvTokenProgram.account.qrBatch.fetch(qrBatchPDA);
        assert.equal(qrBatch.count, count);
        assert.equal(qrBatch.partnerId, partnerId);
        assert.equal(qrBatch.batchInfo, batchInfo);
        assert.equal(qrBatch.qrHashes.length, count);
        assert.equal(qrBatch.authority.toString(), authority.publicKey.toString());

        // Verify state was updated
        const finalUsvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        assert.equal(finalUsvState.totalQrCodes, count);

        // Verify QR hashes are unique
        const uniqueHashes = new Set(qrBatch.qrHashes);
        assert.equal(uniqueHashes.size, count);

        console.log("✅ Generated", count, "QR codes successfully!");
        console.log("🔗 Sample QR Hash:", qrBatch.qrHashes[0]);
      });
    });

    describe("Claim Tokens", () => {
      let testQrHash;

      before(async () => {
        // Get current state to use next total_qr_codes as seed
        const usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        
        // Use current total_qr_codes (should be 5 from previous test)
        const qrCountBytes = Buffer.alloc(4);
        qrCountBytes.writeUInt32LE(usvState.totalQrCodes, 0);

        console.log("⏰ Claim test using QR count seed:", usvState.totalQrCodes);

        const [qrBatchPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("qr_batch"),
            authority.publicKey.toBuffer(),
            qrCountBytes
          ],
          usvTokenProgram.programId
        );

        console.log("📦 Claim test QR Batch PDA:", qrBatchPDA.toString());

        await usvTokenProgram.methods
          .generateQrCodes(1, null, "Test batch for claiming")
          .accounts({
            usvState: usvStatePDA,
            qrBatch: qrBatchPDA,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();

        const qrBatch = await usvTokenProgram.account.qrBatch.fetch(qrBatchPDA);
        testQrHash = qrBatch.qrHashes[0];
        
        console.log("🎫 Test QR Hash:", testQrHash);
      });

      it("Should claim tokens successfully", async () => {
        const userEmail = "test@example.com";
        
        const [qrClaimPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("qr_claim"), Buffer.from(testQrHash)],
          usvTokenProgram.programId
        );

        console.log("🎟️ QR Claim PDA:", qrClaimPDA.toString());

        // Get initial balances
        const initialAuthorityBalance = await getAccount(provider.connection, authorityTokenAccount);
        
        const tx = await usvTokenProgram.methods
          .claimTokens(testQrHash, userEmail)
          .accounts({
            usvState: usvStatePDA,
            qrClaim: qrClaimPDA,
            authorityTokenAccount: authorityTokenAccount,
            claimerTokenAccount: user1TokenAccount,
            mint: mintPDA,
            authority: authority.publicKey,
            claimer: user1.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();

        console.log("✅ Claim TX:", tx);

        // Verify claim record
        const qrClaim = await usvTokenProgram.account.qrClaim.fetch(qrClaimPDA);
        assert.equal(qrClaim.qrHash, testQrHash);
        assert.equal(qrClaim.claimer.toString(), user1.publicKey.toString());
        assert.equal(qrClaim.userEmail, userEmail);
        assert.equal(qrClaim.isClaimed, true);

        // Verify token transfer
        const claimerBalance = await getAccount(provider.connection, user1TokenAccount);
        assert.equal(claimerBalance.amount.toString(), TOKEN_AMOUNT.toString());

        const finalAuthorityBalance = await getAccount(provider.connection, authorityTokenAccount);
        assert.equal(
          finalAuthorityBalance.amount.toString(),
          (BigInt(initialAuthorityBalance.amount.toString()) - BigInt(TOKEN_AMOUNT)).toString()
        );

        // Verify state update
        const usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        assert.equal(usvState.tokensClaimed.toString(), TOKEN_AMOUNT.toString());

        console.log("✅ Token claim successful!");
        console.log("🪙 Claimer balance:", claimerBalance.amount.toString());
        console.log("📊 Total claimed:", usvState.tokensClaimed.toString());
      });

      it("Should fail to claim the same QR code twice", async () => {
        const [qrClaimPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("qr_claim"), Buffer.from(testQrHash)],
          usvTokenProgram.programId
        );

        try {
          await usvTokenProgram.methods
            .claimTokens(testQrHash, "another@example.com")
            .accounts({
              usvState: usvStatePDA,
              qrClaim: qrClaimPDA,
              authorityTokenAccount: authorityTokenAccount,
              claimerTokenAccount: user2TokenAccount,
              mint: mintPDA,
              authority: authority.publicKey,
              claimer: user2.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            })
            .signers([authority])
            .rpc();
          assert.fail("Should have failed");
        } catch (error) {
          assert.include(error.message, "already in use");
          console.log("✅ Correctly prevented double claim");
        }
      });
    });

    describe("Partner Transfer", () => {
      it("Should transfer tokens to partner successfully", async () => {
        const transferAmount = PARTNER_MIN_AMOUNT;
        const partnerInfo = "Pharmacy ABC - Downtown Location";

        const initialAuthorityBalance = await getAccount(provider.connection, authorityTokenAccount);

        const tx = await usvTokenProgram.methods
          .transferToPartner(new anchor.BN(transferAmount), partnerInfo)
          .accounts({
            usvState: usvStatePDA,
            authorityTokenAccount: authorityTokenAccount,
            partnerTokenAccount: partnerTokenAccount,
            mint: mintPDA,
            partner: partner.publicKey,
            authority: authority.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();

        console.log("✅ Partner Transfer TX:", tx);

        // Verify partner received tokens
        const partnerBalance = await getAccount(provider.connection, partnerTokenAccount);
        assert.equal(partnerBalance.amount.toString(), transferAmount.toString());

        // Verify authority balance decreased
        const finalAuthorityBalance = await getAccount(provider.connection, authorityTokenAccount);
        assert.equal(
          finalAuthorityBalance.amount.toString(),
          (BigInt(initialAuthorityBalance.amount.toString()) - BigInt(transferAmount)).toString()
        );

        console.log("✅ Partner transfer successful!");
        console.log("🤝 Partner balance:", partnerBalance.amount.toString());
      });

      it("Should fail to transfer less than minimum amount", async () => {
        const transferAmount = 100 * 1_000_000; // 100 tokens (less than 1000 minimum)
        const partnerInfo = "Test partner";

        try {
          await usvTokenProgram.methods
            .transferToPartner(new anchor.BN(transferAmount), partnerInfo)
            .accounts({
              usvState: usvStatePDA,
              authorityTokenAccount: authorityTokenAccount,
              partnerTokenAccount: partnerTokenAccount,
              mint: mintPDA,
              partner: partner.publicKey,
              authority: authority.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            })
            .signers([authority])
            .rpc();
          assert.fail("Should have failed");
        } catch (error) {
          assert.include(error.message, "Minimum partner transfer is 1000 tokens");
          console.log("✅ Correctly enforced minimum transfer amount");
        }
      });
    });

    describe("Pause/Unpause", () => {
      it("Should pause and unpause successfully", async () => {
        // Pause
        const pauseTx = await usvTokenProgram.methods
          .setPauseState(true)
          .accounts({
            usvState: usvStatePDA,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        console.log("⏸️ Pause TX:", pauseTx);

        let usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        assert.equal(usvState.isPaused, true);

        // Unpause
        const unpauseTx = await usvTokenProgram.methods
          .setPauseState(false)
          .accounts({
            usvState: usvStatePDA,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();

        console.log("▶️ Unpause TX:", unpauseTx);

        usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        assert.equal(usvState.isPaused, false);

        console.log("✅ Pause/unpause functionality works!");
      });
    });

    describe("Final State Check", () => {
      it("Should have correct final program state", async () => {
        const usvState = await usvTokenProgram.account.usvState.fetch(usvStatePDA);
        
        console.log("\n🎉 FINAL STATE SUMMARY:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🏛️  Authority:", usvState.authority.toString());
        console.log("🪙  Mint:", usvState.mint.toString());
        console.log("💰  Total Supply:", usvState.totalSupply.toString());
        console.log("🎫  Tokens Claimed:", usvState.tokensClaimed.toString());
        console.log("📦  Total QR Codes:", usvState.totalQrCodes);
        console.log("⏸️  Is Paused:", usvState.isPaused);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Verify basic state
        assert.equal(usvState.authority.toString(), authority.publicKey.toString());
        assert.equal(usvState.totalSupply.toString(), TOTAL_SUPPLY.toString());
        assert.isTrue(usvState.totalQrCodes > 0);
        assert.equal(usvState.isPaused, false);
        
        console.log("🎊 ALL TESTS COMPLETED SUCCESSFULLY!");
      });
    });
  });
});

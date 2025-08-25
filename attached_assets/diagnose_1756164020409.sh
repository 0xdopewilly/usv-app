#!/bin/bash

echo "🔍 USV Token Project Diagnosis"
echo "=============================="

echo "📍 Current Directory:"
pwd

echo ""
echo "🔧 System Versions:"
echo "Rust: $(rustc --version)"
echo "Cargo: $(cargo --version)"
echo "Solana: $(solana --version)"
echo "Anchor: $(anchor --version)"

echo ""
echo "📋 File Check:"
echo "Anchor.toml version:"
grep "anchor_version" Anchor.toml
echo "Package.json anchor version:"
grep "@coral-xyz/anchor" package.json
echo "Program Cargo.toml dependencies:"
grep -A 5 "\[dependencies\]" programs/usv-token/Cargo.toml
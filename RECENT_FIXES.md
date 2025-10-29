# Recent Fixes

## Logo Display Improvements
- **Removed all padding** from token logos throughout the app
- Logos now fill containers completely with `w-full h-full object-cover`
- Applied to both homepage and wallet pages
- Added proper background containers (purple for USV, cyan-blue gradient for Solana)

## Light Mode Enhancements
- Changed background from bright white (#f9fafb) to softer gray (#e5e7eb)
- Updated text color for better contrast (#1f2937)
- Applied consistent gray-200 background across all pages

## Chart Visibility Fix
- Fixed chart line contrast in light mode
- Charts now display in black during light mode (white in dark mode)
- Uses `currentColor` with Tailwind classes for automatic theme switching

## Files Modified
- `client/src/pages/Home.tsx` - Logo containers and chart colors
- `client/src/pages/SimpleWallet.tsx` - Logo containers and backgrounds
- `client/src/index.css` - Global light mode colors

// Utility function to clear passcode unlock state for a user (used on logout)
export function clearPasscodeUnlock(userId?: string) {
  if (userId) {
    const userUnlockKey = `passcode_unlocked_${userId}`;
    sessionStorage.removeItem(userUnlockKey);
  }
  // Also clear old non-user-specific key if it exists
  sessionStorage.removeItem('passcode_unlocked');
}

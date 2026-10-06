/**
 * Browser Haptics Support
 * Light and Medium vibration patterns for mobile devices.
 */
export function triggerHaptic(intensity: 'light' | 'medium' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(intensity === 'light' ? [10] : [25]);
    } catch {
      // Ignore vibration errors
    }
  }
}

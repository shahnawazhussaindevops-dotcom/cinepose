# Mobile Camera Debugging Guide for CinePose

## Quick Test Steps

1. **Open Chrome DevTools on Mobile**
   - Connect your phone via USB
   - Open `chrome://inspect` on desktop Chrome
   - Click "Inspect" on your mobile browser tab
   - Check the Console tab for log messages starting with `[CineposeCamera]`

2. **Enable Debug Mode**
   - In mobile browser console, type: `localStorage.setItem('cinepose_camera_debug', 'true')`
   - Reload the page
   - You'll see detailed debug logs

3. **Check Camera Permissions**
   - Go to `chrome://settings/content/camera` on mobile
   - Make sure your site is allowed
   - OR tap the lock icon in address bar → Site settings → Camera → Allow

## Common Issues & Fixes

### Issue: "No Camera Detected"

**Possible Causes:**
- Browser doesn't have camera permission
- Camera is being used by another app
- Browser is in private/incognito mode (some browsers restrict camera)
- Site is not HTTPS (except localhost)

**Fixes:**
1. **Check permissions:**
   - Settings → Apps → Chrome → Permissions → Camera → ON
   - In browser: tap lock icon → Camera → Allow

2. **Close other apps:**
   - Instagram, Snapchat, or other camera apps
   - Close other browser tabs using camera

3. **Not in incognito:**
   - Open in normal browser window

4. **Reload the page:**
   - Hard reload: tap reload button in browser

5. **Restart browser:**
   - Close Chrome completely from recent apps
   - Reopen and try again

### Issue: Black Screen (Camera Opens But No Video)

**Possible Causes:**
- Video element not receiving stream
- Stream attached but video not playing
- CSS hiding the video element

**What We Fixed:**
- Added explicit `display: block` styles
- Multiple video play retry attempts
- Better stream attachment with mobile-specific attributes
- Improved timing of video.play() calls

### Issue: Permission Denied Even After Allowing

**Possible Causes:**
- Permission cached in denied state
- Browser bug requiring reload

**Fixes:**
1. Clear site data:
   - Settings → Site Settings → find your site → Clear & Reset
2. Reload page
3. Grant permission again

## Technical Details

### Changes Made to Fix Mobile Issues

1. **Simplified Constraints** (`streamManager.ts`):
   - First try: Just `facingMode` (most compatible)
   - Fallback to `video: true` (most permissive)
   - Skip complex resolution constraints on mobile

2. **Better Device Enumeration** (`cameraDevice.ts`):
   - Create synthetic device if enumeration fails but stream works
   - Skip enumeration on mobile when facingMode is specified

3. **Enhanced Video Playback** (`CameraManager.ts`):
   - Check video readiness before playing
   - Wait for `loadeddata` event
   - Multiple retry attempts with delays

4. **Mobile-Specific Attributes** (`streamManager.ts`):
   - `playsinline`, `webkit-playsinline`, `x5-playsinline`
   - `x5-video-player-type`, `x5-video-player-fullscreen`
   - These fix issues on Chinese browsers and some Android browsers

5. **Better Error Messages** (`CameraFeed.tsx`):
   - Contextual help based on error type
   - Step-by-step instructions
   - Quick fix suggestions

## Testing Checklist

- [ ] Test on Chrome Android
- [ ] Test on Samsung Internet
- [ ] Test on iOS Safari (if available)
- [ ] Test front camera (user-facing)
- [ ] Test back camera (environment-facing)
- [ ] Test camera switch functionality
- [ ] Test after denying then allowing permission
- [ ] Test after backgrounding app
- [ ] Check console for any errors

## Console Commands for Debugging

```javascript
// Enable debug logging
localStorage.setItem('cinepose_camera_debug', 'true')

// Check if getUserMedia is available
console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia)

// Check if HTTPS
console.log('Secure context:', window.isSecureContext)

// List available devices (requires permission first)
navigator.mediaDevices.enumerateDevices().then(devices => {
  console.log('Devices:', devices.filter(d => d.kind === 'videoinput'))
})

// Try to get camera directly
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Stream obtained:', stream.getVideoTracks()[0].getSettings())
    stream.getTracks().forEach(t => t.stop())
  })
  .catch(err => console.error('Camera error:', err))
```

## Expected Console Output (Success)

```
[CineposeCamera] CameraContext: startCamera called
[CineposeCamera] CameraContext: Requesting camera with facingMode: environment
[CineposeCamera] Checking camera permission state...
[CineposeCamera] Permission state: granted
[CineposeCamera] Creating camera stream...
[CineposeCamera] Mobile device: Skipping enumeration, trying direct stream access with facingMode
[CineposeCamera] Requesting camera access with constraints: {video: {facingMode: "environment"}, audio: false}
[CineposeCamera] Camera access granted {tracks: 1, label: "camera 0, facing back", settings: {...}}
[CineposeCamera] Camera stream created successfully {facingMode: "environment", resolution: {width: 1280, height: 720}}
[CineposeCamera] Video dimensions set from metadata {width: 1280, height: 720}
[CineposeCamera] Camera started successfully
```

## If Still Not Working

1. **Check your Chrome version:**
   - Should be Chrome 90+ for best compatibility
   - Update Chrome if needed

2. **Check Android version:**
   - Android 7.0+ recommended
   - Older versions may have camera API issues

3. **Try desktop browser first:**
   - Verify app works on desktop
   - This isolates mobile-specific issues

4. **Check Vercel logs:**
   - See if there are any server-side errors
   - Check if HTTPS is properly configured

5. **Test on different browser:**
   - Try Firefox for Android
   - Try Samsung Internet
   - This helps identify browser-specific issues

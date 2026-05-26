# Android Compatibility Notes

POP Approval is a web PWA and can be installed from modern Android browsers without an Android
`targetSdkVersion`. If Android shows "built for an older version of Android", that warning is coming
from an APK or Trusted Web Activity wrapper, not from the PWA manifest.

## Recommended PWA Install Path

1. Deploy the latest frontend over HTTPS.
2. Open the deployed URL in Chrome or Edge on Android.
3. Use browser menu > Install app or Add to Home screen.
4. If an older version was installed before, uninstall it first and clear the browser site data.

## If You Package This as APK/TWA

Use a current Android wrapper configuration:

- `compileSdk`: 35 or newer
- `targetSdk`: 35 or newer
- `minSdk`: 23 or newer
- Android Gradle Plugin: 8.x or newer
- JDK: 17 or newer

Google Play currently requires new Android app submissions and updates to target Android 15
(API level 35) or higher. Keep `targetSdk` current when Android releases move forward.

## Important

Do not sideload or share an old APK build. Rebuild the Android wrapper after every SDK target change.
The PWA itself should be installed from the browser unless a signed enterprise APK/TWA is required.

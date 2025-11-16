# Camera Setup Guide (Expo)

## ✅ Library Installed
`expo-image-picker` has been installed and integrated into the pickup-return confirmation screen.

## 📱 Platform Configuration (Expo)

### ✅ Permissions Already Configured!

The permissions have been automatically added to `app.json`:

**Android permissions:**
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- READ_MEDIA_IMAGES (for Android 13+)

**iOS permissions:**
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription
- NSPhotoLibraryAddUsageDescription

### No Manual Configuration Needed!
Expo handles all the native configuration automatically.

## 🔄 Rebuild Your App

Since this is an Expo project, you need to rebuild:

### Development Build:
```bash
npx expo start
```

### For Production/Testing on Device:
```bash
# Build for Android
npx expo run:android

# Build for iOS
npx expo run:ios
```

### Or use Expo Go (for development):
```bash
npx expo start
# Then scan QR code with Expo Go app
```

## 🎯 How It Works Now

1. **Staff taps on a payment** in the staff dashboard
2. **Opens pickup/return confirmation screen**
3. **Taps the upload button** for pickup or return photo
4. **Gets a choice:**
   - Take Photo (opens camera)
   - Choose from Gallery (opens photo library)
5. **Photo is captured/selected** and displayed
6. **Staff can submit** both photos to confirm pickup and return

## 📸 Features

- ✅ Camera access for taking photos
- ✅ Gallery access for selecting existing photos
- ✅ Image quality optimization (max 1920x1920, 80% quality)
- ✅ Support for JPEG, PNG, HEIC formats
- ✅ Preview before submission
- ✅ Change photo option
- ✅ Both pickup and return photo required before submission

## 🐛 Troubleshooting

### Camera not opening?
- Make sure you've added the permissions to AndroidManifest.xml or Info.plist
- Rebuild the app after adding permissions
- Check device settings to ensure camera permission is granted

### "Permission denied" error?
- Go to device Settings → Apps → Your App → Permissions
- Enable Camera and Storage permissions

### iOS build errors?
- Run `cd ios && pod install && cd ..`
- Clean build: `cd ios && xcodebuild clean && cd ..`
- Rebuild: `npm run ios`

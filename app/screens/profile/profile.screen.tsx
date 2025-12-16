import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../../lib/auth-context';
import Header from '../../components/Header/Header';
import { userService } from '../../../lib/api/services/user.service';
import ProfileHeader from './components/ProfileHeader';
import ProfileField from './components/ProfileField';
import DriverLicenseSection from './components/DriverLicenseSection';
import PasswordVerificationModal from './components/PasswordVerificationModal';
import EditFieldModal from './components/EditFieldModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import StaffLoadingState from '../staff/components/StaffLoadingState';
import { useProfileData } from './hooks/useProfileData';
import { useFieldEditor } from './hooks/useFieldEditor';
import { useProfileActions } from './hooks/useProfileActions';
import { useImagePicker } from './hooks/useImagePicker';
import {
  buildSafeUpdateData,
  getAvatarSource,
  getStatusColor,
} from './utils/profileHelpers';
import { locationService } from '../../../lib/api';
import { styles } from './profile.screen.styles';

export default function ProfileScreen() {
  const { user, refreshUser, logout } = useAuth();
  const {
    userData,
    setUserData,
    isLoading,
    licenseImage,
    setLicenseImage,
    fieldValues,
    setFieldValues,
  } = useProfileData(user?.id);
  const [licenseImages, setLicenseImages] = useState<string[]>([]);
  const [licenseStatus, setLicenseStatus] = useState<string | null>(null);
  const [licenseCreateDate, setLicenseCreateDate] = useState<string | null>(null);
  const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Avatar upload loading animation states
  const [showAvatarLoading, setShowAvatarLoading] = useState(false);
  const [avatarLoadingComplete, setAvatarLoadingComplete] = useState(false);

  const fieldEditor = useFieldEditor(
    user?.id,
    user?.email,
    userData,
    setUserData,
    fieldValues,
    setFieldValues,
    buildSafeUpdateData,
  );

  const profileActions = useProfileActions(
    user?.id,
    user?.email,
    userData,
    setUserData,
    setFieldValues,
    setLicenseImage,
    setLicenseImages,
    refreshUser,
    buildSafeUpdateData,
  );

  const imagePicker = useImagePicker();

  const fetchDriverLicense = async (forceRefresh = false) => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await userService.getDriverLicense(
        user.id,
        user.email,
      );
      if (error) {
        console.error('Failed to fetch driver license:', error);
        return;
      }

      console.log('fetchDriverLicense: received data', {
        hasData: !!data,
        urlCount: data?.urls?.length || 0,
        urls: data?.urls,
        forceRefresh
      });

      if (data && data.urls && data.urls.length > 0) {
        console.log('fetchDriverLicense: updating state with', data.urls.length, 'images');
        setLicenseImages(data.urls);
        setLicenseImage(data.urls[0]);
      } else {
        console.log('fetchDriverLicense: no URLs found, clearing state');
        setLicenseImages([]);
        setLicenseImage(null);
      }
    } catch (err) {
      console.error('Exception fetching driver license:', err);
    }
  };

  const fetchDriverLicenseStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await userService.getDriverLicenseStatus(user.id);
      if (error) {
        console.error('Failed to fetch driver license status:', error);
        return;
      }
      if (data) {
        setLicenseStatus(data.status);
        setLicenseCreateDate(data.createDate);
      }
    } catch (err) {
      console.error('Exception fetching driver license status:', err);
    }
  };

  React.useEffect(() => {
    fetchDriverLicense();
    fetchDriverLicenseStatus();
  }, [user?.id, user?.email]);

  // Handle avatar upload loading animation
  useEffect(() => {
    if (profileActions.isSaving && !showAvatarLoading) {
      // Avatar upload started, show loading animation
      setShowAvatarLoading(true);
      setAvatarLoadingComplete(false);
    } else if (!profileActions.isSaving && showAvatarLoading && !avatarLoadingComplete) {
      // Avatar upload finished, trigger completion animation
      setAvatarLoadingComplete(true);
    }
  }, [profileActions.isSaving, showAvatarLoading, avatarLoadingComplete]);

  const handleAvatarAnimationComplete = () => {
    // Hide loading animation completely after exit animation
    setShowAvatarLoading(false);
    setAvatarLoadingComplete(false);
  };

  const handleUploadAvatar = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () =>
          imagePicker.openCamera(profileActions.uploadAvatar),
      },
      {
        text: 'Choose from Gallery',
        onPress: () =>
          imagePicker.openGallery(profileActions.uploadAvatar),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleEditGender = () => {
    Alert.alert('Select Gender', 'Choose your gender', [
      { text: 'Male', onPress: () => profileActions.updateGender('Male') },
      { text: 'Female', onPress: () => profileActions.updateGender('Female') },
      { text: 'Other', onPress: () => profileActions.updateGender('Other') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUploadLicense = () => {
    Alert.alert("Upload Driver's License", 'Choose upload method', [
      {
        text: 'Upload Both Sides',
        onPress: () => handleUploadBothSides(),
      },
      {
        text: 'Upload Single Side',
        onPress: () => handleUploadSingleSide(),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUploadLicenseSide = (side: 'front' | 'back') => {
    Alert.alert(`Upload ${side === 'front' ? 'Front' : 'Back'} Side`, 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () =>
          imagePicker.openCamera(async (uri: string) => {
            await uploadLicenseImage(uri, side);
          }),
      },
      {
        text: 'Choose from Gallery',
        onPress: () =>
          imagePicker.openGallery(async (uri: string) => {
            await uploadLicenseImage(uri, side);
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUploadBothSides = () => {
    Alert.alert('Upload Both Sides', 'This will upload front and back images together', [
      {
        text: 'Take Photos',
        onPress: () => collectBothImages('camera'),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => collectBothImages('gallery'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUploadSingleSide = () => {
    Alert.alert("Upload Single Side", 'Choose which side to upload', [
      {
        text: 'Front Side',
        onPress: () => handleUploadLicenseSide('front'),
      },
      {
        text: 'Back Side',
        onPress: () => handleUploadLicenseSide('back'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const collectBothImages = async (method: 'camera' | 'gallery') => {
    try {
      const images: string[] = [];

      // Collect front image
      const frontUri = await new Promise<string>((resolve, reject) => {
        Alert.alert('Front Side', 'Take/select the front side of your license', [
          {
            text: method === 'camera' ? 'Take Photo' : 'Select Image',
            onPress: () => {
              const picker = method === 'camera' ? imagePicker.openCamera : imagePicker.openGallery;
              picker((uri: string) => resolve(uri));
            },
          },
          { text: 'Cancel', onPress: () => reject(new Error('Cancelled')), style: 'cancel' },
        ]);
      });

      images.push(frontUri);

      // Collect back image
      const backUri = await new Promise<string>((resolve, reject) => {
        Alert.alert('Back Side', 'Take/select the back side of your license', [
          {
            text: method === 'camera' ? 'Take Photo' : 'Select Image',
            onPress: () => {
              const picker = method === 'camera' ? imagePicker.openCamera : imagePicker.openGallery;
              picker((uri: string) => resolve(uri));
            },
          },
          { text: 'Cancel', onPress: () => reject(new Error('Cancelled')), style: 'cancel' },
        ]);
      });

      images.push(backUri);

      // Upload both images
      await uploadMultipleLicenseImages(images);

    } catch (error) {
      if (error instanceof Error && error.message !== 'Cancelled') {
        console.error('Error collecting images:', error);
        Alert.alert('Error', 'Failed to collect images. Please try again.');
      }
    }
  };

  const uploadMultipleLicenseImages = async (imageUris: string[]) => {
    try {
      console.log('uploadMultipleLicenseImages: starting upload with', imageUris.length, 'images');

      // Store original images for potential rollback
      const originalImages = [...licenseImages];
      const originalImage = licenseImage;

      // Update local state immediately for better UX
      setLicenseImages(imageUris);
      if (imageUris.length > 0) {
        setLicenseImage(imageUris[0]);
      }

      // Upload multiple images to server
      const { data, error } = await userService.uploadDriverLicenseMultiple(user?.id || '', imageUris);

      if (error) {
        throw error;
      }

      console.log('uploadMultipleLicenseImages: upload successful, response:', data);

      // Update license status immediately since we know it changed
      await fetchDriverLicenseStatus();

      Alert.alert('Success', `${imageUris.length} images uploaded successfully`);

      // Don't immediately fetch from server to avoid overriding our new images
      // Instead, do a background check after a longer delay
      setTimeout(async () => {
        console.log('uploadMultipleLicenseImages: background refresh check');
        try {
          const { data: licenseData } = await userService.getDriverLicense(user?.id || '', user?.email || '');

          // Only update if server returned more recent data
          if (licenseData?.urls && licenseData.urls.length >= imageUris.length) {
            console.log('uploadMultipleLicenseImages: server has updated data, refreshing UI');
            setLicenseImages(licenseData.urls);
            setLicenseImage(licenseData.urls[0]);
          } else {
            console.log('uploadMultipleLicenseImages: keeping local images, server not ready yet');
          }
        } catch (err) {
          console.log('uploadMultipleLicenseImages: background refresh failed, keeping local images');
        }
      }, 5000); // Wait 5 seconds before background check

    } catch (error) {
      console.error('Error uploading multiple license images:', error);
      Alert.alert('Error', 'Failed to upload images. Please try again.');
      // Revert local state on error
      await fetchDriverLicense();
    }
  };

  const uploadLicenseImage = async (uri: string, side: 'front' | 'back') => {
    try {
      // Create a copy of current images
      const currentImages = [...licenseImages];

      // Update the appropriate side (front = index 0, back = index 1)
      if (side === 'front') {
        currentImages[0] = uri;
      } else {
        currentImages[1] = uri;
      }

      // Ensure we have at least 2 slots
      while (currentImages.length < 2) {
        currentImages.push('');
      }

      // Update local state immediately for better UX
      setLicenseImages(currentImages);
      if (side === 'front') {
        setLicenseImage(uri);
      }

      // Upload to server
      await profileActions.uploadDriverLicense(uri);

      // Update license status immediately
      await fetchDriverLicenseStatus();

      Alert.alert('Success', `${side === 'front' ? 'Front' : 'Back'} side uploaded successfully`);

      // Background refresh after delay, but don't override local images
      setTimeout(async () => {
        try {
          const { data: licenseData } = await userService.getDriverLicense(user?.id || '', user?.email || '');
          if (licenseData?.urls && licenseData.urls.length > 0) {
            setLicenseImages(licenseData.urls);
            setLicenseImage(licenseData.urls[0]);
          }
        } catch (err) {
          console.log('Background refresh failed, keeping local images');
        }
      }, 3000);

    } catch (error) {
      console.error('Error uploading license image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      // Revert local state on error
      await fetchDriverLicense();
    }
  };

  const handleAutoFillAddress = async () => {
    setIsAutoFillingAddress(true);
    try {
      const { data: location, error: locationError } =
        await locationService.getCurrentLocation();

      if (locationError || !location) {
        Alert.alert(
          'Location Error',
          locationError?.message ||
          'Unable to get your current location. Please enable location services in your device settings.',
          [{ text: 'OK' }],
        );
        return;
      }

      const { data: addressData, error: addressError } =
        await locationService.reverseGeocode(
          location.latitude,
          location.longitude,
        );

      if (addressError) {
        Alert.alert('Error', `Unable to get address: ${addressError.message}`);
        return;
      }

      if (!addressData) {
        Alert.alert(
          'Error',
          'No address data received from the API. Please try again.',
        );
        return;
      }

      console.log('Profile: Received address data', addressData);

      let fullAddress = addressData.address;

      if (!fullAddress && addressData.city && addressData.country) {
        fullAddress = `${addressData.city}, ${addressData.country}`;
      }

      if (!fullAddress && addressData.city) {
        fullAddress = addressData.city;
      }

      if (!fullAddress && addressData.country) {
        fullAddress = addressData.country;
      }

      if (!fullAddress) {
        fullAddress = `Lat: ${location.latitude.toFixed(
          6,
        )}, Lng: ${location.longitude.toFixed(6)}`;
        Alert.alert(
          'Location Saved',
          'Could not determine address, but coordinates have been saved. You can edit this manually.',
          [{ text: 'OK' }],
        );
      }

      setFieldValues(prev => ({ ...prev, address: fullAddress }));

      if (user?.id) {
        const { data: currentUserData } = await userService.getUserById(user.id);
        const latestData = currentUserData || userData;
        const updateData = buildSafeUpdateData(latestData, {
          address: fullAddress,
        });

        const { error: updateError } = await userService.updateUserInfo(
          user.id,
          updateData,
        );

        if (updateError) {
          Alert.alert(
            'Update Failed',
            'Address detected but failed to save. Please try manually.',
          );
        } else {
          Alert.alert('Success', `Address updated to: ${fullAddress}`);
        }
      }
    } catch (err: any) {
      console.error('Auto-fill address error:', err);
      Alert.alert('Error', err?.message || 'Failed to auto-fill address');
    } finally {
      setIsAutoFillingAddress(false);
    }
  };

  const avatarSource = getAvatarSource(userData, user?.avatar);

  const renderLoadingState = () => (
    <View style={styles.container}>
      <Header />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.morentBlue} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return renderLoadingState();
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Avatar Upload Loading Overlay */}
      {showAvatarLoading && (
        <View style={styles.loadingOverlay}>
          <StaffLoadingState
            progress="Uploading avatar..."
            isComplete={avatarLoadingComplete}
            onAnimationComplete={handleAvatarAnimationComplete}
          />
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          avatarSource={avatarSource}
          fullname={fieldValues.fullname}
          username={fieldValues.username}
          gender={fieldValues.gender}
          status={userData?.status || 'Active'}
          onEditAvatar={handleUploadAvatar}
          onEditGender={handleEditGender}
        />

        <View style={styles.accountDetailsCard}>
          <ProfileField
            label="Phone Number"
            value={fieldValues.phone}
            placeholder="Add Phone Number"
            onEdit={() => fieldEditor.handleEditField('phone')}
            showStatusDot
            statusColor={getStatusColor('phone', fieldValues, colors)}
            isSecure
          />

          <ProfileField
            label="Email"
            value={fieldValues.email}
            showStatusDot
            statusColor={colors.green}
            hideEditButton
          />

          <ProfileField
            label="Address"
            value={fieldValues.address}
            placeholder="Tap location icon to auto-fill"
            onAutoFill={handleAutoFillAddress}
            autoFillIcon="my-location"
            isAutoFilling={isAutoFillingAddress}
            multiline
            hideEditButton
          />

          <ProfileField
            label="Username"
            value={fieldValues.username}
            placeholder="Not set"
            onEdit={() => fieldEditor.handleEditField('username')}
          />

          <ProfileField
            label="Password"
            value="••••••••"
            onEdit={() => setShowChangePasswordModal(true)}
          />
        </View>

        <DriverLicenseSection
          licenseImage={licenseImage}
          licenseImages={licenseImages}
          licenseStatus={licenseStatus}
          licenseCreateDate={licenseCreateDate}
          onUploadLicense={handleUploadLicense}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <PasswordVerificationModal
        visible={fieldEditor.showPasswordModal}
        password={fieldEditor.password}
        isPasswordSecure={fieldEditor.isPasswordSecure}
        isSaving={fieldEditor.isSaving}
        pendingField={fieldEditor.pendingField}
        onPasswordChange={fieldEditor.setPassword}
        onToggleSecure={() =>
          fieldEditor.setIsPasswordSecure(!fieldEditor.isPasswordSecure)
        }
        onVerify={fieldEditor.handlePasswordVerification}
        onCancel={() => {
          fieldEditor.setShowPasswordModal(false);
          fieldEditor.setPassword('');
          fieldEditor.setPendingField(null);
        }}
      />

      <EditFieldModal
        visible={fieldEditor.editingField !== null}
        editingField={fieldEditor.editingField}
        editValue={fieldEditor.editValue}
        isSaving={fieldEditor.isSaving || profileActions.isSaving}
        onValueChange={fieldEditor.setEditValue}
        onSave={fieldEditor.handleSaveField}
        onCancel={() => {
          fieldEditor.setEditingField(null);
          fieldEditor.setEditValue('');
        }}
      />

      <ChangePasswordModal
        visible={showChangePasswordModal}
        userEmail={user?.email || ''}
        onClose={() => setShowChangePasswordModal(false)}
        onLogout={logout}
      />
    </View>
  );
}

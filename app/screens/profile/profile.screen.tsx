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
import { ocrService, DriverLicenseOCRResult } from '../../../lib/api/services/ocr.service';
import OCRResultModal from './components/OCRResultModal';
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
  const [licenseStatus, setLicenseStatus] = useState<string | null>(null);
  const [licenseCreateDate, setLicenseCreateDate] = useState<string | null>(null);
  const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // OCR states
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState<DriverLicenseOCRResult | null>(null);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

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

      if (data && data.urls && data.urls.length > 0) {
        // Use the first (most recent) image for simplified single photo upload
        setLicenseImage(data.urls[0]);
      } else {
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
        text: 'Smart Upload (OCR)',
        onPress: () => handleSmartUpload(),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSmartUpload = () => {
    Alert.alert('Smart Upload with OCR', 'This will extract information from your license automatically', [
      {
        text: 'Take Photo',
        onPress: () => imagePicker.openCamera(handleOCRUpload),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => imagePicker.openGallery(handleOCRUpload),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };



  const handleOCRUpload = async (uri: string) => {
    try {
      setPendingImageUri(uri);
      setShowOCRModal(true);
      setIsProcessingOCR(true);
      setOcrResult(null);

      console.log('🔍 Starting OCR processing for:', uri);

      const { data, error } = await ocrService.extractDriverLicenseInfo(uri);

      if (error) {
        console.error('❌ OCR failed:', error);
        setShowOCRModal(false);
        Alert.alert(
          'OCR Failed',
          `Failed to extract license information: ${error.message}. Please try again with a clearer photo.`,
          [
            { text: 'OK', style: 'cancel' },
          ]
        );
        return;
      }

      if (data) {
        console.log('✅ OCR successful:', data);
        setOcrResult(data);

        // Validate OCR quality
        const validation = ocrService.validateOCRQuality(data);
        console.log('📊 OCR validation:', validation);
      }

    } catch (error: any) {
      console.error('💥 OCR exception:', error);
      setShowOCRModal(false);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleAcceptOCR = async () => {
    if (!pendingImageUri || !ocrResult) return;

    try {
      setShowOCRModal(false);

      // Upload the image first
      await uploadSingleLicenseImage(pendingImageUri);

      // Show extracted information to user
      const formatted = ocrService.formatOCRResult(ocrResult);
      Alert.alert(
        'License Information Extracted',
        `License ID: ${formatted.licenseId}\nName: ${formatted.fullName}\nClass: ${formatted.licenseClass}\nDOB: ${formatted.dateOfBirth}`,
        [{ text: 'OK' }]
      );

      // Clear OCR state
      setPendingImageUri(null);
      setOcrResult(null);

    } catch (error) {
      console.error('Error accepting OCR result:', error);
      Alert.alert('Error', 'Failed to process the license. Please try again.');
    }
  };

  const handleRetryOCR = () => {
    setShowOCRModal(false);
    setPendingImageUri(null);
    setOcrResult(null);

    // Restart the smart upload process
    setTimeout(() => {
      handleSmartUpload();
    }, 100);
  };

  const handleCloseOCR = () => {
    setShowOCRModal(false);
    setPendingImageUri(null);
    setOcrResult(null);
    setIsProcessingOCR(false);
  };

  const uploadSingleLicenseImage = async (uri: string) => {
    try {
      // Update local state immediately for better UX
      setLicenseImage(uri);

      // Upload to server
      await profileActions.uploadDriverLicense(uri);

      // Update license status
      await fetchDriverLicenseStatus();

      Alert.alert('Success', 'License photo uploaded successfully');

      // Refresh license data after upload
      setTimeout(() => {
        fetchDriverLicense();
      }, 2000);

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

      <OCRResultModal
        visible={showOCRModal}
        isProcessing={isProcessingOCR}
        ocrResult={ocrResult}
        onClose={handleCloseOCR}
        onAccept={handleAcceptOCR}
        onRetry={handleRetryOCR}
      />
    </View>
  );
}

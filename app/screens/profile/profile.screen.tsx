import React, { useState } from 'react';
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
  const { user, refreshUser } = useAuth();
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
  const [isAutoFillingAddress, setIsAutoFillingAddress] = useState(false);

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

  const fetchDriverLicense = async () => {
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
        setLicenseImages(data.urls);
        setLicenseImage(data.urls[0]);
      }
    } catch (err) {
      console.error('Exception fetching driver license:', err);
    }
  };

  React.useEffect(() => {
    fetchDriverLicense();
  }, [user?.id, user?.email]);

  const handleUploadAvatar = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () =>
          imagePicker.openCamera(profileActions.uploadAvatar, [1, 1]),
      },
      {
        text: 'Choose from Gallery',
        onPress: () =>
          imagePicker.openGallery(profileActions.uploadAvatar, [1, 1]),
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
    Alert.alert("Upload Driver's License", 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () =>
          imagePicker.openCamera(profileActions.uploadDriverLicense, [16, 9]),
      },
      {
        text: 'Choose from Gallery',
        onPress: () =>
          imagePicker.openGallery(profileActions.uploadDriverLicense, [16, 9]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
            onEdit={() => fieldEditor.handleEditField('email')}
            showStatusDot
            statusColor={colors.green}
            isSecure
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
        </View>

        <DriverLicenseSection
          licenseImage={licenseImage}
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
    </View>
  );
}

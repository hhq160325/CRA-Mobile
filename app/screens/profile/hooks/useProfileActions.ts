import {useState} from 'react';
import {Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {userService} from '../../../../lib/api/services/user.service';

export const useProfileActions = (
  userId: string | undefined,
  userEmail: string | undefined,
  userData: any,
  setUserData: (data: any) => void,
  setFieldValues: (fn: (prev: any) => any) => void,
  setLicenseImage: (uri: string) => void,
  setLicenseImages: (urls: string[]) => void,
  refreshUser: () => void,
  buildSafeUpdateData: (latestData: any, overrides?: any) => any,
) => {
  const [isSaving, setIsSaving] = useState(false);

  const updateGender = async (gender: string) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const {data: currentUserData, error: fetchError} =
        await userService.getUserById(userId);

      if (fetchError || !currentUserData) {
        console.warn('Could not fetch current user data, using cached data');
      }

      const latestData = currentUserData || userData;
      const genderValue = gender === 'Male' ? 0 : gender === 'Female' ? 1 : 2;

      const updateData = buildSafeUpdateData(latestData, {gender: genderValue});

      const {data, error} = await userService.updateUserInfo(
        userId,
        updateData,
      );

      if (error) {
        Alert.alert(
          'Update Failed',
          error.message || 'Failed to update gender',
        );
        return;
      }

      setFieldValues(prev => ({...prev, gender}));
      if (data) setUserData(data);
      Alert.alert('Success', 'Gender updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update gender');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadDriverLicense = async (uri: string) => {
    if (!userId || !userEmail) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setIsSaving(true);
    try {
      const {data, error} = await userService.uploadDriverLicense(userId, uri);

      if (error) {
        Alert.alert(
          'Upload Failed',
          error.message || "Failed to upload driver's license",
        );
        return;
      }

      const {data: licenseData, error: licenseError} =
        await userService.getDriverLicense(userId, userEmail);
      if (
        !licenseError &&
        licenseData &&
        licenseData.urls &&
        licenseData.urls.length > 0
      ) {
        setLicenseImages(licenseData.urls);
        setLicenseImage(licenseData.urls[0]);
      } else {
        setLicenseImage(uri);
      }

      Alert.alert('Success', "Driver's license uploaded successfully!");
    } catch (err: any) {
      Alert.alert('Error', err?.message || "Failed to upload driver's license");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!userId) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setIsSaving(true);
    try {
      const {data, error} = await userService.uploadAvatar(userId, uri);

      if (error) {
        Alert.alert(
          'Upload Failed',
          error.message || 'Failed to update profile picture',
        );
        return;
      }

      if (data && data.imageAvatar) {
        console.log('Avatar uploaded successfully, URL:', data.imageAvatar);
        setUserData(data);

        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const currentUser = JSON.parse(userStr);

            currentUser.avatar = data.imageAvatar;
            currentUser.imageAvatar = data.imageAvatar;
            localStorage.setItem('user', JSON.stringify(currentUser));
            console.log(
              'Updated user in localStorage with new avatar:',
              data.imageAvatar,
            );
          }
        } catch (err) {
          console.error('Failed to update localStorage:', err);
        }

        setTimeout(() => {
          refreshUser();
        }, 100);
      }

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to upload avatar');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    updateGender,
    uploadDriverLicense,
    uploadAvatar,
  };
};

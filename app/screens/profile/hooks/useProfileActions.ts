import { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../../../../lib/api/services/user.service';

export const useProfileActions = (
  userId: string | undefined,
  userEmail: string | undefined,
  userData: any,
  setUserData: (data: any) => void,
  setFieldValues: (fn: (prev: any) => any) => void,
  setLicenseImage: (uri: string) => void,
  refreshUser: () => void,
  buildSafeUpdateData: (latestData: any, overrides?: any) => any,
) => {
  const [isSaving, setIsSaving] = useState(false);

  const updateGender = async (gender: string) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { data: currentUserData, error: fetchError } =
        await userService.getUserById(userId);

      if (fetchError || !currentUserData) {
        console.warn('Could not fetch current user data, using cached data');
      }

      const latestData = currentUserData || userData;
      const genderValue = gender === 'Male' ? 0 : gender === 'Female' ? 1 : 2;

      const updateData = buildSafeUpdateData(latestData, { gender: genderValue });

      const { data, error } = await userService.updateUserInfo(
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

      setFieldValues(prev => ({ ...prev, gender }));
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
      console.log('uploadDriverLicense: starting upload for user', userId);
      console.log('uploadDriverLicense: image URI', uri);

      const { data, error } = await userService.uploadDriverLicense(userId, uri);

      if (error) {
        console.error('uploadDriverLicense: upload failed', error);
        Alert.alert(
          'Upload Failed',
          error.message || "Failed to upload driver's license",
        );
        return;
      }

      if (data && data.urls && data.urls.length > 0) {
        console.log('Driver license uploaded successfully:', {
          urlCount: data.urls.length,
          status: data.status,
          createDate: data.createDate
        });


        setLicenseImage(data.urls[0]);


        const statusMessage = data.status === 'Pending'
          ? "Driver's license uploaded successfully! It's currently pending review."
          : "Driver's license uploaded successfully!";

        Alert.alert('Success', statusMessage);
      } else {
        console.warn('Driver license upload succeeded but response missing URLs');


        try {
          const { data: licenseData, error: licenseError } =
            await userService.getDriverLicense(userId, userEmail);
          if (
            !licenseError &&
            licenseData &&
            licenseData.urls &&
            licenseData.urls.length > 0
          ) {
            setLicenseImage(licenseData.urls[0]);
          } else {
            setLicenseImage(uri);
          }
        } catch (refreshError) {
          console.warn('Failed to refresh license images:', refreshError);
          setLicenseImage(uri);
        }

        Alert.alert('Success', "Driver's license uploaded successfully!");
      }
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
      console.log('uploadAvatar: starting upload for user', userId);
      console.log('uploadAvatar: image URI', uri);

      const { data, error } = await userService.uploadAvatar(userId, uri);

      if (error) {
        console.error('uploadAvatar: upload failed', error);
        Alert.alert(
          'Upload Failed',
          error.message || 'Failed to update profile picture',
        );
        return;
      }

      if (data && data.imageAvatar) {
        console.log('Avatar uploaded successfully, URL:', data.imageAvatar);


        setUserData(data);


        setFieldValues(prev => ({
          ...prev,
          imageAvatar: data.imageAvatar,
        }));


        try {
          const currentUserStr = await AsyncStorage.getItem('user');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            const updatedUser = {
              ...currentUser,
              imageAvatar: data.imageAvatar,
              avatar: data.imageAvatar,
            };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('AsyncStorage updated with new avatar for header sync');
          }
        } catch (storageError) {
          console.warn('Failed to update AsyncStorage with new avatar:', storageError);
        }


        setTimeout(() => {
          console.log('Syncing header avatar with new upload');
          refreshUser();
        }, 100);

        console.log('Avatar UI updated successfully, staying on profile screen');
      } else {
        console.warn('Avatar upload succeeded but response missing imageAvatar');
      }
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

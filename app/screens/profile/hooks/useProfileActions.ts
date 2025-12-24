import { useState } from 'react';
import { Alert, Platform } from 'react-native';
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
  fetchDriverLicense?: () => Promise<void>, // Add fetchDriverLicense function
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

        // Handle specific error cases
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          Alert.alert(
            'Rate Limit Exceeded',
            'The OCR service has reached its rate limit. Please wait a few minutes before trying again.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Retry in 30s',
                onPress: () => {
                  setTimeout(() => {
                    console.log('🔄 Retrying driver license upload after rate limit');
                    uploadDriverLicense(uri);
                  }, 30000); // Wait 30 seconds before retry
                }
              }
            ]
          );
        } else if (error.message.includes('already exists')) {
          Alert.alert(
            'License Already Exists',
            'A driver license for this user already exists. Please contact support if you need to update it.',
          );
        } else {
          Alert.alert(
            'Upload Failed',
            error.message || "Failed to upload driver's license",
          );
        }
        return;
      }

      if (data && data.urls && data.urls.length > 0) {
        console.log('✅ Driver license uploaded successfully:', {
          urlCount: data.urls.length,
          licenseNumber: data.licenseNumber,
          licenseName: data.licenseName,
          licenseClass: data.licenseClass,
          status: data.status,
          createDate: data.createDate
        });

        setLicenseImage(data.urls[0]);

        // Show extracted license information to user in a clean format
        const extractedInfo = [
          data.licenseName && `Name: ${data.licenseName}`,
          data.licenseNumber && `License #: ${data.licenseNumber}`,
          data.licenseClass && `Class: ${data.licenseClass}`
        ].filter(Boolean).join('\n');

        const statusMessage = data.status === 'AutoApproved'
          ? `✅ Driver's license uploaded and approved!\n\n${extractedInfo}`
          : data.status === 'Pending'
            ? `✅ Driver's license uploaded successfully!\nStatus: Pending Review\n\n${extractedInfo}`
            : `✅ Driver's license uploaded successfully!\n\n${extractedInfo}`;

        Alert.alert('Upload Complete', statusMessage);

        // Refresh driver license data specifically instead of just user data
        console.log('🔄 Refreshing driver license data after upload');
        const retryRefresh = async (attempt = 1, maxAttempts = 3) => {
          try {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Progressive delay

            // First refresh the main user data
            refreshUser();

            // Then refresh the driver license data specifically
            if (fetchDriverLicense) {
              await fetchDriverLicense();
              console.log(`✅ Driver license refresh attempt ${attempt} completed`);
            } else {
              console.log(`✅ User refresh attempt ${attempt} completed (no fetchDriverLicense available)`);
            }
          } catch (error) {
            console.log(`❌ Refresh attempt ${attempt} failed:`, error);
            if (attempt < maxAttempts) {
              console.log(`🔄 Retrying refresh (attempt ${attempt + 1}/${maxAttempts})`);
              retryRefresh(attempt + 1, maxAttempts);
            }
          }
        };
        retryRefresh();

        return data;
      }

      // Fallback case: upload succeeded but response missing URLs
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

      // Refresh driver license data even in fallback case
      console.log('🔄 Refreshing driver license data after upload (fallback)');
      setTimeout(async () => {
        refreshUser();
        if (fetchDriverLicense) {
          await fetchDriverLicense();
          console.log('✅ Driver license refresh completed (fallback)');
        }
      }, 2000);

      // Show single success message for fallback case
      Alert.alert('Success', "Driver's license uploaded successfully!");
      return;
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

    console.log('uploadAvatar: starting validation and upload');
    console.log('uploadAvatar: platform', Platform.OS);
    console.log('uploadAvatar: image URI', uri);

    // Enhanced format validation for real devices
    const fileExtension = uri.split('.').pop()?.toLowerCase();
    const supportedFormats = ['jpg', 'jpeg', 'png'];

    console.log('uploadAvatar: detected file extension', fileExtension);

    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      console.error('uploadAvatar: unsupported format', fileExtension);
      Alert.alert(
        'Unsupported Format',
        `Image format validation failed (${fileExtension}). Please try selecting a different image or take a new photo.`,
        [
          { text: 'OK' },
          { text: 'Try Again', onPress: () => console.log('User wants to try again') }
        ]
      );
      return;
    }

    // Check if file URI is accessible (important for real devices)
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`File not accessible: ${response.status}`);
      }
      console.log('uploadAvatar: file accessibility verified');
    } catch (fileError) {
      console.error('uploadAvatar: file not accessible', fileError);
      Alert.alert(
        'File Access Error',
        'The selected image file is not accessible. Please try selecting a different image.',
      );
      return;
    }

    setIsSaving(true);
    try {
      console.log('uploadAvatar: starting upload for user', userId);
      console.log('uploadAvatar: image format', fileExtension);

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

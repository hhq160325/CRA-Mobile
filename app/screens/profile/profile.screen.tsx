import React, { useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import { useAuth } from '../../../lib/auth-context';
import getAsset from '@/lib/getAsset';
import Header from '../../components/Header/Header';
import { userService } from '../../../lib/api/services/user.service';

// Components
import ProfileHeader from './components/ProfileHeader';
import ProfileField from './components/ProfileField';
import DriverLicenseSection from './components/DriverLicenseSection';
import PasswordVerificationModal from './components/PasswordVerificationModal';
import EditFieldModal from './components/EditFieldModal';

// Hooks & Utils
import { useProfileData } from './hooks/useProfileData';
import { validateLicenseNumber, validateLicenseExpiry } from './utils/validation';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { userData, setUserData, isLoading, licenseImage, setLicenseImage, fieldValues, setFieldValues } = useProfileData(user?.id);

  // Edit state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password verification state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [pendingField, setPendingField] = useState<string | null>(null);

  const getStatusColor = (field: string) => {
    const emptyFields = ["phone", "licenseNumber"];
    return emptyFields.includes(field) || !fieldValues[field as keyof typeof fieldValues] ? colors.red : colors.green;
  };

  // Format date with mask (DD/MM/YYYY)
  const formatDateWithMask = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Build the masked string
    let result = '';
    const mask = '__/__/____';
    let cleanedIndex = 0;

    for (let i = 0; i < mask.length && cleanedIndex < cleaned.length; i++) {
      if (mask[i] === '_') {
        result += cleaned[cleanedIndex];
        cleanedIndex++;
      } else {
        result += mask[i];
      }
    }

    // If we haven't filled all positions, add remaining mask characters
    if (result.length < mask.length) {
      result += mask.slice(result.length);
    }

    return result;
  };

  // Handle edit value change with date formatting and license number limit
  const handleEditValueChange = (text: string) => {
    if (editingField === 'licenseExpiry') {
      // Extract only the digits from input
      const digits = text.replace(/\D/g, '');

      // Always allow deletion, limit to 8 digits when adding
      const limitedDigits = digits.slice(0, 8);
      const formatted = formatDateWithMask(limitedDigits);
      setEditValue(formatted);
    } else if (editingField === 'licenseNumber') {
      // Only allow digits for license number
      const digits = text.replace(/\D/g, '');

      // Always allow deletion, limit to 12 digits when adding
      const limitedDigits = digits.slice(0, 12);
      setEditValue(limitedDigits);
    } else {
      setEditValue(text);
    }
  };

  const handleEditField = (field: string) => {
    const sensitiveFields = ["email", "phone"];

    if (sensitiveFields.includes(field)) {
      setPendingField(field);
      setShowPasswordModal(true);
    } else {
      const currentValue = fieldValues[field as keyof typeof fieldValues] || "";

      // For date fields, always show with mask format
      if (field === 'licenseExpiry') {
        if (!currentValue) {
          setEditValue('__/__/____');
        } else {
          // If there's a value, format it with the mask
          const digits = currentValue.replace(/\D/g, '');
          setEditValue(formatDateWithMask(digits));
        }
      } else {
        setEditValue(currentValue);
      }

      setEditingField(field);
    }
  };

  const handlePasswordVerification = async () => {
    if (!password) {
      Alert.alert("Password Required", "Please enter your password to continue.");
      return;
    }

    if (!user?.email) {
      Alert.alert("Error", "User email not found.");
      return;
    }

    setIsSaving(true);

    try {
      const { authService } = require("../../../lib/api");
      const { data, error } = await authService.login({
        email: user.email,
        password: password,
      });

      if (error || !data) {
        Alert.alert("Incorrect Password", "The password you entered is incorrect.");
        setPassword("");
        return;
      }

      setShowPasswordModal(false);
      setPassword("");

      if (pendingField) {
        setEditValue(fieldValues[pendingField as keyof typeof fieldValues] || "");
        setEditingField(pendingField);
        setPendingField(null);
      }
    } catch (err: any) {
      Alert.alert("Verification Failed", err?.message || "Failed to verify password.");
      setPassword("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    const value = editValue;

    // Validation
    if (editingField === "licenseNumber") {
      if (!validateLicenseNumber(value)) {
        Alert.alert("Invalid License Number", "License number must be exactly 12 digits.");
        return;
      }
    }



    if (editingField === "licenseExpiry") {
      const validation = validateLicenseExpiry(value);
      if (!validation.valid) {
        Alert.alert("Invalid Date", validation.error || "Invalid expiry date");
        return;
      }
    }

    if (!user?.id) {
      Alert.alert("Error", "User not found. Please login again.");
      return;
    }

    setIsSaving(true);

    try {
      const fieldMapping: Record<string, string> = {
        phone: "phoneNumber",
        email: "email",
        licenseNumber: "licenseNumber",
        licenseExpiry: "licenseExpiry",
        gender: "gender",
        address: "address",
        username: "username",
        fullname: "fullname",
      };

      const apiFieldName = fieldMapping[editingField] || editingField;

      // Convert date format from DD/MM/YYYY to YYYY-MM-DD for API
      let apiValue = value;
      if (editingField === 'licenseExpiry') {
        const [day, month, year] = value.split('/');
        apiValue = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Build update data with ALL current fields + the changed field
      const updateData: any = {
        // Keep all existing fields
        username: userData?.username || fieldValues.username || "",
        fullname: userData?.fullname || fieldValues.fullname || "",
        email: userData?.email || fieldValues.email || "",
        phoneNumber: userData?.phoneNumber || fieldValues.phone || "",
        address: userData?.address || fieldValues.address || "",
        gender: userData?.gender !== undefined ? userData.gender : (fieldValues.gender === "Male" ? 0 : fieldValues.gender === "Female" ? 1 : 2),
        licenseNumber: userData?.licenseNumber || fieldValues.licenseNumber || "",
        licenseExpiry: userData?.licenseExpiry || fieldValues.licenseExpiry || "",

        // Override with the new value
        [apiFieldName]: apiValue,
      };

      console.log("Updating user with data:", updateData);

      const { data, error } = await userService.updateUserInfo(user.id, updateData);

      if (error) {
        console.error("Failed to update user info:", error);
        Alert.alert("Update Failed", error.message || "Failed to save changes. Please try again.");
        return;
      }

      setFieldValues((prev) => ({ ...prev, [editingField]: value }));

      if (data) {
        setUserData(data);
      }

      setEditingField(null);
      setEditValue("");

      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAvatar = async () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => openAvatarCamera() },
        { text: "Choose from Gallery", onPress: () => openAvatarGallery() },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleEditGender = () => {
    Alert.alert(
      "Select Gender",
      "Choose your gender",
      [
        { text: "Male", onPress: () => updateGender("Male") },
        { text: "Female", onPress: () => updateGender("Female") },
        { text: "Other", onPress: () => updateGender("Other") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const updateGender = async (gender: string) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const genderValue = gender === "Male" ? 0 : gender === "Female" ? 1 : 2;

      // Build update data with ALL current fields + the changed gender
      const updateData = {
        username: userData?.username || fieldValues.username || "",
        fullname: userData?.fullname || fieldValues.fullname || "",
        email: userData?.email || fieldValues.email || "",
        phoneNumber: userData?.phoneNumber || fieldValues.phone || "",
        address: userData?.address || fieldValues.address || "",
        licenseNumber: userData?.licenseNumber || fieldValues.licenseNumber || "",
        licenseExpiry: userData?.licenseExpiry || fieldValues.licenseExpiry || "",
        gender: genderValue,
      };

      const { data, error } = await userService.updateUserInfo(user.id, updateData);

      if (error) {
        Alert.alert("Update Failed", error.message || "Failed to update gender");
        return;
      }

      setFieldValues((prev) => ({ ...prev, gender }));
      if (data) setUserData(data);
      Alert.alert("Success", "Gender updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update gender");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadLicense = async () => {
    Alert.alert(
      "Upload Driver's License",
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => openCamera() },
        { text: "Choose from Gallery", onPress: () => openGallery() },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera permission is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri);
        Alert.alert("Success", "Driver's license photo uploaded!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Photo library permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri);
        Alert.alert("Success", "Driver's license photo uploaded!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const openAvatarCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera permission is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const openAvatarGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Photo library permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Step 1: Upload image to Supabase storage
      const { storageService } = require("../../../lib/api");
      const { url, error: uploadError } = await storageService.uploadAvatar(user.id, uri);

      if (uploadError || !url) {
        Alert.alert("Upload Failed", uploadError?.message || "Failed to upload image to storage");
        return;
      }

      console.log("Image uploaded to:", url);

      // Step 2: Update user profile with the image URL
      const updateData = {
        username: userData?.username || fieldValues.username || "",
        fullname: userData?.fullname || fieldValues.fullname || "",
        email: userData?.email || fieldValues.email || "",
        phoneNumber: userData?.phoneNumber || fieldValues.phone || "",
        address: userData?.address || fieldValues.address || "",
        gender: userData?.gender !== undefined ? userData.gender : (fieldValues.gender === "Male" ? 0 : fieldValues.gender === "Female" ? 1 : 2),
        licenseNumber: userData?.licenseNumber || fieldValues.licenseNumber || "",
        licenseExpiry: userData?.licenseExpiry || fieldValues.licenseExpiry || "",
        imageAvatar: url,
      };

      const { data, error } = await userService.updateUserInfo(user.id, updateData);

      if (error) {
        Alert.alert("Update Failed", error.message || "Failed to update profile with new avatar");
        return;
      }

      if (data) {
        setUserData(data);
        // Force a small delay to ensure the image is loaded
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      Alert.alert("Error", err?.message || "Failed to upload avatar");
    } finally {
      setIsSaving(false);
    }
  };

  // Get avatar source - support both URL and local assets
  const getAvatarSource = () => {
    // First check userData.imageAvatar from API
    if (userData?.imageAvatar) {
      // If it's a URL, use it directly
      if (userData.imageAvatar.startsWith('http://') || userData.imageAvatar.startsWith('https://')) {
        return { uri: `${userData.imageAvatar}?t=${Date.now()}` }
      }
      // Otherwise try to get local asset
      const localAsset = getAsset(userData.imageAvatar)
      if (localAsset) return localAsset
    }

    // Then check user.avatar from auth context
    if (user?.avatar) {
      // If it's a URL, use it directly
      if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        return { uri: `${user.avatar}?t=${Date.now()}` }
      }
      // Otherwise try to get local asset
      const localAsset = getAsset(user.avatar)
      if (localAsset) return localAsset
    }

    // Fallback to default avatar
    return require('../../../assets/male-avatar.png')
  }

  const avatarSource = getAvatarSource();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text style={{ marginTop: verticalScale(16), color: colors.placeholder }}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          avatarSource={avatarSource}
          fullname={fieldValues.fullname}
          username={fieldValues.username}
          gender={fieldValues.gender}
          status={userData?.status || "Active"}
          onEditAvatar={handleUploadAvatar}
          onEditGender={handleEditGender}
        />

        {/* Account Details */}
        <View
          style={{
            marginHorizontal: scale(16),
            marginVertical: verticalScale(12),
            backgroundColor: colors.white,
            borderRadius: scale(12),
            padding: scale(16),
          }}
        >
          <ProfileField
            label="Phone Number"
            value={fieldValues.phone}
            placeholder="Add Phone Number"
            onEdit={() => handleEditField("phone")}
            showStatusDot
            statusColor={getStatusColor("phone")}
            isSecure
          />

          <ProfileField
            label="Email"
            value={fieldValues.email}
            onEdit={() => handleEditField("email")}
            showStatusDot
            statusColor={colors.green}
            isSecure
          />

          <ProfileField
            label="Address"
            value={fieldValues.address}
            placeholder="Add your address"
            onEdit={() => handleEditField("address")}
            multiline
          />

          <ProfileField
            label="Username"
            value={fieldValues.username}
            placeholder="Not set"
            onEdit={() => handleEditField("username")}
          />
        </View>

        <DriverLicenseSection
          licenseNumber={fieldValues.licenseNumber}
          licenseExpiry={fieldValues.licenseExpiry}
          licenseImage={licenseImage}
          onEditLicenseNumber={() => handleEditField("licenseNumber")}
          onEditLicenseExpiry={() => handleEditField("licenseExpiry")}
          onUploadLicense={handleUploadLicense}
          getStatusColor={getStatusColor}
        />

        <View style={{ height: verticalScale(20) }} />
      </ScrollView>

      <PasswordVerificationModal
        visible={showPasswordModal}
        password={password}
        isPasswordSecure={isPasswordSecure}
        isSaving={isSaving}
        pendingField={pendingField}
        onPasswordChange={setPassword}
        onToggleSecure={() => setIsPasswordSecure(!isPasswordSecure)}
        onVerify={handlePasswordVerification}
        onCancel={() => {
          setShowPasswordModal(false);
          setPassword("");
          setPendingField(null);
        }}
      />

      <EditFieldModal
        visible={editingField !== null}
        editingField={editingField}
        editValue={editValue}
        isSaving={isSaving}
        onValueChange={handleEditValueChange}
        onSave={handleSaveField}
        onCancel={() => {
          setEditingField(null);
          setEditValue("");
        }}
      />
    </View>
  );
}

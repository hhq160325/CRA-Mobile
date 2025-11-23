import React, { useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import { useAuth } from '../../../lib/auth-context';
import getAsset from '@/lib/getAsset';
import Header from '../../components/Header/Header';
import { userService } from '../../../lib/api/services/user.service';
import ProfileHeader from './components/ProfileHeader';
import ProfileField from './components/ProfileField';
import DriverLicenseSection from './components/DriverLicenseSection';
import PasswordVerificationModal from './components/PasswordVerificationModal';
import EditFieldModal from './components/EditFieldModal';
import { useProfileData } from './hooks/useProfileData';
import { validateLicenseNumber, validateLicenseExpiry } from './utils/validation';

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { userData, setUserData, isLoading, licenseImage, setLicenseImage, fieldValues, setFieldValues } = useProfileData(user?.id);


  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [pendingField, setPendingField] = useState<string | null>(null);


  const buildSafeUpdateData = (latestData: any, overrides: any = {}) => {
    // Build base data from latest API data, NOT from fieldValues
    // This ensures we preserve all fields from the server
    const baseData: any = {
      username: latestData?.username || fieldValues.username || "",
      fullname: latestData?.fullname || fieldValues.fullname || "",
      email: latestData?.email || fieldValues.email || user?.email || "",
      phoneNumber: latestData?.phoneNumber || fieldValues.phone || "",
      address: latestData?.address || fieldValues.address || "",
      gender: latestData?.gender !== undefined ? latestData.gender : (fieldValues.gender === "Male" ? 0 : fieldValues.gender === "Female" ? 1 : 2),
      licenseNumber: latestData?.licenseNumber || fieldValues.licenseNumber || "",
      licenseExpiry: latestData?.licenseExpiry || fieldValues.licenseExpiry || "",
      dateOfBirth: latestData?.dateOfBirth || null,
      imageAvatar: latestData?.imageAvatar || null,
      isCarOwner: latestData?.isCarOwner || false,
      rating: latestData?.rating || 0,
      roleId: latestData?.roleId || 1,
    };

    // IMPORTANT: Only include password if it exists in latestData
    // Backend uses .Condition(src => src.Password != null) in AutoMapper
    // So we must NOT send password field at all (not even empty string)
    if (latestData?.password) {
      baseData.password = latestData.password;
    }
    // If password doesn't exist, DON'T add it to baseData at all

    // Merge with overrides (the fields being updated)
    const mergedData = { ...baseData, ...overrides };

    // Remove sensitive fields that should NEVER be sent in update requests
    // EXCEPT password if it came from the server
    const sensitiveFields = [
      'passwordHash',
      'passwordSalt',
      'googleId',
      'isGoogle',
      'refreshToken',
      'accessToken',
      'token',
      'tokens',
    ];

    sensitiveFields.forEach(field => {
      delete mergedData[field];
    });

    // Remove password-related fields EXCEPT 'password' itself
    Object.keys(mergedData).forEach(key => {
      if (key !== 'password' && (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass'))) {
        delete mergedData[key];
      }
    });

    // CRITICAL: Remove password field if it's empty, null, or undefined
    // Backend AutoMapper condition: .Condition(src => src.Password != null)
    // This means we must NOT send password field at all if we don't want to change it
    if (!mergedData.password || mergedData.password === "" || mergedData.password === null) {
      delete mergedData.password;
    }

    console.log("Safe update data prepared:", Object.keys(mergedData));
    console.log("Password included:", !!mergedData.password);

    return mergedData;
  };

  const getStatusColor = (field: string) => {
    const emptyFields = ["phone", "licenseNumber"];
    return emptyFields.includes(field) || !fieldValues[field as keyof typeof fieldValues] ? colors.red : colors.green;
  };


  const formatDateWithMask = (text: string) => {

    const cleaned = text.replace(/\D/g, '');


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


    if (result.length < mask.length) {
      result += mask.slice(result.length);
    }

    return result;
  };


  const handleEditValueChange = (text: string) => {
    if (editingField === 'licenseExpiry') {

      const digits = text.replace(/\D/g, '');


      const limitedDigits = digits.slice(0, 8);
      const formatted = formatDateWithMask(limitedDigits);
      setEditValue(formatted);
    } else if (editingField === 'licenseNumber') {

      const digits = text.replace(/\D/g, '');


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


      if (field === 'licenseExpiry') {
        if (!currentValue) {
          setEditValue('__/__/____');
        } else {

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

      // Fetch latest user data first to ensure we have all current values
      const { data: currentUserData, error: fetchError } = await userService.getUserById(user.id);

      if (fetchError || !currentUserData) {
        console.warn("Could not fetch current user data, using cached data");
      }

      const latestData = currentUserData || userData;

      // Build update data with ALL current fields + the changed field (safely)
      const updateData = buildSafeUpdateData(latestData, {
        [apiFieldName]: apiValue,
      });

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
      // Fetch latest user data first
      const { data: currentUserData, error: fetchError } = await userService.getUserById(user.id);

      if (fetchError || !currentUserData) {
        console.warn("Could not fetch current user data, using cached data");
      }

      const latestData = currentUserData || userData;
      const genderValue = gender === "Male" ? 0 : gender === "Female" ? 1 : 2;

      // Build update data with ALL current fields + the changed gender (safely)
      const updateData = buildSafeUpdateData(latestData, {
        gender: genderValue,
      });

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
        quality: 0.9, // Higher quality for avatar
        exif: false, // Don't need EXIF data
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Camera image selected:", imageUri);
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error("Camera error:", error);
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
        quality: 0.9, // Higher quality for avatar
        exif: false, // Don't need EXIF data
        // Allow all image formats including HEIC from iPhone
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Gallery image selected:", imageUri);
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user?.id) {
      console.error("Upload avatar failed: No user ID");
      Alert.alert("Error", "User not found. Please login again.");
      return;
    }

    console.log("=== Starting Avatar Upload ===");
    console.log("User ID:", user.id);
    console.log("Image URI:", uri);

    setIsSaving(true);
    try {
      // Step 1: Fetch latest user data
      console.log("Step 1: Fetching latest user data...");
      const { data: currentUserData, error: fetchError } = await userService.getUserById(user.id);

      if (fetchError || !currentUserData) {
        console.warn("Could not fetch current user data, using cached data");
      } else {
        console.log("Current user data fetched successfully");
      }

      const latestData = currentUserData || userData;

      // Step 2: Convert image to base64
      console.log("Step 2: Converting image to base64...");
      const { convertImageToBase64, validateImageSize, getBase64String } = require("../../../lib/utils/image.utils");

      const base64WithPrefix = await convertImageToBase64(uri);

      // Validate image size (max 5MB)
      if (!validateImageSize(base64WithPrefix, 5)) {
        Alert.alert("Image Too Large", "Please select an image smaller than 5MB");
        return;
      }

      // Get base64 string without data URI prefix
      const base64String = getBase64String(base64WithPrefix);
      console.log("✓ Image converted to base64 (length:", base64String.length, "chars)");

      // Step 3: Update user profile with base64 image
      console.log("Step 3: Updating user profile with base64 image...");
      const updateData = buildSafeUpdateData(latestData, {
        imageAvatar: base64String,
      });

      console.log("Update data prepared (image length:", base64String.length, "chars)");

      const { data, error } = await userService.updateUserInfo(user.id, updateData);

      if (error) {
        console.error("Profile update failed:", error);
        Alert.alert("Update Failed", error.message || "Failed to update profile picture");
        return;
      }

      console.log("✓ Profile updated successfully");

      if (data) {
        setUserData(data);
        console.log("✓ Local state updated");

        // Update localStorage with new avatar
        try {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          currentUser.avatar = data.imageAvatar;
          localStorage.setItem("user", JSON.stringify(currentUser));
          console.log("✓ localStorage updated with new avatar");
        } catch (err) {
          console.error("Failed to update localStorage:", err);
        }

        // Refresh auth context to update Header avatar
        refreshUser();
        console.log("✓ Auth context refreshed");
      }

      console.log("=== Avatar Upload Complete ===");
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (err: any) {
      console.error("=== Avatar Upload Error ===");
      console.error("Error details:", err);
      console.error("Error message:", err?.message);
      console.error("Error stack:", err?.stack);
      Alert.alert("Error", err?.message || "Failed to upload avatar");
    } finally {
      setIsSaving(false);
    }
  };


  const getAvatarSource = () => {
    // Check userData.imageAvatar first
    if (userData?.imageAvatar) {
      // If it's a URL
      if (userData.imageAvatar.startsWith('http://') || userData.imageAvatar.startsWith('https://')) {
        return { uri: `${userData.imageAvatar}?t=${Date.now()}` }
      }

      // If it's base64 (with or without prefix)
      if (userData.imageAvatar.length > 100) {
        const base64 = userData.imageAvatar.startsWith('data:')
          ? userData.imageAvatar
          : `data:image/jpeg;base64,${userData.imageAvatar}`;
        return { uri: base64 };
      }

      // Try as local asset
      const localAsset = getAsset(userData.imageAvatar)
      if (localAsset) return localAsset
    }

    // Check user.avatar as fallback
    if (user?.avatar) {
      // If it's a URL
      if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        return { uri: `${user.avatar}?t=${Date.now()}` }
      }

      // If it's base64
      if (user.avatar.length > 100) {
        const base64 = user.avatar.startsWith('data:')
          ? user.avatar
          : `data:image/jpeg;base64,${user.avatar}`;
        return { uri: base64 };
      }

      // Try as local asset
      const localAsset = getAsset(user.avatar)
      if (localAsset) return localAsset
    }

    // Default avatar
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

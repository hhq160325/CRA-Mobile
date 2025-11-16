import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import { useAuth } from '../../../lib/auth-context';
import getAsset from '@/lib/getAsset';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header/Header';
import * as ImagePicker from 'expo-image-picker';

import { Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';


export default function ProfileScreen() {
  const { user } = useAuth()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showIncompleteModal, setShowIncompleteModal] = useState(false)
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [licenseImage, setLicenseImage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [tempLicenseData, setTempLicenseData] = useState({
    licenseNumber: "",
    licenseExpiry: "",
    fullName: "",
  })
  const [fieldValues, setFieldValues] = useState({
    dateOfBirth: "30/1/2001",
    gender: "Male",
    phone: "+1234567891",
    email: user?.email || "example@gmail.com",
    facebook: "Admin",
    google: "JohnDoeGmail",
    licenseNumber: "",
    licenseExpiry: "",
  })

  // Check if profile is incomplete on mount
  useEffect(() => {
    const isIncomplete = !fieldValues.licenseNumber || !licenseImage
    if (isIncomplete) {
      // Show notification after 2 seconds
      const timer = setTimeout(() => {
        setShowIncompleteModal(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEditField = (field: string) => {
    setEditingField(field)
  }

  const handleSaveField = (field: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }))
    setEditingField(null)
  }

  const getStatusColor = (field: string) => {
    const emptyFields = ["phone", "licenseNumber"]
    return emptyFields.includes(field) || !fieldValues[field as keyof typeof fieldValues] ? colors.red : colors.green
  }

  const handleUploadLicense = async () => {
    Alert.alert(
      "Upload Driver's License",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => openCamera(),
        },
        {
          text: "Choose from Gallery",
          onPress: () => openGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    )
  }

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera permission is required to take photos.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri)
        Alert.alert("Success", "Driver's license photo uploaded!")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera")
    }
  }

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Photo library permission is required.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLicenseImage(result.assets[0].uri)
        Alert.alert("Success", "Driver's license photo uploaded!")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery")
    }
  }

  const avatarSource = user?.avatar
    ? getAsset(user.avatar)
    : require('../../../assets/male-avatar.png');


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView
        style={{
          flex: 1,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* Account Information */}
        <View
          style={{
            marginHorizontal: scale(16),
            marginVertical: verticalScale(12),
            backgroundColor: colors.white,
            borderRadius: scale(12),
            padding: scale(16),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: verticalScale(16),
            }}
          >
            <Text
              style={{
                fontSize: scale(16),
                fontWeight: "bold",
                color: colors.primary,
              }}
            >
              Account Information
            </Text>
            <TouchableOpacity>
              <Icon name="edit" size={scale(20)} color={colors.morentBlue} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: verticalScale(16) }}>
            <Image
              source={avatarSource}
              style={{
                width: scale(100),
                height: scale(100),
                borderRadius: scale(50),
                marginBottom: verticalScale(12),
              }}
            />
            <Text
              style={{
                fontSize: scale(18),
                fontWeight: "bold",
                color: colors.primary,
              }}
            >
              {user?.name || "John Doe"}
            </Text>
            <Text
              style={{
                fontSize: scale(12),
                color: colors.placeholder,
                marginTop: verticalScale(4),
              }}
            >
              Sec ID/0025
            </Text>
          </View>

          {/* Status Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: verticalScale(16),
              paddingBottom: verticalScale(12),
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.placeholder,
                  marginBottom: verticalScale(4),
                }}
              >
                Gender
              </Text>
              <Text
                style={{
                  fontSize: scale(14),
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                Male
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.placeholder,
                  marginBottom: verticalScale(4),
                }}
              >
                Status
              </Text>
              <Text
                style={{
                  fontSize: scale(14),
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                Male
              </Text>
            </View>
          </View>
        </View>

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
          {/* Date of Birth */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <Text
              style={{
                fontSize: scale(12),
                color: colors.placeholder,
                marginBottom: verticalScale(4),
              }}
            >
              Date of Birth
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.primary,
                }}
              >
                {fieldValues.dateOfBirth}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("dateOfBirth")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Gender */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <Text
              style={{
                fontSize: scale(12),
                color: colors.placeholder,
                marginBottom: verticalScale(4),
              }}
            >
              Gender
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.primary,
                }}
              >
                {fieldValues.gender}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("gender")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: verticalScale(4),
              }}
            >
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.placeholder,
                }}
              >
                Phone Number
              </Text>
              <View
                style={{
                  width: scale(8),
                  height: scale(8),
                  borderRadius: scale(4),
                  backgroundColor: getStatusColor("phone"),
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.primary,
                }}
              >
                {fieldValues.phone || "Add Phone Number"}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("phone")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Email */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: verticalScale(4),
              }}
            >
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.placeholder,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  width: scale(8),
                  height: scale(8),
                  borderRadius: scale(4),
                  backgroundColor: colors.green,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.primary,
                }}
              >
                {fieldValues.email}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("email")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Facebook */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <Text
              style={{
                fontSize: scale(12),
                color: colors.placeholder,
                marginBottom: verticalScale(4),
              }}
            >
              Facebook
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.primary,
                }}
              >
                {fieldValues.facebook}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("facebook")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Google */}
          <View>
            <Text
              style={{
                fontSize: scale(12),
                color: colors.placeholder,
                marginBottom: verticalScale(4),
              }}
            >
              Google
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.primary,
                }}
              >
                {fieldValues.google}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("google")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Driver's License Section */}
        <View
          style={{
            marginHorizontal: scale(16),
            marginVertical: verticalScale(12),
            backgroundColor: colors.white,
            borderRadius: scale(12),
            padding: scale(16),
          }}
        >
          <Text
            style={{
              fontSize: scale(16),
              fontWeight: "bold",
              color: colors.primary,
              marginBottom: verticalScale(16),
            }}
          >
            Driver's License
          </Text>

          {/* License Number */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: verticalScale(4),
              }}
            >
              <Text style={{ fontSize: scale(12), color: colors.placeholder }}>
                License Number
              </Text>
              <View
                style={{
                  width: scale(8),
                  height: scale(8),
                  borderRadius: scale(4),
                  backgroundColor: getStatusColor("licenseNumber"),
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: scale(14), color: colors.primary }}>
                {fieldValues.licenseNumber || "Add License Number"}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("licenseNumber")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* License Expiry */}
          <View style={{ marginBottom: verticalScale(16) }}>
            <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: verticalScale(4) }}>
              Expiry Date
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: scale(14), color: colors.primary }}>
                {fieldValues.licenseExpiry || "Add Expiry Date"}
              </Text>
              <TouchableOpacity onPress={() => handleEditField("licenseExpiry")}>
                <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
              </TouchableOpacity>
            </View>
          </View>

          {/* License Photo */}
          <View>
            <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: verticalScale(8) }}>
              License Photo
            </Text>
            {licenseImage ? (
              <View>
                <Image
                  source={{ uri: licenseImage }}
                  style={{
                    width: "100%",
                    height: scale(150),
                    borderRadius: scale(8),
                    marginBottom: verticalScale(12),
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleUploadLicense}
                  style={{
                    backgroundColor: colors.morentBlue,
                    paddingVertical: verticalScale(10),
                    borderRadius: scale(8),
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: scale(14), fontWeight: "600" }}>
                    Change Photo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleUploadLicense}
                style={{
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: colors.morentBlue,
                  borderRadius: scale(8),
                  paddingVertical: verticalScale(40),
                  alignItems: "center",
                  backgroundColor: colors.background,
                }}
              >
                <Icon name="add-a-photo" size={scale(40)} color={colors.morentBlue} />
                <Text style={{ fontSize: scale(14), color: colors.morentBlue, marginTop: verticalScale(8), fontWeight: "600" }}>
                  Upload License Photo
                </Text>
                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginTop: verticalScale(4) }}>
                  Take photo or choose from gallery
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: verticalScale(20) }} />
      </ScrollView>

      {/* Incomplete Profile Modal */}
      <Modal
        visible={showIncompleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIncompleteModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: scale(16),
              padding: scale(24),
              width: "85%",
              maxWidth: scale(350),
            }}
          >
            <View style={{ alignItems: "center", marginBottom: verticalScale(16) }}>
              <View
                style={{
                  width: scale(60),
                  height: scale(60),
                  borderRadius: scale(30),
                  backgroundColor: "#FEF3C7",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: verticalScale(12),
                }}
              >
                <Icon name="warning" size={scale(32)} color="#F59E0B" />
              </View>
              <Text
                style={{
                  fontSize: scale(18),
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: verticalScale(8),
                }}
              >
                Incomplete Profile
              </Text>
              <Text
                style={{
                  fontSize: scale(14),
                  color: colors.placeholder,
                  textAlign: "center",
                  lineHeight: scale(20),
                }}
              >
                Please complete your driver's license information to rent vehicles.
              </Text>
            </View>

            <View style={{ marginBottom: verticalScale(16) }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: verticalScale(8) }}>
                <Icon name="check-circle" size={scale(20)} color={colors.green} />
                <Text style={{ fontSize: scale(13), color: colors.primary, marginLeft: scale(8) }}>
                  Upload driver's license photo
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="check-circle" size={scale(20)} color={colors.green} />
                <Text style={{ fontSize: scale(13), color: colors.primary, marginLeft: scale(8) }}>
                  Add license number and expiry date
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: scale(12) }}>
              <TouchableOpacity
                onPress={() => setShowIncompleteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: verticalScale(12),
                  borderRadius: scale(8),
                  borderWidth: 1,
                  borderColor: colors.morentBlue,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.morentBlue }}>
                  Later
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowIncompleteModal(false)
                  handleUploadLicense()
                }}
                style={{
                  flex: 1,
                  paddingVertical: verticalScale(12),
                  borderRadius: scale(8),
                  backgroundColor: colors.morentBlue,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.white }}>
                  Complete Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import { useAuth } from '../../../lib/auth-context';
import getAsset from '@/lib/getAsset';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header/Header';

import { Image, ScrollView } from 'react-native';
import { useState } from 'react';


export default function ProfileScreen() {
  const { user } = useAuth()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldValues, setFieldValues] = useState({
    dateOfBirth: "30/1/2001",
    gender: "Male",
    phone: "+1234567891",
    email: user?.email || "example@gmail.com",
    facebook: "Admin",
    google: "JohnDoeGmail",
  })

  const handleEditField = (field: string) => {
    setEditingField(field)
  }

  const handleSaveField = (field: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }))
    setEditingField(null)
  }

  const getStatusColor = (field: string) => {
    const emptyFields = ["phone"]
    return emptyFields.includes(field) ? colors.red : colors.green
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

        {/* Bottom Padding */}
        <View style={{ height: verticalScale(20) }} />
      </ScrollView>
    </View>
  )
}

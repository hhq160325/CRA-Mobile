import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

interface ProfileHeaderProps {
    avatarSource: any;
    fullname: string;
    username: string;
    gender: string;
    status: string;
    onEditAvatar?: () => void;
    onEditGender?: () => void;
}

export default function ProfileHeader({
    avatarSource,
    fullname,
    username,
    gender,
    status,
    onEditAvatar,
    onEditGender
}: ProfileHeaderProps) {
    return (
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
            </View>

            {/* Avatar */}
            <View style={{ alignItems: "center", marginBottom: verticalScale(16) }}>
                <View style={{ position: "relative" }}>
                    <Image
                        source={avatarSource}
                        style={{
                            width: scale(100),
                            height: scale(100),
                            borderRadius: scale(50),
                            marginBottom: verticalScale(12),
                        }}
                    />
                    {onEditAvatar && (
                        <TouchableOpacity
                            onPress={onEditAvatar}
                            style={{
                                position: "absolute",
                                bottom: scale(12),
                                right: 0,
                                backgroundColor: colors.morentBlue,
                                width: scale(32),
                                height: scale(32),
                                borderRadius: scale(16),
                                justifyContent: "center",
                                alignItems: "center",
                                borderWidth: 2,
                                borderColor: colors.white,
                            }}
                        >
                            <Icon name="camera-alt" size={scale(16)} color={colors.white} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text
                    style={{
                        fontSize: scale(18),
                        fontWeight: "bold",
                        color: colors.primary,
                    }}
                >
                    {fullname || username || "User"}
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
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                            style={{
                                fontSize: scale(14),
                                fontWeight: "600",
                                color: colors.primary,
                                marginRight: scale(4),
                            }}
                        >
                            {gender || "Not set"}
                        </Text>
                        {onEditGender && (
                            <TouchableOpacity onPress={onEditGender}>
                                <Icon name="edit" size={scale(14)} color={colors.morentBlue} />
                            </TouchableOpacity>
                        )}
                    </View>
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
                        {status || "Active"}
                    </Text>
                </View>
            </View>
        </View>
    );
}

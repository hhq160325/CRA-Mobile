import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

interface ProfileFieldProps {
    label: string;
    value: string;
    placeholder?: string;
    onEdit: () => void;
    showStatusDot?: boolean;
    statusColor?: string;
    isSecure?: boolean;
    multiline?: boolean;
}

export default function ProfileField({
    label,
    value,
    placeholder = "Not set",
    onEdit,
    showStatusDot = false,
    statusColor,
    isSecure = false,
    multiline = false,
}: ProfileFieldProps) {
    return (
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
                    {label}
                </Text>
                {showStatusDot && statusColor && (
                    <View
                        style={{
                            width: scale(8),
                            height: scale(8),
                            borderRadius: scale(4),
                            backgroundColor: statusColor,
                        }}
                    />
                )}
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text
                        style={{
                            fontSize: scale(14),
                            color: colors.primary,
                            marginRight: scale(8),
                            flex: 1,
                        }}
                        numberOfLines={multiline ? 2 : 1}
                    >
                        {value || placeholder}
                    </Text>
                    {isSecure && <Icon name="lock" size={scale(14)} color={colors.placeholder} />}
                </View>
                <TouchableOpacity onPress={onEdit}>
                    <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import ProfileField from './ProfileField';

interface DriverLicenseSectionProps {
    licenseNumber: string;
    licenseExpiry: string;
    licenseImage: string | null;
    onEditLicenseNumber: () => void;
    onEditLicenseExpiry: () => void;
    onUploadLicense: () => void;
    getStatusColor: (field: string) => string;
}

export default function DriverLicenseSection({
    licenseNumber,
    licenseExpiry,
    licenseImage,
    onEditLicenseNumber,
    onEditLicenseExpiry,
    onUploadLicense,
    getStatusColor,
}: DriverLicenseSectionProps) {
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

            <ProfileField
                label="License Number"
                value={licenseNumber}
                placeholder="Add License Number"
                onEdit={onEditLicenseNumber}
                showStatusDot
                statusColor={getStatusColor("licenseNumber")}
            />

            <ProfileField
                label="Expiry Date"
                value={licenseExpiry}
                placeholder="Add Expiry Date"
                onEdit={onEditLicenseExpiry}
            />

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
                            onPress={onUploadLicense}
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
                        onPress={onUploadLicense}
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
    );
}

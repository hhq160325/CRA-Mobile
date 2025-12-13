import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import type { DriverLicenseSectionProps } from '../types/profileTypes';
import { styles } from '../styles/driverLicenseSection.styles';

export default function DriverLicenseSection({
    licenseImage,
    onUploadLicense,
}: DriverLicenseSectionProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Driver's License
            </Text>

            {/* License Photo */}
            <View>
                <Text style={styles.label}>
                    License Photo
                </Text>
                {licenseImage ? (
                    <View>
                        <Image
                            source={{ uri: licenseImage }}
                            style={styles.licenseImage}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={onUploadLicense}
                            style={styles.changePhotoButton}
                        >
                            <Text style={styles.changePhotoButtonText}>
                                Change Photo
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={onUploadLicense}
                        style={styles.uploadContainer}
                    >
                        <Icon name="add-a-photo" size={scale(40)} color={colors.morentBlue} />
                        <Text style={styles.uploadTitle}>
                            Upload License Photo
                        </Text>
                        <Text style={styles.uploadSubtitle}>
                            Take photo or choose from gallery
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

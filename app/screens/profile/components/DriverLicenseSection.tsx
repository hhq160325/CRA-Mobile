import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import type { DriverLicenseSectionProps } from '../types/profileTypes';

export default function DriverLicenseSection({
    licenseImage,
    licenseStatus,
    licenseCreateDate,
    licenseInfo,
    onUploadLicense,
}: DriverLicenseSectionProps) {
    const [showImageModal, setShowImageModal] = useState(false);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const openImageModal = () => {
        setShowImageModal(true);
    };
    return (
        <View style={{
            marginHorizontal: scale(16),
            marginVertical: verticalScale(12),
            backgroundColor: colors.white,
            borderRadius: scale(12),
            padding: scale(16),
        }}>
            {/* License Number Field */}
            <View style={{ marginBottom: verticalScale(16) }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: verticalScale(4),
                }}>
                    <Text style={{
                        fontSize: scale(12),
                        color: colors.placeholder,
                    }}>
                        License Number
                    </Text>
                    <View style={{
                        width: scale(8),
                        height: scale(8),
                        borderRadius: scale(4),
                        backgroundColor: colors.placeholder,
                    }} />
                </View>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.primary,
                        flex: 1,
                    }}>
                        {licenseInfo?.licenseNumber || 'Not provided'}
                    </Text>
                </View>
            </View>

            {/* License Photos Field */}
            <View style={{ marginBottom: verticalScale(16) }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: verticalScale(8),
                }}>
                    <Text style={{
                        fontSize: scale(12),
                        color: colors.placeholder,
                    }}>
                        License Photos
                    </Text>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: scale(8)
                    }}>
                        <View style={{
                            width: scale(8),
                            height: scale(8),
                            borderRadius: scale(4),
                            backgroundColor: licenseImage ? colors.green : colors.placeholder,
                        }} />
                        <TouchableOpacity onPress={onUploadLicense}>
                            <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
                        </TouchableOpacity>
                    </View>
                </View>

                {licenseImage ? (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}>
                        <TouchableOpacity onPress={openImageModal}>
                            <Image
                                source={{ uri: licenseImage }}
                                style={{
                                    width: scale(80),
                                    height: scale(60),
                                    borderRadius: scale(8),
                                    marginRight: scale(12),
                                }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.primary,
                            flex: 1,
                        }}>
                            Tap to view full size
                        </Text>
                    </View>
                ) : (
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.placeholder,
                    }}>
                        Upload your driver's license photo
                    </Text>
                )}
            </View>

            {/* License Status Field */}
            <View style={{ marginBottom: verticalScale(16) }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: verticalScale(4),
                }}>
                    <Text style={{
                        fontSize: scale(12),
                        color: colors.placeholder,
                    }}>
                        Verification Status
                    </Text>
                    <View style={{
                        width: scale(8),
                        height: scale(8),
                        borderRadius: scale(4),
                        backgroundColor: licenseStatus === 'AutoApproved' || licenseStatus === 'Approved' ? colors.green :
                            licenseStatus === 'Active' ? colors.morentBlue :
                                licenseStatus === 'Rejected' ? colors.red :
                                    '#F59E0B', // Orange for pending/unknown
                    }} />
                </View>
                <Text style={{
                    fontSize: scale(14),
                    color: colors.primary,
                }}>
                    {licenseStatus || 'Not submitted'}
                </Text>
            </View>

            {/* License Holder Name Field */}
            {licenseInfo?.licenseName && (
                <View style={{ marginBottom: verticalScale(16) }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: verticalScale(4),
                    }}>
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.placeholder,
                        }}>
                            License Holder Name
                        </Text>
                        <View style={{
                            width: scale(8),
                            height: scale(8),
                            borderRadius: scale(4),
                            backgroundColor: colors.green,
                        }} />
                    </View>
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.primary,
                    }}>
                        {licenseInfo.licenseName}
                    </Text>
                </View>
            )}

            {/* License Class Field */}
            {licenseInfo?.licenseClass && (
                <View style={{ marginBottom: verticalScale(16) }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: verticalScale(4),
                    }}>
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.placeholder,
                        }}>
                            License Class
                        </Text>
                        <View style={{
                            width: scale(8),
                            height: scale(8),
                            borderRadius: scale(4),
                            backgroundColor: colors.green,
                        }} />
                    </View>
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.primary,
                    }}>
                        {licenseInfo.licenseClass}
                    </Text>
                </View>
            )}

            {/* Date of Birth Field */}
            {licenseInfo?.licenseDoB && (
                <View style={{ marginBottom: verticalScale(16) }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: verticalScale(4),
                    }}>
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.placeholder,
                        }}>
                            Date of Birth
                        </Text>
                        <View style={{
                            width: scale(8),
                            height: scale(8),
                            borderRadius: scale(4),
                            backgroundColor: colors.green,
                        }} />
                    </View>
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.primary,
                    }}>
                        {new Date(licenseInfo.licenseDoB).toLocaleDateString()}
                    </Text>
                </View>
            )}

            {/* Issue Date Field */}
            {licenseInfo?.licenseIssue && (
                <View style={{ marginBottom: verticalScale(16) }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: verticalScale(4),
                    }}>
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.placeholder,
                        }}>
                            Issue Date
                        </Text>
                        <View style={{
                            width: scale(8),
                            height: scale(8),
                            borderRadius: scale(4),
                            backgroundColor: colors.green,
                        }} />
                    </View>
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.primary,
                    }}>
                        {new Date(licenseInfo.licenseIssue).toLocaleDateString()}
                    </Text>
                </View>
            )}

            {/* License Expiry Field */}
            <View>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: verticalScale(4),
                }}>
                    <Text style={{
                        fontSize: scale(12),
                        color: colors.placeholder,
                    }}>
                        Expiry Date
                    </Text>
                    <View style={{
                        width: scale(8),
                        height: scale(8),
                        borderRadius: scale(4),
                        backgroundColor: colors.placeholder,
                    }} />
                </View>
                <Text style={{
                    fontSize: scale(14),
                    color: colors.primary,
                }}>
                    {licenseInfo?.licenseExpiry ? new Date(licenseInfo.licenseExpiry).toLocaleDateString() : 'Not provided'}
                </Text>
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                visible={showImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={() => setShowImageModal(false)}
                        style={{
                            position: 'absolute',
                            top: scale(50),
                            right: scale(20),
                            zIndex: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: scale(20),
                            padding: scale(8),
                        }}
                    >
                        <Icon name="close" size={scale(24)} color="white" />
                    </TouchableOpacity>

                    {/* Full Screen Image */}
                    {licenseImage && (
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => setShowImageModal(false)}
                            style={{
                                width: screenWidth * 0.9,
                                height: screenHeight * 0.7,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={{ uri: licenseImage }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: scale(12),
                                }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    )}

                    {/* Instructions */}
                    <View style={{
                        position: 'absolute',
                        bottom: scale(50),
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: scale(14),
                            textAlign: 'center',
                            opacity: 0.8,
                        }}>
                            Tap anywhere to close
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

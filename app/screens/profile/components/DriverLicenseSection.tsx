import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import type { DriverLicenseSectionProps } from '../types/profileTypes';

export default function DriverLicenseSection({
    licenseImage,
    licenseImages = [],
    licenseStatus,
    licenseCreateDate,
    onUploadLicense,
}: DriverLicenseSectionProps) {
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    // Use licenseImages if available, otherwise fall back to single licenseImage
    const images = licenseImages.length > 0 ? licenseImages : (licenseImage ? [licenseImage] : []);
    const frontImage = images[0] || null;
    const backImage = images[1] || null;

    const openImageModal = (index: number) => {
        setSelectedImageIndex(index);
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
                        Not provided
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
                            backgroundColor: images.length > 0 ? colors.green : colors.placeholder,
                        }} />
                        <TouchableOpacity onPress={onUploadLicense}>
                            <Icon name="edit" size={scale(18)} color={colors.morentBlue} />
                        </TouchableOpacity>
                    </View>
                </View>

                {images.length > 0 ? (
                    <View>
                        {/* Front Image */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: verticalScale(8),
                        }}>
                            <Text style={{
                                fontSize: scale(11),
                                color: colors.placeholder,
                                width: scale(40),
                                marginRight: scale(8),
                            }}>
                                Front:
                            </Text>
                            {frontImage ? (
                                <TouchableOpacity onPress={() => openImageModal(0)}>
                                    <Image
                                        source={{ uri: frontImage }}
                                        style={{
                                            width: scale(60),
                                            height: scale(40),
                                            borderRadius: scale(6),
                                            marginRight: scale(12),
                                        }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View style={{
                                    width: scale(60),
                                    height: scale(40),
                                    borderRadius: scale(6),
                                    backgroundColor: colors.background,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: scale(12),
                                }}>
                                    <Icon name="add-a-photo" size={scale(16)} color={colors.placeholder} />
                                </View>
                            )}
                            <Text style={{
                                fontSize: scale(12),
                                color: frontImage ? colors.primary : colors.placeholder,
                                flex: 1,
                            }}>
                                {frontImage ? 'Tap to view' : 'Not uploaded'}
                            </Text>
                        </View>

                        {/* Back Image */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}>
                            <Text style={{
                                fontSize: scale(11),
                                color: colors.placeholder,
                                width: scale(40),
                                marginRight: scale(8),
                            }}>
                                Back:
                            </Text>
                            {backImage ? (
                                <TouchableOpacity onPress={() => openImageModal(1)}>
                                    <Image
                                        source={{ uri: backImage }}
                                        style={{
                                            width: scale(60),
                                            height: scale(40),
                                            borderRadius: scale(6),
                                            marginRight: scale(12),
                                        }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View style={{
                                    width: scale(60),
                                    height: scale(40),
                                    borderRadius: scale(6),
                                    backgroundColor: colors.background,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: scale(12),
                                }}>
                                    <Icon name="add-a-photo" size={scale(16)} color={colors.placeholder} />
                                </View>
                            )}
                            <Text style={{
                                fontSize: scale(12),
                                color: backImage ? colors.primary : colors.placeholder,
                                flex: 1,
                            }}>
                                {backImage ? 'Tap to view' : 'Not uploaded'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={{
                        fontSize: scale(14),
                        color: colors.placeholder,
                    }}>
                        Upload front and back of your driver's license
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
                        backgroundColor: licenseStatus === 'Approved' ? colors.green :
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
                    Not provided
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

                    {/* Image Title */}
                    {images.length > 1 && (
                        <Text style={{
                            position: 'absolute',
                            top: scale(50),
                            left: scale(20),
                            color: 'white',
                            fontSize: scale(16),
                            fontWeight: 'bold',
                        }}>
                            {selectedImageIndex === 0 ? 'Front' : 'Back'}
                        </Text>
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && selectedImageIndex > 0 && (
                        <TouchableOpacity
                            onPress={() => setSelectedImageIndex(selectedImageIndex - 1)}
                            style={{
                                position: 'absolute',
                                left: scale(20),
                                top: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: scale(20),
                                padding: scale(8),
                                zIndex: 1,
                            }}
                        >
                            <Icon name="chevron-left" size={scale(24)} color="white" />
                        </TouchableOpacity>
                    )}

                    {images.length > 1 && selectedImageIndex < images.length - 1 && (
                        <TouchableOpacity
                            onPress={() => setSelectedImageIndex(selectedImageIndex + 1)}
                            style={{
                                position: 'absolute',
                                right: scale(20),
                                top: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: scale(20),
                                padding: scale(8),
                                zIndex: 1,
                            }}
                        >
                            <Icon name="chevron-right" size={scale(24)} color="white" />
                        </TouchableOpacity>
                    )}

                    {/* Full Screen Image */}
                    {images[selectedImageIndex] && (
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
                                source={{ uri: images[selectedImageIndex] }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: scale(12),
                                }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    )}

                    {/* Image Counter and Instructions */}
                    <View style={{
                        position: 'absolute',
                        bottom: scale(50),
                        alignItems: 'center',
                    }}>
                        {images.length > 1 && (
                            <Text style={{
                                color: 'white',
                                fontSize: scale(12),
                                marginBottom: scale(8),
                                opacity: 0.8,
                            }}>
                                {selectedImageIndex + 1} of {images.length}
                            </Text>
                        )}
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

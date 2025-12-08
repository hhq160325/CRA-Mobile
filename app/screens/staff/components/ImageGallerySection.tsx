import React from "react"
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

const { width: screenWidth } = Dimensions.get('window')
// Calculate image size: 3 images per row with gaps
const imageGap = scale(8)
const containerPadding = scale(16) * 2 + scale(16) * 2 // section margin + content padding
const imagesPerRow = screenWidth > 400 ? 4 : 3
const imageSize = (screenWidth - containerPadding - (imageGap * (imagesPerRow - 1))) / imagesPerRow

interface ImageGallerySectionProps {
    title: string
    images: string[]
    description?: string
    iconName: string
    iconColor: string
    onAddPhoto?: () => void
    onRemoveImage?: (index: number) => void
    isReadOnly?: boolean
}

export default function ImageGallerySection({
    title,
    images,
    description,
    iconName,
    iconColor,
    onAddPhoto,
    onRemoveImage,
    isReadOnly = false
}: ImageGallerySectionProps) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name={iconName as any} size={24} color={iconColor} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                {description && (
                    <Text style={styles.description}>{description}</Text>
                )}

                {!isReadOnly && onAddPhoto && (
                    <Pressable onPress={onAddPhoto} style={styles.uploadButton}>
                        <MaterialIcons name="add-photo-alternate" size={20} color={colors.primary} />
                        <Text style={styles.uploadButtonText}>Add Photos</Text>
                    </Pressable>
                )}

                {images.length > 0 && (
                    <View style={styles.imageGrid}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri }} style={styles.thumbnail} />
                                {!isReadOnly && onRemoveImage && (
                                    <Pressable
                                        onPress={() => onRemoveImage(index)}
                                        style={styles.removeButton}
                                    >
                                        <MaterialIcons name="close" size={16} color={colors.white} />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        marginHorizontal: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        gap: scale(8),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontWeight: "600",
        color: colors.primary,
    },
    sectionContent: {
        padding: scale(16),
    },
    description: {
        fontSize: scale(14),
        color: "#6b7280",
        marginBottom: verticalScale(8),
        fontStyle: "italic",
    },
    uploadButton: {
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.primary,
        gap: scale(8),
    },
    uploadButtonText: {
        color: colors.primary,
        fontSize: scale(14),
        fontWeight: "600",
    },
    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: scale(8),
        marginTop: verticalScale(12),
    },
    imageContainer: {
        position: "relative",
        width: imageSize,
        height: imageSize,
    },
    thumbnail: {
        width: "100%",
        height: "100%",
        borderRadius: scale(8),
        backgroundColor: "#e5e7eb",
    },
    removeButton: {
        position: "absolute",
        top: -scale(6),
        right: -scale(6),
        backgroundColor: "#ef4444",
        borderRadius: scale(12),
        width: scale(24),
        height: scale(24),
        alignItems: "center",
        justifyContent: "center",
    },
})

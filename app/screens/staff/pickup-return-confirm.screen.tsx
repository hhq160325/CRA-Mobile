import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Image, Alert, TextInput } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { bookingsService } from "../../../lib/api/services/bookings.service"
import { carsService } from "../../../lib/api/services/cars.service"
import { userService } from "../../../lib/api/services/user.service"
import { scheduleService } from "../../../lib/api/services/schedule.service"
import { useAuth } from "../../../lib/auth-context"
import * as ImagePicker from 'expo-image-picker'

type PickupReturnConfirmRouteProp = RouteProp<{ params: { bookingId: string } }, "params">

interface BookingDetails {
    id: string
    carName: string
    carModel: string
    carLicensePlate: string
    carImage: string
    customerName: string
    pickupPlace: string
    pickupTime: string
    dropoffPlace: string
    dropoffTime: string
    amount: number
    status: string
}

export default function PickupReturnConfirmScreen() {
    const route = useRoute<PickupReturnConfirmRouteProp>()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const { user } = useAuth()
    const { bookingId } = (route.params as any) || {}

    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [description, setDescription] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // Log user info for debugging
    useEffect(() => {
        if (user) {
            console.log("Staff user loaded:", {
                id: user.id,
                name: user.name,
                role: user.role,
                roleId: user.roleId
            })
        } else {
            console.error("No user found in auth context")
        }
    }, [user])

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true)
                console.log("Fetching booking details for:", bookingId)

                // Fetch booking
                const bookingResult = await bookingsService.getBookingById(bookingId)
                if (bookingResult.error || !bookingResult.data) {
                    setError("Failed to load booking details")
                    setLoading(false)
                    return
                }

                const bookingData = bookingResult.data

                // Fetch car details
                let carName = "Unknown Car"
                let carModel = ""
                let carLicensePlate = ""
                let carImage = ""

                if (bookingData.carId) {
                    const carResult = await carsService.getCarById(bookingData.carId)
                    if (carResult.data) {
                        carName = carResult.data.name
                        carModel = carResult.data.model
                        carLicensePlate = carResult.data.licensePlate || ""
                        carImage = carResult.data.image
                    }
                }

                // Fetch customer details
                let customerName = "Customer"
                if (bookingData.userId) {
                    const userResult = await userService.getUserById(bookingData.userId)
                    if (userResult.data) {
                        customerName = userResult.data.fullname || userResult.data.username || "Customer"
                    }
                }

                setBooking({
                    id: bookingData.id,
                    carName,
                    carModel,
                    carLicensePlate,
                    carImage,
                    customerName,
                    pickupPlace: bookingData.pickupLocation,
                    pickupTime: bookingData.startDate,
                    dropoffPlace: bookingData.dropoffLocation,
                    dropoffTime: bookingData.endDate,
                    amount: bookingData.totalPrice,
                    status: bookingData.status,
                })

                setLoading(false)
            } catch (err) {
                console.error("Error fetching booking details:", err)
                setError("An error occurred")
                setLoading(false)
            }
        }

        if (bookingId) {
            fetchBookingDetails()
        }
    }, [bookingId])

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
    }

    const showImagePickerOptions = () => {
        Alert.alert(
            'Add Photos',
            'Choose how you want to add photos',
            [
                {
                    text: 'Take Photo',
                    onPress: () => takePhoto(),
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => pickFromGallery(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        )
    }

    const takePhoto = async () => {
        try {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera permissions to take photos.')
                return
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                aspect: [4, 3],
            })

            if (!result.canceled && result.assets && result.assets[0]) {
                if (selectedImages.length >= 5) {
                    Alert.alert('Limit Reached', 'You can only upload up to 5 photos.')
                    return
                }
                setSelectedImages(prev => [...prev, result.assets[0].uri])
                console.log("Photo taken:", result.assets[0].uri)
            }
        } catch (error) {
            console.error("Error taking photo:", error)
            Alert.alert('Error', 'Failed to take photo')
        }
    }

    const pickFromGallery = async () => {
        try {
            // Request media library permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant gallery permissions to select photos.')
                return
            }

            // Calculate how many more images can be selected
            const remainingSlots = 5 - selectedImages.length
            if (remainingSlots <= 0) {
                Alert.alert('Limit Reached', 'You can only upload up to 5 photos.')
                return
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: remainingSlots,
                allowsEditing: false,
            })

            if (!result.canceled && result.assets) {
                const imageUris = result.assets.map(asset => asset.uri)
                setSelectedImages(prev => [...prev, ...imageUris].slice(0, 5)) // Max 5 images
                console.log("Images selected from gallery:", imageUris.length)
            }
        } catch (error) {
            console.error("Error picking images:", error)
            Alert.alert('Error', 'Failed to pick images')
        }
    }

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleConfirmPickup = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'Staff ID not found. Please log in again.')
            return
        }

        if (selectedImages.length === 0) {
            Alert.alert('Images Required', 'Please upload at least one photo of the vehicle condition.')
            return
        }

        Alert.alert(
            'Confirm Pickup',
            'Are you sure you want to confirm this pickup?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            setSubmitting(true)
                            console.log("Confirming pickup for booking:", bookingId)
                            console.log("Staff ID:", user.id)

                            const result = await scheduleService.checkIn(
                                bookingId,
                                selectedImages,
                                user.id,
                                description || "Pickup confirmed"
                            )

                            if (result.error) {
                                Alert.alert('Error', result.error.message)
                                setSubmitting(false)
                                return
                            }

                            Alert.alert(
                                'Success',
                                'Pickup confirmed successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.goBack()
                                    }
                                ]
                            )
                        } catch (error) {
                            console.error("Error confirming pickup:", error)
                            Alert.alert('Error', 'Failed to confirm pickup')
                            setSubmitting(false)
                        }
                    }
                }
            ]
        )
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading booking details...</Text>
                </View>
            </View>
        )
    }

    if (error || !booking) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorText}>{error || "Booking not found"}</Text>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButtonError}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    const pickupDateTime = formatDateTime(booking.pickupTime)
    const dropoffDateTime = formatDateTime(booking.dropoffTime)

    return (
        <View style={styles.container}>
            <Header />

            {/* Back Button */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                    <Text style={styles.backText}>Back to Staff</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Booking Card */}
                <View style={styles.card}>
                    {/* Car Image */}
                    {booking.carImage && (
                        <Image source={{ uri: booking.carImage }} style={styles.carImage} resizeMode="cover" />
                    )}

                    {/* Car Info */}
                    <View style={styles.cardHeader}>
                        <View style={styles.carInfo}>
                            <Text style={styles.carName}>{booking.carName}</Text>
                            {booking.carLicensePlate && (
                                <Text style={styles.licensePlate}>License: {booking.carLicensePlate}</Text>
                            )}
                            <Text style={styles.bookingId}>Booking ID: {booking.id.substring(0, 8)}...</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {booking.status === "completed" ? "Completed" : "Confirmed"}
                            </Text>
                        </View>
                    </View>

                    {/* Customer & Amount */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>CUSTOMER</Text>
                            <Text style={styles.infoValue}>{booking.customerName}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>AMOUNT</Text>
                            <Text style={styles.infoValue}>${booking.amount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Pickup Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-on" size={24} color={colors.morentBlue} />
                        <Text style={styles.sectionTitle}>Pickup Information</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.locationRow}>
                            <MaterialIcons name="place" size={20} color="#6b7280" />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationLabel}>Location</Text>
                                <Text style={styles.locationValue}>{booking.pickupPlace}</Text>
                            </View>
                        </View>
                        <View style={styles.locationRow}>
                            <MaterialIcons name="schedule" size={20} color="#6b7280" />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationLabel}>Date & Time</Text>
                                <Text style={styles.locationValue}>
                                    {pickupDateTime.date} at {pickupDateTime.time}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Dropoff Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-off" size={24} color="#ef4444" />
                        <Text style={styles.sectionTitle}>Dropoff Information</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <View style={styles.locationRow}>
                            <MaterialIcons name="place" size={20} color="#6b7280" />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationLabel}>Location</Text>
                                <Text style={styles.locationValue}>{booking.dropoffPlace}</Text>
                            </View>
                        </View>
                        <View style={styles.locationRow}>
                            <MaterialIcons name="schedule" size={20} color="#6b7280" />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationLabel}>Date & Time</Text>
                                <Text style={styles.locationValue}>
                                    {dropoffDateTime.date} at {dropoffDateTime.time}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description Input */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="description" size={24} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Add any notes about the vehicle condition..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Image Upload Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="photo-camera" size={24} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Vehicle Photos ({selectedImages.length}/5)</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <Pressable onPress={showImagePickerOptions} style={styles.uploadButton}>
                            <MaterialIcons name="add-photo-alternate" size={20} color={colors.primary} />
                            <Text style={styles.uploadButtonText}>Add Photos</Text>
                        </Pressable>

                        {selectedImages.length > 0 && (
                            <View style={styles.imageGrid}>
                                {selectedImages.map((uri, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri }} style={styles.thumbnail} />
                                        <Pressable
                                            onPress={() => removeImage(index)}
                                            style={styles.removeButton}
                                        >
                                            <MaterialIcons name="close" size={16} color={colors.white} />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <Pressable
                        onPress={handleConfirmPickup}
                        disabled={submitting || selectedImages.length === 0}
                        style={[
                            styles.confirmButton,
                            (submitting || selectedImages.length === 0) && styles.confirmButtonDisabled
                        ]}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <>
                                <MaterialIcons name="check-circle" size={20} color={colors.white} />
                                <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
    },
    backText: {
        fontSize: scale(16),
        color: colors.primary,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: scale(14),
        color: "#6b7280",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: scale(20),
    },
    errorText: {
        fontSize: scale(16),
        color: "#ef4444",
        marginTop: verticalScale(16),
        marginBottom: verticalScale(24),
        textAlign: "center",
    },
    backButtonError: {
        backgroundColor: colors.primary,
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    backButtonText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: "600",
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        margin: scale(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
    },
    carImage: {
        width: "100%",
        height: verticalScale(180),
        backgroundColor: "#e5e7eb",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    carInfo: {
        flex: 1,
    },
    carName: {
        fontSize: scale(18),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    licensePlate: {
        fontSize: scale(12),
        color: "#6b7280",
        marginBottom: verticalScale(4),
    },
    bookingId: {
        fontSize: scale(12),
        color: "#6b7280",
    },
    statusBadge: {
        backgroundColor: "#d1fae5",
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(16),
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: "600",
        color: "#059669",
    },
    infoRow: {
        flexDirection: "row",
        padding: scale(16),
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: scale(10),
        color: "#6b7280",
        fontWeight: "600",
        marginBottom: verticalScale(4),
    },
    infoValue: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
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
    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: verticalScale(16),
        gap: scale(12),
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: scale(12),
        color: "#6b7280",
        marginBottom: verticalScale(4),
    },
    locationValue: {
        fontSize: scale(14),
        color: colors.primary,
        fontWeight: "500",
    },
    actionButtons: {
        padding: scale(16),
        gap: verticalScale(12),
        marginBottom: verticalScale(24),
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: scale(14),
        color: colors.primary,
        minHeight: verticalScale(80),
        textAlignVertical: "top",
    },
    confirmButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        gap: scale(8),
    },
    confirmButtonDisabled: {
        backgroundColor: "#9ca3af",
        opacity: 0.6,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: scale(16),
        fontWeight: "600",
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
        width: scale(80),
        height: scale(80),
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

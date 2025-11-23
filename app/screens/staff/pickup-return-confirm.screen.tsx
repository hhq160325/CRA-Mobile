"use client"

import { useState, useEffect } from "react"
import { View, Text, Pressable, ScrollView, Image, Alert } from "react-native"
import { useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import { confirmationService, bookingsService, carsService, paymentService } from "../../../lib/api"

type ConfirmationType = "pickup" | "return"

interface ImageData {
    uri: string
    type: string
    name: string
}

export default function PickupReturnConfirmScreen() {
    const route = useRoute<RouteProp<{
        params: {
            paymentId: string;
            bookingId?: string;
            carName?: string;
            carType?: string;
            customerName?: string;
            pickupLocation?: string;
            pickupDate?: string;
            pickupTime?: string;
            dropoffLocation?: string;
            dropoffDate?: string;
            dropoffTime?: string;
        }
    }, "params">>()

    const params = (route.params as any) || {}
    const {
        paymentId,
        bookingId,
        carName,
        carType,
        customerName,
        pickupLocation,
        pickupDate,
        pickupTime,
        dropoffLocation,
        dropoffDate,
        dropoffTime
    } = params

    const navigation = useNavigation()

    // Check existing confirmations and set initial tab
    const existingConfirmation = confirmationService.getConfirmation(paymentId)
    const initialTab: ConfirmationType = existingConfirmation.pickupConfirmed ? "return" : "pickup"

    const [activeTab, setActiveTab] = useState<ConfirmationType>(initialTab)
    const [pickupImage, setPickupImage] = useState<ImageData | null>(null)
    const [returnImage, setReturnImage] = useState<ImageData | null>(null)
    const [loading, setLoading] = useState(false)
    const [bookingData, setBookingData] = useState<any>(null)
    const [fetchingBooking, setFetchingBooking] = useState(true)

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A"
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // Format time for display
    const formatTime = (dateStr: string) => {
        if (!dateStr) return "N/A"
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    // Fetch booking details from API
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) {
                console.log("No bookingId provided, using params data")
                setFetchingBooking(false)
                return
            }

            try {
                setFetchingBooking(true)
                console.log("Fetching booking details for:", bookingId)

                // Fetch booking details
                const { data: booking, error: bookingError } = await bookingsService.getBookingById(bookingId)

                if (bookingError || !booking) {
                    console.error("Error fetching booking:", bookingError)
                    Alert.alert("Error", "Failed to fetch booking details")
                    setFetchingBooking(false)
                    return
                }

                console.log("Booking fetched:", booking)
                console.log("Pickup location from booking:", booking.pickupLocation)
                console.log("Dropoff location from booking:", booking.dropoffLocation)

                // Fetch car details
                let fetchedCarName = carName || "Unknown Car"
                let fetchedCarType = carType || "Standard"
                let fetchedCarModel = "N/A"
                let fetchedLicensePlate = "N/A"
                if (booking.carId) {
                    try {
                        const { data: cars } = await carsService.getAllCars()
                        if (cars) {
                            const car = cars.find((c: any) => c.id === booking.carId)
                            if (car) {
                                fetchedCarName = car.name || car.model || "Unknown Car"
                                fetchedCarType = car.category || "Standard"
                                fetchedCarModel = car.model || "N/A"
                                fetchedLicensePlate = car.licensePlate || "N/A"
                            }
                        }
                    } catch (err) {
                        console.log("Error fetching car details:", err)
                    }
                }

                // Fetch customer details
                let fetchedCustomerName = customerName || "Unknown Customer"
                if (booking.userId) {
                    try {
                        const { data: user } = await paymentService.getUserById(booking.userId)
                        if (user) {
                            fetchedCustomerName = user.name || user.email || "Unknown Customer"
                        }
                    } catch (err) {
                        console.log("Error fetching user details:", err)
                    }
                }

                // Set the booking data
                const newBookingData = {
                    id: booking.id,
                    carName: fetchedCarName,
                    carType: fetchedCarType,
                    carModel: fetchedCarModel,
                    licensePlate: fetchedLicensePlate,
                    customerName: fetchedCustomerName,
                    amount: booking.totalPrice || 0,
                    pickupLocation: booking.pickupLocation || "N/A",
                    pickupDate: formatDate(booking.startDate),
                    pickupTime: formatTime(booking.startDate),
                    dropoffLocation: booking.dropoffLocation || "N/A",
                    dropoffDate: formatDate(booking.endDate),
                    dropoffTime: formatTime(booking.endDate),
                    mileage: 15420, // Mock data - would come from car details
                    fuelLevel: "Full", // Mock data - would come from car details
                }

                console.log("Booking data to set:", newBookingData)
                setBookingData(newBookingData)
            } catch (error) {
                console.error("Exception fetching booking details:", error)
                Alert.alert("Error", "Failed to load booking details")
            } finally {
                setFetchingBooking(false)
            }
        }

        fetchBookingDetails()
    }, [bookingId])

    // Use fetched booking data or fallback to params or mock data
    const payment = bookingData || {
        id: paymentId || "PAY001",
        carName: carName || "Koenigsegg",
        carType: carType || "Sport",
        carModel: "Agera RS",
        licensePlate: "N/A",
        customerName: customerName || "John Doe",
        amount: 450,
        date: pickupDate ? new Date(pickupDate) : new Date("2024-01-15"),
        pickupTime: pickupTime || "10:00 AM",
        pickupLocation: pickupLocation || "N/A",
        pickupDate: pickupDate ? formatDate(pickupDate) : "N/A",
        dropoffLocation: dropoffLocation || "N/A",
        dropoffDate: dropoffDate ? formatDate(dropoffDate) : "N/A",
        dropoffTime: dropoffTime || "N/A",
        mileage: 15420,
        fuelLevel: "Full",
    }

    const handleImageUpload = async (type: ConfirmationType) => {
        Alert.alert(
            "Select Image Source",
            "Choose how you want to add the photo",
            [
                {
                    text: "Take Photo",
                    onPress: () => openCamera(type),
                },
                {
                    text: "Choose from Gallery",
                    onPress: () => openGallery(type),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        )
    }

    const openCamera = async (type: ConfirmationType) => {
        try {
            // Request camera permissions
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

            if (!permissionResult.granted) {
                Alert.alert(
                    "Permission Required",
                    "Camera permission is required to take photos. Please enable it in your device settings."
                )
                return
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            })

            if (result.canceled) {
                console.log("User cancelled camera")
                return
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0]
                console.log("Camera asset:", asset)

                const imageData: ImageData = {
                    uri: asset.uri,
                    type: "image/jpeg",
                    name: `${type}_${Date.now()}.jpg`,
                }

                if (type === "pickup") {
                    setPickupImage(imageData)
                    console.log("Pickup image set:", imageData)
                } else {
                    setReturnImage(imageData)
                    console.log("Return image set:", imageData)
                }

                Alert.alert("Success", "Photo captured successfully!")
            }
        } catch (error: any) {
            console.log("Camera exception:", error)
            Alert.alert("Error", `Failed to open camera: ${error.message || "Unknown error"}`)
        }
    }

    const openGallery = async (type: ConfirmationType) => {
        try {
            // Request media library permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (!permissionResult.granted) {
                Alert.alert(
                    "Permission Required",
                    "Photo library permission is required to select photos. Please enable it in your device settings."
                )
                return
            }

            // Launch image library
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            })

            if (result.canceled) {
                console.log("User cancelled gallery")
                return
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0]
                console.log("Gallery asset:", asset)

                const imageData: ImageData = {
                    uri: asset.uri,
                    type: "image/jpeg",
                    name: `${type}_${Date.now()}.jpg`,
                }

                if (type === "pickup") {
                    setPickupImage(imageData)
                    console.log("Pickup image set from gallery:", imageData)
                } else {
                    setReturnImage(imageData)
                    console.log("Return image set from gallery:", imageData)
                }

                Alert.alert("Success", "Image selected successfully!")
            }
        } catch (error: any) {
            console.log("Gallery exception:", error)
            Alert.alert("Error", `Failed to open gallery: ${error.message || "Unknown error"}`)
        }
    }

    const handleSubmit = async () => {
        // Check which tab is active and what needs to be confirmed
        if (activeTab === "pickup") {
            if (!pickupImage) {
                Alert.alert("Missing Image", "Please upload pickup confirmation photo")
                return
            }

            setLoading(true)
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Save pickup confirmation
                confirmationService.confirmPickup(paymentId, pickupImage.uri)

                Alert.alert("Success", "Pickup confirmed! Car delivered to customer.", [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate back to staff screen
                            ; (navigation as any).navigate("StaffScreen")
                        },
                    },
                ])
            } catch (error) {
                Alert.alert("Error", "Failed to confirm pickup")
            } finally {
                setLoading(false)
            }
        } else {
            // Return tab
            if (!returnImage) {
                Alert.alert("Missing Image", "Please upload return confirmation photo")
                return
            }

            setLoading(true)
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Save return confirmation
                confirmationService.confirmReturn(paymentId, returnImage.uri)

                Alert.alert("Success", "Return confirmed! Car back in garage.", [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate back to staff screen
                            ; (navigation as any).navigate("StaffScreen")
                        },
                    },
                ])
            } catch (error) {
                Alert.alert("Error", "Failed to confirm return")
            } finally {
                setLoading(false)
            }
        }
    }

    // Show loading state while fetching booking
    if (fetchingBooking) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Header />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: scale(14), color: colors.placeholder }}>Loading booking details...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Vehicle Info Card */}
                <View style={{ padding: scale(16), backgroundColor: colors.white, marginBottom: scale(1) }}>
                    <Text style={{ fontSize: scale(16), fontWeight: "700", color: colors.primary, marginBottom: scale(12) }}>
                        Vehicle Information
                    </Text>

                    <View style={{ backgroundColor: colors.background, borderRadius: scale(8), padding: scale(12) }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(8) }}>
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Car</Text>
                            <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                                {payment.carName} ({payment.carType})
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(8) }}>
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Model</Text>
                            <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                                {payment.carModel || "N/A"}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(8) }}>
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>License Plate</Text>
                            <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                                {payment.licensePlate || "N/A"}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(8) }}>
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Customer</Text>
                            <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                                {payment.customerName}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(8) }}>
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Amount</Text>
                            <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.morentBlue }}>
                                ${payment.amount.toFixed(2)}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(8) }}>
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Initial Mileage</Text>
                            <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                                {payment.mileage} km
                            </Text>
                        </View>
                    </View>

                    {/* Pick-up & Drop-off Details */}
                    <View style={{ marginTop: scale(12), backgroundColor: colors.background, borderRadius: scale(8), padding: scale(12) }}>
                        <Text style={{ fontSize: scale(13), fontWeight: "700", color: colors.primary, marginBottom: scale(8) }}>
                            📍 Pick-up Details
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(6) }}>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Location</Text>
                            <Text style={{ fontSize: scale(11), fontWeight: "600", color: colors.primary }}>
                                {payment.pickupLocation}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(6) }}>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Date</Text>
                            <Text style={{ fontSize: scale(11), fontWeight: "600", color: colors.primary }}>
                                {payment.pickupDate}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(12) }}>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Time</Text>
                            <Text style={{ fontSize: scale(11), fontWeight: "600", color: colors.primary }}>
                                {payment.pickupTime}
                            </Text>
                        </View>

                        <Text style={{ fontSize: scale(13), fontWeight: "700", color: colors.primary, marginBottom: scale(8) }}>
                            📍 Drop-off Details
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(6) }}>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Location</Text>
                            <Text style={{ fontSize: scale(11), fontWeight: "600", color: colors.primary }}>
                                {payment.dropoffLocation}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(6) }}>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Date</Text>
                            <Text style={{ fontSize: scale(11), fontWeight: "600", color: colors.primary }}>
                                {payment.dropoffDate}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Time</Text>
                            <Text style={{ fontSize: scale(11), fontWeight: "600", color: colors.primary }}>
                                {payment.dropoffTime}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Confirmation Tabs */}
                <View
                    style={{
                        flexDirection: "row",
                        backgroundColor: colors.white,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    }}
                >
                    {(["pickup", "return"] as ConfirmationType[]).map((tab) => {
                        const hasImage = tab === "pickup" ? pickupImage : returnImage
                        return (
                            <Pressable
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    paddingVertical: scale(12),
                                    borderBottomWidth: activeTab === tab ? 3 : 0,
                                    borderBottomColor: activeTab === tab ? colors.morentBlue : "transparent",
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: scale(14),
                                        fontWeight: "600",
                                        color: activeTab === tab ? colors.morentBlue : colors.placeholder,
                                        textAlign: "center",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {hasImage ? "✓ " : ""}{tab}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>

                {/* Content Area */}
                <View style={{ flex: 1, padding: scale(16) }}>
                    {activeTab === "pickup" ? (
                        <View>
                            <Text style={{ fontSize: scale(14), fontWeight: "700", color: colors.primary, marginBottom: scale(12) }}>
                                Pickup Confirmation
                            </Text>

                            <View style={{ marginBottom: scale(16) }}>
                                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(6) }}>
                                    Pickup Time
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: colors.background,
                                        padding: scale(12),
                                        borderRadius: scale(8),
                                    }}
                                >
                                    <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
                                        {payment.pickupTime}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: scale(16) }}>
                                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(6) }}>
                                    Fuel Level
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: colors.background,
                                        padding: scale(12),
                                        borderRadius: scale(8),
                                    }}
                                >
                                    <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
                                        {payment.fuelLevel}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: scale(20) }}>
                                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(6) }}>
                                    Pickup Confirmation Photo
                                </Text>
                                <Text style={{ fontSize: scale(11), color: colors.placeholder, marginBottom: scale(10) }}>
                                    Accepted formats: PNG, HEIC, HEIF
                                </Text>

                                {pickupImage ? (
                                    <View
                                        style={{
                                            borderWidth: 2,
                                            borderColor: "#00B050",
                                            borderRadius: scale(8),
                                            overflow: "hidden",
                                            marginBottom: scale(12),
                                        }}
                                    >
                                        <Image
                                            source={{ uri: pickupImage.uri }}
                                            style={{ width: "100%", height: scale(200), backgroundColor: colors.background }}
                                        />
                                        <View
                                            style={{
                                                backgroundColor: "#00B050",
                                                padding: scale(8),
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text style={{ fontSize: scale(11), color: colors.white, fontWeight: "600" }}>
                                                ✓ Image Uploaded
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => setPickupImage(null)}
                                            style={{
                                                position: "absolute",
                                                top: scale(8),
                                                right: scale(8),
                                                backgroundColor: "#EF4444",
                                                borderRadius: scale(20),
                                                width: scale(32),
                                                height: scale(32),
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text style={{ color: colors.white, fontSize: scale(16), fontWeight: "bold" }}>×</Text>
                                        </Pressable>
                                    </View>
                                ) : null}

                                <Pressable
                                    onPress={() => handleImageUpload("pickup")}
                                    style={{
                                        borderWidth: 2,
                                        borderStyle: "dashed",
                                        borderColor: colors.morentBlue,
                                        borderRadius: scale(8),
                                        padding: scale(20),
                                        alignItems: "center",
                                        backgroundColor: colors.background,
                                    }}
                                >
                                    <Text style={{ fontSize: scale(24), marginBottom: scale(8) }}>📷</Text>
                                    <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.morentBlue, marginBottom: scale(4) }}>
                                        Tap to upload photo
                                    </Text>
                                    <Text style={{ fontSize: scale(10), color: colors.placeholder }}>
                                        PNG, HEIC, HEIF up to 10MB
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text style={{ fontSize: scale(14), fontWeight: "700", color: colors.primary, marginBottom: scale(12) }}>
                                Return Confirmation
                            </Text>

                            <View style={{ marginBottom: scale(16) }}>
                                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(6) }}>
                                    Expected Return Time
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: colors.background,
                                        padding: scale(12),
                                        borderRadius: scale(8),
                                    }}
                                >
                                    <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
                                        04:00 PM
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: scale(16) }}>
                                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(6) }}>
                                    Final Mileage
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: colors.background,
                                        padding: scale(12),
                                        borderRadius: scale(8),
                                    }}
                                >
                                    <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
                                        15,520 km (100 km driven)
                                    </Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: scale(20) }}>
                                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(6) }}>
                                    Return Confirmation Photo
                                </Text>
                                <Text style={{ fontSize: scale(11), color: colors.placeholder, marginBottom: scale(10) }}>
                                    Accepted formats: PNG, HEIC, HEIF
                                </Text>

                                {returnImage ? (
                                    <View
                                        style={{
                                            borderWidth: 2,
                                            borderColor: "#00B050",
                                            borderRadius: scale(8),
                                            overflow: "hidden",
                                            marginBottom: scale(12),
                                        }}
                                    >
                                        <Image
                                            source={{ uri: returnImage.uri }}
                                            style={{ width: "100%", height: scale(200), backgroundColor: colors.background }}
                                        />
                                        <View
                                            style={{
                                                backgroundColor: "#00B050",
                                                padding: scale(8),
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text style={{ fontSize: scale(11), color: colors.white, fontWeight: "600" }}>
                                                ✓ Image Uploaded
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => setReturnImage(null)}
                                            style={{
                                                position: "absolute",
                                                top: scale(8),
                                                right: scale(8),
                                                backgroundColor: "#EF4444",
                                                borderRadius: scale(20),
                                                width: scale(32),
                                                height: scale(32),
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text style={{ color: colors.white, fontSize: scale(16), fontWeight: "bold" }}>×</Text>
                                        </Pressable>
                                    </View>
                                ) : null}

                                <Pressable
                                    onPress={() => handleImageUpload("return")}
                                    style={{
                                        borderWidth: 2,
                                        borderStyle: "dashed",
                                        borderColor: colors.morentBlue,
                                        borderRadius: scale(8),
                                        padding: scale(20),
                                        alignItems: "center",
                                        backgroundColor: colors.background,
                                    }}
                                >
                                    <Text style={{ fontSize: scale(24), marginBottom: scale(8) }}>📷</Text>
                                    <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.morentBlue, marginBottom: scale(4) }}>
                                        Tap to upload photo
                                    </Text>
                                    <Text style={{ fontSize: scale(10), color: colors.placeholder }}>
                                        PNG, HEIC, HEIF up to 10MB
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <View style={{ padding: scale(16), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Pressable
                        onPress={() => {
                            console.log("Submit button pressed")
                            console.log("Active tab:", activeTab)
                            console.log("Pickup image:", pickupImage)
                            console.log("Return image:", returnImage)
                            console.log("Loading:", loading)
                            handleSubmit()
                        }}
                        disabled={loading || (activeTab === "pickup" ? !pickupImage : !returnImage)}
                        style={{
                            backgroundColor:
                                loading || (activeTab === "pickup" ? !pickupImage : !returnImage) ? colors.placeholder : colors.morentBlue,
                            paddingVertical: scale(14),
                            borderRadius: scale(8),
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: scale(14),
                                fontWeight: "700",
                                color: colors.white,
                            }}
                        >
                            {loading
                                ? "Submitting..."
                                : activeTab === "pickup"
                                    ? !pickupImage
                                        ? "Upload Pickup Photo"
                                        : "Confirm Pickup"
                                    : !returnImage
                                        ? "Upload Return Photo"
                                        : "Confirm Return"
                            }
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

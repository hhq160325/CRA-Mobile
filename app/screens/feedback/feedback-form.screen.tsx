"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import Button from "../../components/button/component"
import Icon from "react-native-vector-icons/MaterialIcons"
import { reviewsService, bookingsService } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"
import { styles } from "./feedback-form.styles"

const FEEDBACK_CATEGORIES = [
    "Service Quality",
    "Cleanliness",
    "Pricing",
    "Staff",
    "Vehicle Condition",
    "Other",
]

export default function FeedbackFormScreen() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const route = useRoute()
    const { user } = useAuth()
    const carId = (route.params as any)?.carId || ""
    const bookingId = (route.params as any)?.bookingId || ""
    const bookingNumber = (route.params as any)?.bookingNumber || ""

    const [rating, setRating] = useState(0)
    const [category, setCategory] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingDetails, setBookingDetails] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const isFormValid = rating > 0 && category && title.trim() && message.trim()

    // Fetch booking details using bookingNumber for better car information
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingNumber) return

            setLoading(true)
            try {
                console.log('Fetching booking details for:', bookingNumber)
                const result = await bookingsService.getBookingByNumber(bookingNumber)

                if (result.data) {
                    console.log('Booking details fetched successfully:', result.data)
                    setBookingDetails(result.data)
                } else {
                    console.error('Failed to fetch booking details:', result.error)
                }
            } catch (error) {
                console.error('Error fetching booking details:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBookingDetails()
    }, [bookingNumber])

    const validateForm = () => {
        if (!isFormValid) {
            Alert.alert("Please fill all fields", "All fields are required")
            return false
        }

        // Check if we have car information from either carId or booking details
        const hasCarInfo = carId || (bookingDetails && bookingDetails.car)
        if (!hasCarInfo) {
            Alert.alert("Error", "Car information is missing. Please try again.")
            return false
        }

        if (!bookingId) {
            Alert.alert("Error", "Booking information is missing. Feedback can only be submitted for completed bookings.")
            return false
        }

        return true
    }

    const submitFeedback = async () => {
        const content = `${message}\n\nCategory: ${category}`

        // Use carId from params or from booking details
        const finalCarId = carId || (bookingDetails && bookingDetails.car ? bookingDetails.car.id : null)

        if (!finalCarId) {
            throw new Error("Car ID is required for feedback submission")
        }

        const { error } = await reviewsService.createFeedback({
            carId: finalCarId,
            bookingId: bookingId || undefined,
            rating: rating,
            title: title,
            content: content,
        })

        if (error) {
            throw new Error(error.message || "Failed to submit feedback")
        }
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        try {
            await submitFeedback()

            Alert.alert("Success", "Thank you for your feedback!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ])
        } catch (error) {
            console.error("Feedback submission error:", error)
            const errorMessage = error instanceof Error ? error.message : "Failed to submit feedback. Please try again."
            Alert.alert("Error", errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStarRating = () => (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                >
                    <Icon
                        name={star <= rating ? "star" : "star-outline"}
                        size={scale(32)}
                        color={star <= rating ? "#FFB800" : colors.border}
                    />
                </Pressable>
            ))}
        </View>
    )

    const renderCategoryButton = (cat: string) => (
        <Pressable
            key={cat}
            onPress={() => setCategory(cat)}
            style={[
                styles.categoryButton,
                category === cat ? styles.categoryButtonActive : styles.categoryButtonInactive
            ]}
        >
            <Text style={category === cat ? styles.categoryTextActive : styles.categoryTextInactive}>
                {cat}
            </Text>
        </Pressable>
    )

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="hourglass-empty" size={scale(48)} color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>Loading booking details...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.title}>Send us Your Feedback</Text>
                <Text style={styles.subtitle}>
                    We value your feedback and would love to hear about your experience with us.
                </Text>

                {(bookingId || bookingNumber) && (
                    <View style={styles.bookingNotice}>
                        <Icon
                            name="info"
                            size={scale(20)}
                            color={colors.morentBlue}
                            style={styles.iconMargin}
                        />
                        <View>
                            <Text style={styles.bookingNoticeText}>
                                Feedback for your completed booking
                            </Text>
                            {bookingDetails && bookingDetails.car && (
                                <Text style={[styles.bookingNoticeText, { fontSize: scale(12), marginTop: 4 }]}>
                                    {bookingDetails.car.manufacturer} {bookingDetails.car.model}
                                </Text>
                            )}
                            {bookingNumber && (
                                <Text style={[styles.bookingNoticeText, { fontSize: scale(12), marginTop: 2 }]}>
                                    Booking: {bookingNumber}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon
                            name="star"
                            size={scale(18)}
                            color={colors.morentBlue}
                            style={styles.iconMargin}
                        />
                        <Text style={styles.cardTitle}>How would you rate us?</Text>
                        <Text style={styles.requiredMark}>*</Text>
                    </View>
                    {renderStarRating()}
                    {rating > 0 && (
                        <Text style={styles.ratingText}>
                            Rating: {rating} out of 5
                        </Text>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon
                            name="category"
                            size={scale(18)}
                            color={colors.morentBlue}
                            style={styles.iconMargin}
                        />
                        <Text style={styles.cardTitle}>Feedback Category</Text>
                        <Text style={styles.requiredMark}>*</Text>
                    </View>
                    <View style={styles.categoryContainer}>
                        {FEEDBACK_CATEGORIES.map(renderCategoryButton)}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Feedback Title</Text>
                        <Text style={styles.requiredMark}>*</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter feedback title"
                        placeholderTextColor={colors.placeholder}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                    <Text style={styles.charCount}>{title.length}/100</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Your Message</Text>
                        <Text style={styles.requiredMark}>*</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Please share your detailed feedback here..."
                        placeholderTextColor={colors.placeholder}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{message.length}/500</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        text={isSubmitting ? "Submitting..." : "Submit Feedback"}
                        textStyles={styles.submitButtonText}
                        buttonStyles={{
                            ...styles.submitButton,
                            ...(isFormValid && !isSubmitting ? styles.submitButtonActive : styles.submitButtonInactive)
                        }}
                        onPress={handleSubmit}
                    />
                    <Button
                        text="Cancel"
                        textStyles={styles.cancelButtonText}
                        buttonStyles={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

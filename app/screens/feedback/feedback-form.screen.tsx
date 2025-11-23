"use client"

import { useState } from "react"
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
import { reviewsService } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"

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

    const [rating, setRating] = useState(0)
    const [category, setCategory] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isFormValid = rating > 0 && category && title.trim() && message.trim()

    const handleSubmit = async () => {
        if (!isFormValid) {
            Alert.alert("Please fill all fields", "All fields are required")
            return
        }

        if (!carId) {
            Alert.alert("Error", "Car information is missing. Please try again.")
            return
        }

        if (!user?.id) {
            Alert.alert("Error", "Please login to submit feedback")
            return
        }

        setIsSubmitting(true)
        try {
            // Combine title, message, and category into comment
            const comment = `${title}\n\n${message}\n\nCategory: ${category}`

            const { data, error } = await reviewsService.createFeedback({
                carId: carId,
                customerId: user.id,
                rating: rating,
                comment: comment,
                content: message, // Some APIs might use 'content' instead of 'comment'
            })

            if (error) {
                Alert.alert("Error", error.message || "Failed to submit feedback. Please try again.")
                return
            }

            Alert.alert("Success", "Thank you for your feedback!", [
                {
                    text: "OK",
                    onPress: () => {
                        navigation.goBack()
                    },
                },
            ])
        } catch (error) {
            console.error("Feedback submission error:", error)
            Alert.alert("Error", "Failed to submit feedback. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStarRating = () => {
        return (
            <View style={{ flexDirection: "row", gap: scale(8) }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                        key={star}
                        onPress={() => setRating(star)}
                        style={{
                            padding: scale(8),
                        }}
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
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: scale(16), paddingBottom: verticalScale(24) }}
            >
                {/* Title */}
                <Text
                    style={{
                        fontSize: scale(20),
                        fontWeight: "700",
                        color: colors.primary,
                        marginBottom: verticalScale(8),
                    }}
                >
                    Send us Your Feedback
                </Text>
                <Text
                    style={{
                        fontSize: scale(13),
                        color: colors.placeholder,
                        marginBottom: verticalScale(24),
                        lineHeight: scale(18),
                    }}
                >
                    We value your feedback and would love to hear about your experience with us.
                </Text>

                {/* Rating Section */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: scale(12),
                        padding: scale(16),
                        marginBottom: verticalScale(16),
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: verticalScale(12),
                        }}
                    >
                        <Icon
                            name="star"
                            size={scale(18)}
                            color={colors.morentBlue}
                            style={{ marginRight: scale(8) }}
                        />
                        <Text
                            style={{
                                fontSize: scale(14),
                                fontWeight: "600",
                                color: colors.primary,
                            }}
                        >
                            How would you rate us?
                        </Text>
                        <Text
                            style={{
                                fontSize: scale(12),
                                color: colors.destructive,
                                marginLeft: scale(4),
                            }}
                        >
                            *
                        </Text>
                    </View>
                    {renderStarRating()}
                    {rating > 0 && (
                        <Text
                            style={{
                                fontSize: scale(12),
                                color: colors.morentBlue,
                                marginTop: verticalScale(8),
                                fontWeight: "600",
                            }}
                        >
                            Rating: {rating} out of 5
                        </Text>
                    )}
                </View>

                {/* Category Section */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: scale(12),
                        padding: scale(16),
                        marginBottom: verticalScale(16),
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: verticalScale(12),
                        }}
                    >
                        <Icon
                            name="category"
                            size={scale(18)}
                            color={colors.morentBlue}
                            style={{ marginRight: scale(8) }}
                        />
                        <Text
                            style={{
                                fontSize: scale(14),
                                fontWeight: "600",
                                color: colors.primary,
                            }}
                        >
                            Feedback Category
                        </Text>
                        <Text
                            style={{
                                fontSize: scale(12),
                                color: colors.destructive,
                                marginLeft: scale(4),
                            }}
                        >
                            *
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: scale(8),
                        }}
                    >
                        {FEEDBACK_CATEGORIES.map((cat) => (
                            <Pressable
                                key={cat}
                                onPress={() => setCategory(cat)}
                                style={{
                                    paddingHorizontal: scale(12),
                                    paddingVertical: scale(8),
                                    borderRadius: scale(20),
                                    backgroundColor:
                                        category === cat ? colors.morentBlue : colors.background,
                                    borderWidth: 1,
                                    borderColor:
                                        category === cat ? colors.morentBlue : colors.border,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: scale(12),
                                        fontWeight: "600",
                                        color: category === cat ? colors.white : colors.primary,
                                    }}
                                >
                                    {cat}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Title Input */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: scale(12),
                        padding: scale(16),
                        marginBottom: verticalScale(16),
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: verticalScale(8),
                        }}
                    >
                        <Text
                            style={{
                                fontSize: scale(14),
                                fontWeight: "600",
                                color: colors.primary,
                            }}
                        >
                            Feedback Title
                        </Text>
                        <Text
                            style={{
                                fontSize: scale(12),
                                color: colors.destructive,
                                marginLeft: scale(4),
                            }}
                        >
                            *
                        </Text>
                    </View>
                    <TextInput
                        style={{
                            borderRadius: scale(8),
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: scale(12),
                            paddingVertical: verticalScale(10),
                            fontSize: scale(13),
                            color: colors.primary,
                            backgroundColor: colors.background,
                        }}
                        placeholder="Enter feedback title"
                        placeholderTextColor={colors.placeholder}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                    <Text
                        style={{
                            fontSize: scale(10),
                            color: colors.placeholder,
                            marginTop: verticalScale(4),
                            textAlign: "right",
                        }}
                    >
                        {title.length}/100
                    </Text>
                </View>

                {/* Message Input */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: scale(12),
                        padding: scale(16),
                        marginBottom: verticalScale(24),
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            marginBottom: verticalScale(8),
                        }}
                    >
                        <Text
                            style={{
                                fontSize: scale(14),
                                fontWeight: "600",
                                color: colors.primary,
                            }}
                        >
                            Your Message
                        </Text>
                        <Text
                            style={{
                                fontSize: scale(12),
                                color: colors.destructive,
                                marginLeft: scale(4),
                            }}
                        >
                            *
                        </Text>
                    </View>
                    <TextInput
                        style={{
                            borderRadius: scale(8),
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: scale(12),
                            paddingVertical: verticalScale(10),
                            fontSize: scale(13),
                            color: colors.primary,
                            backgroundColor: colors.background,
                            minHeight: scale(120),
                            textAlignVertical: "top",
                        }}
                        placeholder="Please share your detailed feedback here..."
                        placeholderTextColor={colors.placeholder}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={500}
                    />
                    <Text
                        style={{
                            fontSize: scale(10),
                            color: colors.placeholder,
                            marginTop: verticalScale(4),
                            textAlign: "right",
                        }}
                    >
                        {message.length}/500
                    </Text>
                </View>

                {/* Buttons */}
                <View style={{ gap: scale(12) }}>
                    <Button
                        text={isSubmitting ? "Submitting..." : "Submit Feedback"}
                        textStyles={{ color: colors.white, fontSize: scale(14) }}
                        buttonStyles={{
                            backgroundColor: isFormValid && !isSubmitting ? colors.morentBlue : colors.border,
                            paddingVertical: verticalScale(12),
                            borderRadius: scale(8),
                        }}
                        onPress={handleSubmit}
                    />
                    <Button
                        text="Cancel"
                        textStyles={{
                            color: colors.morentBlue,
                            fontSize: scale(14),
                            fontWeight: "600",
                        }}
                        buttonStyles={{
                            backgroundColor: colors.background,
                            paddingVertical: verticalScale(12),
                            borderRadius: scale(8),
                            borderWidth: 2,
                            borderColor: colors.morentBlue,
                        }}
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

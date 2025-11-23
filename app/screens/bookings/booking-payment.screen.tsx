"use client"

import { useState, useEffect } from "react"
import { View, Text, Pressable, Alert, ScrollView, ActivityIndicator, Image } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { bookingsService, paymentService } from "../../../lib/api"
import Header from "../../components/Header/Header"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

export default function BookingPaymentScreen() {
    const route = useRoute<RouteProp<{ params: { bookingId: string; paymentMethod: string; amount: number } }, "params">>()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

    const { bookingId, paymentMethod, amount } = (route.params as any) || {}

    const [loading, setLoading] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")

    useEffect(() => {
        if (paymentMethod === "qr-payos") {
            createPayOSPayment()
        }
    }, [paymentMethod])

    const createPayOSPayment = async () => {
        setLoading(true)
        try {

            const { data, error } = await paymentService.createPayOSPayment({
                amount: amount,
                description: `Payment for booking ${bookingId}`,
                returnUrl: "morent://payment-success",
                cancelUrl: "morent://payment-cancel",
                bookingId: bookingId,
            })

            if (error) {
                Alert.alert("Error", "Failed to create payment. Please try again.")
                setPaymentStatus("failed")
                return
            }

            if (data && data.qrCode) {
                setQrCodeUrl(data.qrCode)

                pollPaymentStatus(data.orderCode)
            }
        } catch (err: any) {
            console.error("Payment creation error:", err)
            Alert.alert("Error", err.message || "Failed to create payment")
            setPaymentStatus("failed")
        } finally {
            setLoading(false)
        }
    }

    const pollPaymentStatus = async (orderCode: string) => {

        const interval = setInterval(async () => {
            try {
                const { data } = await paymentService.getPayOSPayment(orderCode)

                if (data && data.status === "PAID") {
                    clearInterval(interval)
                    setPaymentStatus("success")

                    await updateBookingStatus("paid")
                    Alert.alert("Success", "Payment completed successfully!", [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate("BookingDetail" as any, { id: bookingId })
                        }
                    ])
                } else if (data && data.status === "CANCELLED") {
                    clearInterval(interval)
                    setPaymentStatus("failed")
                    Alert.alert("Payment Cancelled", "Your payment was cancelled.")
                }
            } catch (err) {
                console.log("Polling error:", err)
            }
        }, 3000)

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(interval), 300000)
    }

    const handleCashPayment = async () => {
        setLoading(true)
        try {

            await updateBookingStatus("pending_payment")

            Alert.alert(
                "Booking Confirmed",
                "Your booking has been confirmed. Please pay cash when picking up the car.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("BookingDetail" as any, { id: bookingId })
                    }
                ]
            )
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to confirm booking")
        } finally {
            setLoading(false)
        }
    }

    const updateBookingStatus = async (status: "upcoming" | "completed" | "cancelled" | "pending_payment" | "paid") => {
        try {
            await bookingsService.updateBooking({
                id: bookingId,
                status: status,
                paymentMethod: paymentMethod as "cash" | "qr-payos",
            })
        } catch (err) {
            console.error("Failed to update booking status:", err)
        }
    }

    const handleCancel = () => {
        Alert.alert(
            "Cancel Payment",
            "Are you sure you want to cancel this payment?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => {
                        navigation.goBack()
                    }
                }
            ]
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: colors.primary, marginBottom: 8 }}>
                    Payment
                </Text>

                <Text style={{ fontSize: 14, color: colors.placeholder, marginBottom: 24 }}>
                    Complete your payment to confirm the booking
                </Text>

                {/* Payment Method Card */}
                <View style={{
                    backgroundColor: colors.white,
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 24
                }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text style={{ fontSize: 14, color: colors.placeholder }}>Payment Method</Text>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                            {paymentMethod === "cash" ? "Cash" : "QR PayOS"}
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text style={{ fontSize: 14, color: colors.placeholder }}>Booking ID</Text>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                            {bookingId?.substring(0, 8)}...
                        </Text>
                    </View>

                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.border
                    }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>Total Amount</Text>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.morentBlue }}>
                            {amount} VND
                        </Text>
                    </View>
                </View>

                {/* Cash Payment */}
                {paymentMethod === "cash" && (
                    <View style={{
                        backgroundColor: colors.white,
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 24,
                        alignItems: "center"
                    }}>
                        <MaterialIcons name="payments" size={64} color={colors.morentBlue} />
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: colors.primary,
                            marginTop: 16,
                            marginBottom: 8,
                            textAlign: "center"
                        }}>
                            Cash Payment
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            color: colors.placeholder,
                            textAlign: "center",
                            marginBottom: 24
                        }}>
                            You will pay cash when picking up the car. Please bring the exact amount or card for payment.
                        </Text>

                        <Pressable
                            onPress={handleCashPayment}
                            disabled={loading}
                            style={{
                                backgroundColor: colors.morentBlue,
                                paddingVertical: 14,
                                paddingHorizontal: 32,
                                borderRadius: 8,
                                width: "100%",
                                alignItems: "center"
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={{ color: colors.white, fontSize: 16, fontWeight: "600" }}>
                                    Confirm Booking
                                </Text>
                            )}
                        </Pressable>
                    </View>
                )}

                {/* PayOS QR Code */}
                {paymentMethod === "qr-payos" && (
                    <View style={{
                        backgroundColor: colors.white,
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 24,
                        alignItems: "center"
                    }}>
                        {loading ? (
                            <>
                                <ActivityIndicator size="large" color={colors.morentBlue} />
                                <Text style={{ marginTop: 16, color: colors.placeholder }}>
                                    Generating QR code...
                                </Text>
                            </>
                        ) : qrCodeUrl ? (
                            <>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    color: colors.primary,
                                    marginBottom: 16
                                }}>
                                    Scan QR Code to Pay
                                </Text>

                                <Image
                                    source={{ uri: qrCodeUrl }}
                                    style={{
                                        width: 250,
                                        height: 250,
                                        marginBottom: 16
                                    }}
                                />

                                <Text style={{
                                    fontSize: 14,
                                    color: colors.placeholder,
                                    textAlign: "center",
                                    marginBottom: 8
                                }}>
                                    Scan this QR code with your banking app
                                </Text>

                                {paymentStatus === "pending" && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginTop: 16
                                    }}>
                                        <ActivityIndicator size="small" color={colors.morentBlue} />
                                        <Text style={{ marginLeft: 8, color: colors.placeholder }}>
                                            Waiting for payment...
                                        </Text>
                                    </View>
                                )}

                                {paymentStatus === "success" && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginTop: 16,
                                        backgroundColor: "#00B050",
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 6
                                    }}>
                                        <MaterialIcons name="check-circle" size={20} color={colors.white} />
                                        <Text style={{ marginLeft: 8, color: colors.white, fontWeight: "600" }}>
                                            Payment Successful!
                                        </Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text style={{ color: colors.placeholder }}>
                                Failed to generate QR code
                            </Text>
                        )}
                    </View>
                )}

                {/* Cancel Button */}
                <Pressable
                    onPress={handleCancel}
                    style={{
                        borderWidth: 2,
                        borderColor: colors.morentBlue,
                        paddingVertical: 14,
                        borderRadius: 8,
                        alignItems: "center"
                    }}
                >
                    <Text style={{ color: colors.morentBlue, fontSize: 16, fontWeight: "600" }}>
                        Cancel
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}

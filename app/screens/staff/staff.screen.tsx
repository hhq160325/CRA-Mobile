"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, RefreshControl } from "react-native"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import { bookingsService } from "../../../lib/api/services/bookings.service"
import { carsService } from "../../../lib/api/services/cars.service"
import { userService } from "../../../lib/api/services/user.service"
import { invoiceService } from "../../../lib/api/services/invoice.service"
import { paymentService } from "../../../lib/api/services/payment.service"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"

type PaymentStatus = "all" | "successfully" | "pending" | "cancelled"

interface BookingItem {
    id: string
    carId: string
    carName: string
    carBrand: string
    carModel: string
    carLicensePlate: string
    carImage: string
    customerName: string
    userId: string
    invoiceId: string
    amount: number
    invoiceStatus: string
    status: string
    date: string
}

export default function StaffScreen() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [bookings, setBookings] = useState<BookingItem[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [processingPayment, setProcessingPayment] = useState<string | null>(null)

    // Fetch bookings from API
    const fetchBookings = async () => {
        setLoading(true)
        setError(null)

        const result = await bookingsService.getAllBookings()

        if (result.error) {
            console.error("Error fetching bookings:", result.error)
            setError(result.error.message)
            setLoading(false)
            return
        }

        console.log(`Fetched ${result.data?.length || 0} bookings from API`)
        if (result.data && result.data.length > 0) {
            console.log("Sample booking data:", result.data[0])
        }

        if (result.data) {
            // Fetch car details for each booking
            const mappedBookingsPromises = result.data.map(async (booking) => {
                // Map status: "completed"/"Confirmed" -> "successfully", "upcoming" -> "pending"
                let mappedStatus = "pending"
                const statusLower = booking.status.toLowerCase()

                if (statusLower === "completed" || statusLower === "confirmed") {
                    mappedStatus = "successfully"
                } else if (statusLower === "cancelled" || statusLower === "canceled") {
                    mappedStatus = "cancelled"
                }

                console.log(`Booking ${booking.id}: status="${booking.status}" -> mapped="${mappedStatus}"`)

                // Format date
                const bookingDate = new Date(booking.bookingDate)
                const formattedDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString('en', { month: 'short' })}`

                // Fetch car details using carId
                let carName = "Unknown Car"
                let carBrand = ""
                let carModel = ""
                let carLicensePlate = ""
                let carImage = ""

                if (booking.carId) {
                    try {
                        console.log(`🚗 Fetching car details for carId: ${booking.carId}`)
                        const carResult = await carsService.getCarById(booking.carId)
                        if (carResult.error) {
                            console.error(`❌ Error fetching car ${booking.carId}:`, carResult.error.message)
                        }
                        if (carResult.data) {
                            carName = carResult.data.name || "Unknown Car"
                            carBrand = carResult.data.brand || ""
                            carModel = carResult.data.model || ""
                            carLicensePlate = carResult.data.licensePlate || ""
                            carImage = carResult.data.image || ""
                            console.log(`✅ Car fetched: ${carName}, Model: ${carModel}, License: ${carLicensePlate}`)
                        } else {
                            console.warn(`⚠️ No car data returned for carId: ${booking.carId}`)
                        }
                    } catch (err) {
                        console.error(`💥 Exception fetching car ${booking.carId}:`, err)
                    }
                } else {
                    console.warn(`⚠️ No carId in booking ${booking.id}`)
                }

                // Fetch user details using userId
                let customerName = "Customer"
                if (booking.userId) {
                    try {
                        console.log(`👤 Fetching user details for userId: ${booking.userId}`)
                        const userResult = await userService.getUserById(booking.userId)
                        if (userResult.error) {
                            console.error(`❌ Error fetching user ${booking.userId}:`, userResult.error.message)
                        }
                        if (userResult.data) {
                            customerName = userResult.data.fullname || userResult.data.username || "Customer"
                            console.log(`✅ Customer fetched: ${customerName}`)
                        } else {
                            console.warn(`⚠️ No user data returned for userId: ${booking.userId}`)
                        }
                    } catch (err) {
                        console.error(`💥 Exception fetching user ${booking.userId}:`, err)
                    }
                } else {
                    console.warn(`⚠️ No userId in booking ${booking.id}`)
                }

                // Fetch invoice details using invoiceId
                let invoiceAmount = 0
                let invoiceStatus = "pending"

                if (booking.invoiceId) {
                    try {
                        console.log(`💰 Fetching invoice details for invoiceId: ${booking.invoiceId}`)
                        const invoiceResult = await invoiceService.getInvoiceById(booking.invoiceId)
                        if (invoiceResult.error) {
                            console.error(`❌ Error fetching invoice ${booking.invoiceId}:`, invoiceResult.error.message)
                        }
                        if (invoiceResult.data) {
                            invoiceAmount = invoiceResult.data.amount || 0
                            invoiceStatus = invoiceResult.data.status?.toLowerCase() || "pending"
                            console.log(`✅ Invoice fetched: Amount: ${invoiceAmount}, Status: ${invoiceStatus}`)
                        } else {
                            console.warn(`⚠️ No invoice data returned for invoiceId: ${booking.invoiceId}`)
                        }
                    } catch (err) {
                        console.error(`💥 Exception fetching invoice ${booking.invoiceId}:`, err)
                    }
                } else {
                    console.warn(`⚠️ No invoiceId in booking ${booking.id}`)
                }

                // If invoice amount is 0, try to get it from booking.totalPrice
                if (invoiceAmount === 0 && booking.totalPrice > 0) {
                    console.log(`Using booking.totalPrice as fallback: ${booking.totalPrice}`)
                    invoiceAmount = booking.totalPrice
                }

                // Update invoice status based on booking status if payment is confirmed
                if (mappedStatus === "successfully" && invoiceStatus === "pending") {
                    console.log(`Booking is confirmed, updating invoice status to paid`)
                    invoiceStatus = "paid"
                }

                return {
                    id: booking.id,
                    carId: booking.carId,
                    carName: carName,
                    carBrand: carBrand,
                    carModel: carModel,
                    carLicensePlate: carLicensePlate,
                    carImage: carImage,
                    customerName: customerName,
                    userId: booking.userId,
                    invoiceId: booking.invoiceId,
                    amount: invoiceAmount,
                    invoiceStatus: invoiceStatus,
                    status: mappedStatus,
                    date: formattedDate,
                }
            })

            const mappedBookings = await Promise.all(mappedBookingsPromises)
            console.log(`📊 Final mapped bookings count: ${mappedBookings.length}`)
            setBookings(mappedBookings)
        }

        setLoading(false)
        setRefreshing(false)
    }

    // Initial load
    useEffect(() => {
        fetchBookings()
    }, [])

    // Refresh when screen comes into focus (after returning from payment)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("📱 Staff screen focused, refreshing bookings...")
            fetchBookings()
        })

        return unsubscribe
    }, [navigation])

    // Pull to refresh handler
    const onRefresh = () => {
        setRefreshing(true)
        fetchBookings()
    }

    // Handle Request Payment button click
    const handleRequestPayment = async (bookingId: string) => {
        try {
            setProcessingPayment(bookingId)
            console.log(`💳 Requesting payment for booking: ${bookingId}`)

            // Call the CreateRentalPayment API
            const result = await paymentService.createRentalPayment(bookingId)

            if (result.error) {
                console.error(`❌ Error creating rental payment:`, result.error.message)
                alert(`Failed to create payment: ${result.error.message}`)
                setProcessingPayment(null)
                return
            }

            if (result.data && result.data.checkoutUrl) {
                console.log(`✅ Payment created successfully`)
                console.log(`Order Code: ${result.data.orderCode}`)
                console.log(`Checkout URL: ${result.data.checkoutUrl}`)

                // Navigate to PayOS WebView with the checkout URL
                navigation.navigate("PayOSWebView" as any, {
                    paymentUrl: result.data.checkoutUrl,
                    bookingId: bookingId,
                    returnScreen: "StaffScreen", // Return to staff screen after payment
                })
            } else {
                console.error(`❌ No checkout URL in response`)
                alert("Failed to create payment: No checkout URL received")
            }

            setProcessingPayment(null)
        } catch (error) {
            console.error(`💥 Exception in handleRequestPayment:`, error)
            alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
            setProcessingPayment(null)
        }
    }

    // Filter bookings by status and search query
    const filteredPayments = bookings.filter((payment) => {
        const matchesStatus = statusFilter === "all" || payment.status === statusFilter
        const matchesSearch =
            payment.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const renderPaymentCard = ({ item }: { item: BookingItem }) => {
        return (
            <Pressable
                style={{
                    backgroundColor: "white",
                    borderRadius: scale(12),
                    padding: scale(16),
                    marginBottom: verticalScale(12),
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(12) }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(18), fontWeight: "bold", color: colors.primary, marginBottom: verticalScale(4) }}>
                            {item.carName}
                        </Text>
                        {item.carLicensePlate && (
                            <Text style={{ fontSize: scale(12), color: "#6b7280", marginBottom: verticalScale(4) }}>
                                License: {item.carLicensePlate}
                            </Text>
                        )}
                        <Text style={{ fontSize: scale(12), color: "#6b7280" }}>Booking ID: {item.id.substring(0, 8)}...</Text>
                    </View>
                    <View
                        style={{
                            backgroundColor:
                                item.status === "successfully" ? "#d1fae5" :
                                    item.status === "cancelled" ? "#fee2e2" :
                                        "#fef3c7",
                            paddingHorizontal: scale(12),
                            paddingVertical: verticalScale(6),
                            borderRadius: scale(16),
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: scale(12),
                                fontWeight: "600",
                                color:
                                    item.status === "successfully" ? "#059669" :
                                        item.status === "cancelled" ? "#991b1b" :
                                            "#d97706",
                            }}
                        >
                            {item.status === "successfully" ? "Successful" :
                                item.status === "cancelled" ? "Cancelled" :
                                    "Pending"}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingBottom: verticalScale(12),
                        borderBottomWidth: 1,
                        borderBottomColor: "#e5e7eb",
                        marginBottom: verticalScale(12),
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
                            CUSTOMER
                        </Text>
                        <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>{item.customerName}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
                            AMOUNT
                        </Text>
                        <Text style={{ fontSize: scale(13), fontWeight: "bold", color: colors.primary }}>
                            ${item.amount.toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
                            DATE
                        </Text>
                        <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>{item.date}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    {item.status === "pending" ? (
                        <Pressable
                            onPress={() => handleRequestPayment(item.id)}
                            disabled={processingPayment === item.id}
                            style={{
                                backgroundColor: processingPayment === item.id ? "#9ca3af" : colors.morentBlue,
                                paddingHorizontal: scale(16),
                                paddingVertical: scale(8),
                                borderRadius: scale(8),
                                opacity: processingPayment === item.id ? 0.6 : 1,
                            }}
                        >
                            {processingPayment === item.id ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.white }}>
                                    Request Payment
                                </Text>
                            )}
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={() => navigation.navigate("PickupReturnConfirm" as any, { bookingId: item.id })}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flex: 1,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: scale(13),
                                    fontWeight: "600",
                                    color: colors.primary
                                }}
                            >
                                → Tap to confirm pickup
                            </Text>
                            <Text style={{ fontSize: scale(20) }}>→</Text>
                        </Pressable>
                    )}
                </View>
            </Pressable>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
            <Header />

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: verticalScale(16), fontSize: scale(14), color: "#6b7280" }}>
                        Loading bookings...
                    </Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: scale(32) }}>
                    <Text style={{ fontSize: scale(16), color: "#ef4444", textAlign: "center", marginBottom: verticalScale(16) }}>
                        Error loading bookings
                    </Text>
                    <Text style={{ fontSize: scale(14), color: "#6b7280", textAlign: "center" }}>
                        {error}
                    </Text>
                </View>
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={filteredPayments}
                    renderItem={renderPaymentCard}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: scale(16), paddingBottom: verticalScale(100) }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListHeaderComponent={
                        <>
                            {/* Search Bar */}
                            <View
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: scale(8),
                                    paddingHorizontal: scale(12),
                                    marginBottom: verticalScale(16),
                                    borderWidth: 1,
                                    borderColor: "#e5e7eb",
                                }}
                            >
                                <TextInput
                                    placeholder="Search by car name, customer, or payment ID..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    style={{ height: verticalScale(44), fontSize: scale(14) }}
                                />
                            </View>

                            {/* Status Filter Tabs */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    backgroundColor: "white",
                                    padding: scale(12),
                                    borderRadius: scale(8),
                                    marginBottom: verticalScale(16),
                                    gap: scale(8),
                                }}
                            >
                                {(["all", "successfully", "pending", "cancelled"] as PaymentStatus[]).map((status) => (
                                    <Pressable
                                        key={status}
                                        onPress={() => setStatusFilter(status)}
                                        style={{
                                            flex: 1,
                                            paddingVertical: verticalScale(8),
                                            paddingHorizontal: scale(12),
                                            borderRadius: scale(20),
                                            backgroundColor: statusFilter === status ? colors.primary : "#f3f4f6",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: scale(12),
                                                fontWeight: "600",
                                                color: statusFilter === status ? "white" : "#6b7280",
                                                textAlign: "center",
                                            }}
                                        >
                                            {status === "all" ? "All" :
                                                status === "successfully" ? "Success" :
                                                    status === "pending" ? "Pending" :
                                                        "Cancelled"}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    }
                    ListEmptyComponent={
                        <View style={{ padding: scale(32), alignItems: "center" }}>
                            <Text style={{ fontSize: scale(16), color: "#6b7280" }}>No payments found</Text>
                        </View>
                    }
                />
            )}
        </View>
    )
}

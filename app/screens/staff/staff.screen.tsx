"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import { useAuth } from "../../../lib/auth-context"
import { confirmationService } from "../../../lib/api"

// Mock payment data
const mockPayments = [
    {
        id: "PAY001",
        bookingId: "BK001",
        carName: "Koenigsegg",
        carType: "Sport",
        customerName: "John Doe",
        amount: 450,
        status: "successfully",
        date: new Date("2024-01-15"),
        pickupTime: "10:00 AM",
        pickupLocation: "Downtown Office",
        pickupDate: "2025-11-23T10:00:00.000Z",
        dropoffLocation: "Airport Terminal 2",
        dropoffDate: "2025-11-25T16:00:00.000Z",
        dropoffTime: "04:00 PM",
        returnTime: null,
        pickupImage: null,
        returnImage: null,
    },
    {
        id: "PAY002",
        bookingId: "BK002",
        carName: "Nissan GT-R",
        carType: "Sport",
        customerName: "Jane Smith",
        amount: 320,
        status: "successfully",
        date: new Date("2024-01-16"),
        pickupTime: "02:00 PM",
        pickupLocation: "City Center Mall",
        pickupDate: "2025-11-24T14:00:00.000Z",
        dropoffLocation: "Hotel Grand Plaza",
        dropoffDate: "2025-11-26T18:00:00.000Z",
        dropoffTime: "06:00 PM",
        returnTime: null,
        pickupImage: null,
        returnImage: null,
    },
    {
        id: "PAY003",
        bookingId: "BK003",
        carName: "All New Rush",
        carType: "SUV",
        customerName: "Mike Johnson",
        amount: 280,
        status: "pending",
        date: new Date("2024-01-17"),
        pickupTime: null,
        pickupLocation: "North Station",
        pickupDate: "2025-11-25T09:00:00.000Z",
        dropoffLocation: "South Terminal",
        dropoffDate: "2025-11-27T17:00:00.000Z",
        dropoffTime: "05:00 PM",
        returnTime: null,
        pickupImage: null,
        returnImage: null,
    },
    {
        id: "PAY004",
        bookingId: "BK004",
        carName: "CR-V",
        carType: "SUV",
        customerName: "Sarah Williams",
        amount: 390,
        status: "successfully",
        date: new Date("2024-01-14"),
        pickupTime: "09:30 AM",
        pickupLocation: "Main Office",
        pickupDate: "2025-11-22T09:30:00.000Z",
        dropoffLocation: "Main Office",
        dropoffDate: "2025-11-24T16:30:00.000Z",
        dropoffTime: "04:30 PM",
        returnTime: "04:30 PM",
        pickupImage: "image1",
        returnImage: "image2",
    },
    {
        id: "PAY005",
        bookingId: "BK005",
        carName: "All New Terios",
        carType: "SUV",
        customerName: "Emily Brown",
        amount: 360,
        status: "successfully",
        date: new Date("2024-01-18"),
        pickupTime: "11:00 AM",
        pickupLocation: "Beach Resort",
        pickupDate: "2025-11-26T11:00:00.000Z",
        dropoffLocation: "Mountain Lodge",
        dropoffDate: "2025-11-28T15:00:00.000Z",
        dropoffTime: "03:00 PM",
        returnTime: null,
        pickupImage: null,
        returnImage: null,
    },
]

type PaymentStatus = "all" | "successfully" | "pending"

export default function StaffScreen() {
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [refreshKey, setRefreshKey] = useState(0)
    const [realBookings, setRealBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const navigation = useNavigation()

    // Redirect if not staff
    useEffect(() => {
        if (user && user.role !== "staff") {
            console.log("Non-staff user trying to access staff screen, redirecting...")
                ; (navigation as any).navigate("Home")
        }
    }, [user, navigation])

    // Fetch real bookings and invoices from API
    useEffect(() => {
        fetchBookingsWithPayments()
    }, [])

    const fetchBookingsWithPayments = async () => {
        setLoading(true)
        try {
            const { bookingsService, paymentService } = require("../../../lib/api")

            // Fetch all bookings
            const { data: bookings, error: bookingsError } = await bookingsService.getAllBookings()

            if (bookingsError) {
                console.log("Staff: Error fetching bookings:", bookingsError)
                setRealBookings([])
                setLoading(false)
                return
            }

            if (!bookings || bookings.length === 0) {
                console.log("Staff: No bookings found")
                setRealBookings([])
                setLoading(false)
                return
            }

            console.log("Staff: Fetched bookings:", bookings.length)

            // Try to fetch all invoices to get payment information
            let invoices = null
            try {
                const { data: invoiceData, error: invoicesError } = await paymentService.getAllInvoices()

                if (invoicesError) {
                    console.log("Staff: Error fetching invoices (will use booking data only):", invoicesError.message)
                } else {
                    invoices = invoiceData
                    console.log("Staff: Fetched invoices:", invoices?.length || 0)
                }
            } catch (err) {
                console.log("Staff: Exception fetching invoices (will use booking data only):", err)
            }

            // Create a map of bookingId -> invoice for quick lookup
            const invoiceMap = new Map()
            if (invoices && invoices.length > 0) {
                invoices.forEach((invoice: any) => {
                    if (invoice.bookingId) {
                        invoiceMap.set(invoice.bookingId, invoice)
                    }
                })
            }

            // Transform bookings with payment/invoice data
            const transformedBookings = await Promise.all(
                bookings.map(async (booking: any) => {
                    const invoice = invoiceMap.get(booking.id)

                    // Determine payment status
                    // If we have invoice data, use it; otherwise use booking status
                    let paymentStatus = "pending"
                    if (invoice) {
                        if (invoice.status === "paid" || invoice.status === "completed") {
                            paymentStatus = "successfully"
                        }
                    } else {
                        // Fallback: use booking status
                        if (booking.status === "completed") {
                            paymentStatus = "successfully"
                        }
                    }

                    // Fetch customer name if available
                    let customerName = "Unknown Customer"
                    if (booking.userId) {
                        try {
                            const { data: user } = await paymentService.getUserById(booking.userId)
                            if (user) {
                                customerName = user.name || user.email || "Unknown Customer"
                            }
                        } catch (err) {
                            console.log("Staff: Error fetching user:", err)
                        }
                    }

                    return {
                        id: invoice?.id || booking.id, // Use invoice ID as payment ID
                        bookingId: booking.id,
                        carName: booking.carName || "Unknown Car",
                        carType: booking.carType || "Standard",
                        customerName: customerName,
                        amount: invoice?.amount || booking.totalPrice || 0,
                        status: paymentStatus,
                        date: new Date(booking.startDate || booking.pickupTime),
                        pickupTime: new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        pickupLocation: booking.pickupLocation,
                        pickupDate: booking.startDate,
                        dropoffLocation: booking.dropoffLocation,
                        dropoffDate: booking.endDate,
                        dropoffTime: new Date(booking.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        returnTime: null,
                        pickupImage: null,
                        returnImage: null,
                    }
                })
            )

            console.log("Staff: Transformed bookings with payments:", transformedBookings.length)
            setRealBookings(transformedBookings)
        } catch (err) {
            console.error("Staff: Exception fetching data:", err)
            setRealBookings([])
        } finally {
            setLoading(false)
        }
    }

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setRefreshKey(prev => prev + 1)
            fetchBookingsWithPayments() // Refresh bookings with payments when screen is focused
        }, [])
    )

    // Use real bookings if available, fallback to mock data
    const paymentsToUse = realBookings.length > 0 ? realBookings : mockPayments

    const filteredPayments = paymentsToUse.filter((payment) => {
        const matchesStatus = statusFilter === "all" || payment.status === statusFilter
        const matchesSearch =
            payment.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const formatDate = (date: Date) => {
        return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`
    }

    const handleConfirmPickupReturn = (payment: typeof mockPayments[0]) => {
        const confirmation = confirmationService.getConfirmation(payment.id)
        const isFullyConfirmed = confirmation.pickupConfirmed && confirmation.returnConfirmed

        if (isFullyConfirmed) {
            // Already confirmed, don't navigate
            return
        }

        // Navigate with full booking information
        ; (navigation as any).navigate("PickupReturnConfirm", {
            paymentId: payment.id,
            bookingId: payment.bookingId,
            carName: payment.carName,
            carType: payment.carType,
            customerName: payment.customerName,
            pickupLocation: payment.pickupLocation,
            pickupDate: payment.pickupDate,
            pickupTime: payment.pickupTime,
            dropoffLocation: payment.dropoffLocation,
            dropoffDate: payment.dropoffDate,
            dropoffTime: payment.dropoffTime,
        })
    }

    const renderPaymentCard = ({ item }: { item: typeof mockPayments[0] }) => {
        const confirmation = confirmationService.getConfirmation(item.id)
        const isFullyConfirmed = confirmation.pickupConfirmed && confirmation.returnConfirmed

        return (
            <Pressable
                onPress={() => {
                    if (item.status === "successfully") {
                        handleConfirmPickupReturn(item)
                    }
                }}
                disabled={isFullyConfirmed}
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
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: verticalScale(8) }}>
                            <Text style={{ fontSize: scale(18), fontWeight: "bold", color: colors.primary }}>{item.carName}</Text>
                            <View
                                style={{
                                    backgroundColor: "#f3f4f6",
                                    paddingHorizontal: scale(12),
                                    paddingVertical: verticalScale(4),
                                    borderRadius: scale(12),
                                    marginLeft: scale(8),
                                }}
                            >
                                <Text style={{ fontSize: scale(12), color: "#6b7280" }}>{item.carType}</Text>
                            </View>
                        </View>
                        <Text style={{ fontSize: scale(12), color: "#6b7280" }}>Payment ID: {item.id}</Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: item.status === "successfully" ? "#d1fae5" : "#fef3c7",
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
                                color: item.status === "successfully" ? "#059669" : "#d97706",
                            }}
                        >
                            {item.status === "successfully" ? "Successful" : "Pending"}
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
                        <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>{formatDate(item.date)}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    {(() => {
                        const confirmation = confirmationService.getConfirmation(item.id)
                        const isFullyConfirmed = confirmation.pickupConfirmed && confirmation.returnConfirmed
                        const isPickupOnly = confirmation.pickupConfirmed && !confirmation.returnConfirmed

                        return (
                            <>
                                <Text
                                    style={{
                                        fontSize: scale(13),
                                        fontWeight: "600",
                                        color: isFullyConfirmed ? "#00B050" : isPickupOnly ? "#FF9500" : colors.primary
                                    }}
                                >
                                    {item.status === "successfully"
                                        ? isFullyConfirmed
                                            ? "✓ Pickup & Return Confirmed"
                                            : isPickupOnly
                                                ? "✓ Pickup Done → Tap to confirm return"
                                                : "→ Tap to confirm pickup"
                                        : "Awaiting payment confirmation"}
                                </Text>
                                {item.status === "successfully" && !isFullyConfirmed && (
                                    <Text style={{ fontSize: scale(20) }}>→</Text>
                                )}
                            </>
                        )
                    })()}
                </View>
            </Pressable>
        )
    }

    // Show loading indicator
    if (loading && realBookings.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
                <Header />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: scale(14), color: colors.placeholder }}>Loading bookings...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
            <Header />

            <View style={{ paddingHorizontal: scale(16), paddingTop: scale(8), marginBottom: verticalScale(8) }}>
                <Text style={{ fontSize: scale(24), fontWeight: "bold", color: colors.primary }}>
                    Staff Dashboard
                </Text>
                <Text style={{ fontSize: scale(12), color: colors.placeholder, marginTop: scale(4) }}>
                    {realBookings.length > 0 ? `${realBookings.length} real bookings` : "Using mock data"}
                </Text>
            </View>

            <FlatList
                style={{ flex: 1 }}
                data={filteredPayments}
                renderItem={renderPaymentCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: scale(16), paddingBottom: verticalScale(100) }}
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
                            {(["all", "successfully", "pending"] as PaymentStatus[]).map((status) => (
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
                                        {status === "all" ? "All" : status === "successfully" ? "Success" : "Pending"}
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
        </View>
    )
}

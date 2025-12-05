"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable } from "react-native"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import { bookingsService } from "../../../lib/api/services/bookings.service"
import { API_CONFIG } from "../../../lib/api/config"
import { useAuth } from "../../../lib/auth-context"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

interface PaymentItem {
    orderCode: number
    item: string
    paidAmount: number
    status: string
    paymentMethod: string
    createDate: string
    invoiceId?: string
    bookingNumber?: string
    carName?: string
    userId?: string
}

interface BookingPayments {
    bookingId: string
    bookingNumber?: string
    carName: string
    payments: PaymentItem[]
}

export default function PaymentHistoryScreen() {
    const { user } = useAuth()
    const [bookingPayments, setBookingPayments] = useState<BookingPayments[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set())

    const fetchPaymentHistory = async () => {
        if (!user?.id) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Get all user bookings
            const bookingsResult = await bookingsService.getBookings(user.id)

            if (bookingsResult.error || !bookingsResult.data) {
                setError("Failed to load payment history")
                setLoading(false)
                return
            }

            // Fetch payments for each booking (only for this user's bookings)
            const paymentsPromises = bookingsResult.data.map(async (booking) => {
                // Security check: ensure booking belongs to current user
                if (booking.userId !== user.id) {
                    return null
                }

                try {
                    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')
                    const paymentsUrl = `${baseUrl}/Booking/${booking.id}/Payments`

                    let token: string | null = null
                    try {
                        if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                            token = localStorage.getItem("token")
                        }
                    } catch (e) {
                        // Ignore
                    }

                    const response = await fetch(paymentsUrl, {
                        method: "GET",
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json',
                        },
                    })

                    if (response.ok) {
                        const paymentsData = await response.json()

                        if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                            // Additional security check: verify all payments belong to this user
                            const userPayments = paymentsData.filter(p => p.userId === user.id)

                            if (userPayments.length > 0) {
                                return {
                                    bookingId: booking.id,
                                    bookingNumber: booking.bookingNumber,
                                    carName: booking.carName,
                                    payments: userPayments
                                }
                            }
                        }
                    }
                } catch (err) {
                    // Error fetching payments
                }

                return null
            })

            const results = await Promise.all(paymentsPromises)
            const validResults = results.filter((r) => r !== null) as BookingPayments[]

            setBookingPayments(validResults)
        } catch (err) {
            setError("An error occurred while loading payment history")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchPaymentHistory()
    }, [user?.id])

    const onRefresh = () => {
        setRefreshing(true)
        fetchPaymentHistory()
    }

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`
    }

    const getStatusColor = (status: string) => {
        return status.toLowerCase() === "success" ? "#00B050" : "#d97706"
    }

    const getStatusBgColor = (status: string) => {
        return status.toLowerCase() === "success" ? "#d1fae5" : "#fef3c7"
    }

    const toggleExpanded = (bookingId: string) => {
        setExpandedBookings(prev => {
            const newSet = new Set(prev)
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId)
            } else {
                newSet.add(bookingId)
            }
            return newSet
        })
    }

    const calculateTotal = (payments: PaymentItem[]) => {
        return payments.reduce((sum, payment) => sum + payment.paidAmount, 0)
    }

    const renderBookingPayments = ({ item }: { item: BookingPayments }) => {
        const isExpanded = expandedBookings.has(item.bookingId)
        const totalAmount = calculateTotal(item.payments)

        return (
            <Pressable
                onPress={() => toggleExpanded(item.bookingId)}
                style={{
                    backgroundColor: colors.white,
                    borderRadius: scale(12),
                    padding: scale(16),
                    marginBottom: verticalScale(16),
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {/* Booking Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(12) }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(16), fontWeight: "bold", color: colors.primary, marginBottom: verticalScale(4) }}>
                            {item.carName}
                        </Text>
                        <Text style={{ fontSize: scale(12), color: colors.placeholder }}>
                            Booking ID: {item.bookingNumber || "N/A"}
                        </Text>
                    </View>
                    <MaterialIcons
                        name={isExpanded ? "expand-less" : "expand-more"}
                        size={scale(24)}
                        color={colors.primary}
                    />
                </View>

                {/* Total Amount - Always Visible */}
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: verticalScale(12),
                    borderTopWidth: 1,
                    borderTopColor: colors.border
                }}>
                    <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>
                        Total Amount
                    </Text>
                    <Text style={{ fontSize: scale(18), fontWeight: "bold", color: colors.morentBlue }}>
                        {totalAmount.toLocaleString()} VND
                    </Text>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={{ marginTop: verticalScale(12), paddingTop: verticalScale(12), borderTopWidth: 1, borderTopColor: colors.border }}>
                        {item.payments.map((payment, index) => (
                            <View
                                key={payment.orderCode}
                                style={{
                                    paddingVertical: verticalScale(12),
                                    borderBottomWidth: index < item.payments.length - 1 ? 1 : 0,
                                    borderBottomColor: colors.border,
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(8) }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>
                                            {payment.item}
                                        </Text>
                                        <Text style={{ fontSize: scale(11), color: colors.placeholder, marginTop: verticalScale(2) }}>
                                            Order: {payment.orderCode}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            backgroundColor: getStatusBgColor(payment.status),
                                            paddingHorizontal: scale(10),
                                            paddingVertical: verticalScale(4),
                                            borderRadius: scale(12),
                                        }}
                                    >
                                        <Text style={{ fontSize: scale(11), fontWeight: "600", color: getStatusColor(payment.status) }}>
                                            {payment.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <View>
                                        <Text style={{ fontSize: scale(11), color: colors.placeholder }}>
                                            {payment.paymentMethod}
                                        </Text>
                                        <Text style={{ fontSize: scale(10), color: colors.placeholder, marginTop: verticalScale(2) }}>
                                            {formatDate(payment.createDate)}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: scale(16), fontWeight: "bold", color: colors.morentBlue }}>
                                        {payment.paidAmount.toLocaleString()} VND
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </Pressable>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
            <Header />

            <View style={{ paddingHorizontal: scale(16), paddingTop: scale(16), paddingBottom: scale(8) }}>
                <Text style={{ fontSize: scale(24), fontWeight: "bold", color: colors.primary }}>
                    Payment History
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: verticalScale(16), fontSize: scale(14), color: "#6b7280" }}>
                        Loading payment history...
                    </Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: scale(32) }}>
                    <MaterialIcons name="error-outline" size={scale(48)} color="#ef4444" />
                    <Text style={{ fontSize: scale(16), color: "#ef4444", textAlign: "center", marginTop: verticalScale(16) }}>
                        {error}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookingPayments}
                    renderItem={renderBookingPayments}
                    keyExtractor={(item) => item.bookingId}
                    contentContainerStyle={{ paddingHorizontal: scale(16), paddingBottom: verticalScale(100) }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={{ padding: scale(32), alignItems: "center" }}>
                            <MaterialIcons name="receipt-long" size={scale(48)} color={colors.placeholder} />
                            <Text style={{ fontSize: scale(16), color: colors.placeholder, marginTop: verticalScale(16) }}>
                                No payment history found
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    )
}

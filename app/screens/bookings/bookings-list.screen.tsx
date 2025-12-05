"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from "react-native"
import { bookingsService, type Booking } from "../../../lib/api"
import { useAuth } from "../../../lib/auth-context"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import getAsset from "../../../lib/getAsset"
import Header from "../../components/Header/Header"

type StatusFilter = "all" | "upcoming" | "completed" | "cancelled"

export default function BookingsListScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { user } = useAuth()

  const fetchBookings = useCallback(async () => {
    if (!user?.id) {
      console.log("BookingsListScreen: No user ID found")
      setLoading(false)
      return
    }

    console.log("BookingsListScreen: Fetching bookings for user", user.id)
    setLoading(true)

    try {
      const { data, error } = await bookingsService.getBookings(user.id)

      if (error) {
        console.log("BookingsListScreen: No bookings found (this is normal for new users)")
        setBookings([])
      } else if (data) {
        console.log("BookingsListScreen: Received bookings", data.length)
        // Sort bookings by booking date (newest first)
        const sortedBookings = data.sort((a, b) => {
          const dateA = new Date(a.bookingDate || a.startDate).getTime()
          const dateB = new Date(b.bookingDate || b.startDate).getTime()
          return dateB - dateA // Newest first
        })
        setBookings(sortedBookings)
      } else {
        console.log("BookingsListScreen: No bookings data received")
        setBookings([])
      }
    } catch (err) {
      console.log("BookingsListScreen: Error fetching bookings (user may have no bookings yet)")
      setBookings([])
    }

    setLoading(false)
  }, [user?.id])

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("BookingsListScreen: Screen focused, refreshing bookings")
      fetchBookings()
    }, [fetchBookings])
  )

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    console.log("BookingsListScreen: Pull-to-refresh triggered")
    setRefreshing(true)
    await fetchBookings()
    setRefreshing(false)
  }, [fetchBookings])

  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b: Booking) => b.status === statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#3b82f6"
      case "completed":
        return "#00B050"
      case "cancelled":
        return "#ef4444"
      default:
        return colors.placeholder
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#dbeafe"
      case "completed":
        return "#d1fae5"
      case "cancelled":
        return "#fee2e2"
      default:
        return "#f3f4f6"
    }
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`
  }

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <Pressable
      onPress={() => navigation.navigate("BookingDetail" as any, { id: item.id })}
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
      {/* Header: Car name and status */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(12) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: scale(18), fontWeight: "bold", color: colors.primary, marginBottom: verticalScale(4) }}>
            {item.carName}
          </Text>
          <Text style={{ fontSize: scale(12), color: "#6b7280" }}>
            Booking ID: {item.bookingNumber || "N/A"}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusBgColor(item.status),
            paddingHorizontal: scale(12),
            paddingVertical: verticalScale(6),
            borderRadius: scale(16),
            height: scale(28),
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: scale(12),
              fontWeight: "600",
              color: getStatusColor(item.status),
              textTransform: "capitalize",
            }}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* Car Image */}
      {item.carImage && (
        <View style={{ borderRadius: scale(8), overflow: "hidden", marginBottom: verticalScale(12) }}>
          <Image
            source={
              item.carImage.startsWith('http://') || item.carImage.startsWith('https://')
                ? { uri: item.carImage }
                : getAsset(item.carImage)
            }
            style={{
              width: "100%",
              height: scale(140),
              resizeMode: "cover",
            }}
          />
        </View>
      )}

      {/* Location */}
      <View style={{ marginBottom: verticalScale(12) }}>
        <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
          ROUTE
        </Text>
        <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
          {item.pickupLocation} → {item.dropoffLocation}
        </Text>
      </View>

      {/* Details Grid */}
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
            START DATE
          </Text>
          <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
            {formatDate(item.startDate)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
            END DATE
          </Text>
          <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.primary }}>
            {formatDate(item.endDate)}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
            TOTAL
          </Text>
          <Text style={{ fontSize: scale(16), fontWeight: "bold", color: colors.primary }}>
            {item.totalPrice} VND
          </Text>
        </View>
      </View>

      {/* Add-ons */}
      {item.addons && item.addons.length > 0 && (
        <View>
          <Text style={{ fontSize: scale(10), color: "#6b7280", fontWeight: "600", marginBottom: verticalScale(4) }}>
            ADD-ONS
          </Text>
          <Text style={{ fontSize: scale(12), color: colors.primary }}>
            {item.addons.join(", ")}
          </Text>
        </View>
      )}

      {/* Action indicator */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: verticalScale(8) }}>
        <Text style={{ fontSize: scale(13), fontWeight: "600", color: colors.morentBlue, marginRight: scale(4) }}>
          View Details
        </Text>
        <Text style={{ fontSize: scale(18), color: colors.morentBlue }}>→</Text>
      </View>
    </Pressable>
  )

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header />

      <View style={{ paddingHorizontal: scale(16), paddingTop: scale(8), marginBottom: verticalScale(8) }}>
        <Text style={{ fontSize: scale(24), fontWeight: "bold", color: colors.primary }}>
          My Bookings
        </Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: scale(16), paddingBottom: verticalScale(100) }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
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
            {(["all", "upcoming", "completed", "cancelled"] as StatusFilter[]).map((status) => (
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
                    textTransform: "capitalize",
                  }}
                >
                  {status === "all" ? "All" : status}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={{ padding: scale(32), alignItems: "center" }}>
            <Text style={{ fontSize: scale(16), color: "#6b7280" }}>No bookings found</Text>
          </View>
        }
      />
    </View>
  )
}

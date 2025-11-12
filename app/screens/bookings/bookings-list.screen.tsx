"use client"

import { useState } from "react"
import { View, Text, FlatList, Pressable, Image, ScrollView } from "react-native"
import { mockBookings } from "../../../lib/mock-data/bookings"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { useAuth } from "../../../lib/auth-context"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import getAsset from "../../../lib/getAsset"
import Header from "../../components/Header/Header"

type StatusFilter = "all" | "upcoming" | "completed" | "cancelled"

export default function BookingsListScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { user } = useAuth()

  const userBookings = mockBookings.filter((b) => b.userId === (user?.id ?? "2"))

  const filteredBookings = statusFilter === "all" ? userBookings : userBookings.filter((b) => b.status === statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return colors.morentBlue
      case "completed":
        return "#00B050"
      case "cancelled":
        return "#FF6B6B"
      default:
        return colors.placeholder
    }
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }}
        contentContainerStyle={{ paddingHorizontal: scale(16), paddingVertical: scale(12) }}
      >
        {(["all", "upcoming", "completed", "cancelled"] as StatusFilter[]).map((status) => (
          <Pressable
            key={status}
            onPress={() => setStatusFilter(status)}
            style={{
              paddingHorizontal: scale(12),
              paddingVertical: scale(8),
              marginRight: scale(8),
              borderRadius: scale(20),
              backgroundColor: statusFilter === status ? colors.morentBlue : colors.background,
            }}
          >
            <Text
              style={{
                fontSize: scale(12),
                fontWeight: "600",
                color: statusFilter === status ? colors.white : colors.placeholder,
                textTransform: "capitalize",
              }}
            >
              {status === "all" ? "All Bookings" : status}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(16) }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: scale(40) }}>
            <Text style={{ fontSize: scale(16), color: colors.placeholder }}>No bookings found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("BookingDetail" as any, { id: item.id })}
            style={{
              backgroundColor: colors.white,
              borderRadius: scale(12),
              marginBottom: scale(16),
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Car image and status badge */}
            <View style={{ position: "relative", height: scale(180) }}>
              <Image
                source={getAsset(item.carImage)}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: scale(12),
                  right: scale(12),
                  backgroundColor: getStatusColor(item.status),
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(6),
                  borderRadius: scale(16),
                }}
              >
                <Text
                  style={{
                    fontSize: scale(11),
                    fontWeight: "600",
                    color: colors.white,
                    textTransform: "capitalize",
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Booking details */}
            <View style={{ padding: scale(16) }}>
              {/* Car name and type */}
              <Text
                style={{
                  fontSize: scale(16),
                  fontWeight: "700",
                  color: colors.primary,
                  marginBottom: scale(4),
                }}
              >
                {item.carName}
              </Text>

              {/* Locations */}
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.placeholder,
                  marginBottom: scale(12),
                }}
              >
                {item.pickupLocation} → {item.dropoffLocation}
              </Text>

              {/* Dates and price row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: scale(12),
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: scale(11),
                      color: colors.placeholder,
                      marginBottom: scale(4),
                    }}
                  >
                    Booking Date
                  </Text>
                  <Text
                    style={{
                      fontSize: scale(13),
                      fontWeight: "600",
                      color: colors.primary,
                    }}
                  >
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: scale(11),
                      color: colors.placeholder,
                      marginBottom: scale(4),
                    }}
                  >
                    Total Price
                  </Text>
                  <Text
                    style={{
                      fontSize: scale(16),
                      fontWeight: "700",
                      color: colors.morentBlue,
                    }}
                  >
                    ${item.totalPrice}
                  </Text>
                </View>
              </View>

              {/* Add-ons if any */}
              {item.addOns && item.addOns.length > 0 && (
                <View
                  style={{
                    paddingTop: scale(12),
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: scale(11),
                      color: colors.placeholder,
                      marginBottom: scale(6),
                    }}
                  >
                    Add-ons: {item.addOns.join(", ")}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      />
    </View>
  )
}

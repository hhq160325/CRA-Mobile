import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { getAsset } from "../../../../lib/getAsset"
import type { Booking } from "../../../../lib/api"

interface RecentTransactionsProps {
    bookings: Booking[]
    onViewAll: () => void
}

export default function RecentTransactions({ bookings, onViewAll }: RecentTransactionsProps) {
    return (
        <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: scale(12),
                }}
            >
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>Recent Transaction</Text>
                <Pressable onPress={onViewAll}>
                    <Text style={{ fontSize: scale(12), color: colors.morentBlue, fontWeight: "600" }}>View All</Text>
                </Pressable>
            </View>

            {bookings.map((booking) => (
                <View
                    key={booking.id}
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: 10,
                        padding: scale(12),
                        marginBottom: scale(12),
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                    }}
                >
                    <Image
                        source={getAsset(booking.carImage) || require("../../../../assets/tesla-model-s-luxury.png")}
                        style={{ width: scale(60), height: scale(50), resizeMode: "contain", marginRight: scale(12) }}
                    />

                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>{booking.carName}</Text>
                        <Text style={{ fontSize: scale(11), color: colors.placeholder, marginTop: scale(2) }}>
                            {booking.status === "completed" ? "Completed" : "Upcoming"}
                        </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: scale(11), color: colors.placeholder, marginBottom: scale(4) }}>
                            {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                            })}
                        </Text>
                        <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                            {booking.totalPrice} VND
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    )
}

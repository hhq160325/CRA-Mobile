import React from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

interface BookingCardProps {
    carImage: string
    carName: string
    carLicensePlate: string
    bookingId: string
    bookingNumber?: string
    customerName: string
    amount: number
    statusText: string
    statusColor: string
}

export default function BookingCard({
    carImage,
    carName,
    carLicensePlate,
    bookingId,
    bookingNumber,
    customerName,
    amount,
    statusText,
    statusColor
}: BookingCardProps) {
    return (
        <View style={styles.card}>
            {carImage && (
                <Image source={{ uri: carImage }} style={styles.carImage} resizeMode="cover" />
            )}

            <View style={styles.cardHeader}>
                <View style={styles.carInfo}>
                    <Text style={styles.carName}>{carName}</Text>
                    {carLicensePlate && (
                        <Text style={styles.licensePlate}>License: {carLicensePlate}</Text>
                    )}
                    <Text style={styles.bookingId}>
                        Booking ID: {bookingNumber || "N/A"}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>CUSTOMER</Text>
                    <Text style={styles.infoValue}>{customerName}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>AMOUNT</Text>
                    <Text style={styles.infoValue}>${amount.toFixed(2)}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        margin: scale(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
    },
    carImage: {
        width: "100%",
        height: verticalScale(180),
        backgroundColor: "#e5e7eb",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    carInfo: {
        flex: 1,
    },
    carName: {
        fontSize: scale(18),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    licensePlate: {
        fontSize: scale(12),
        color: "#6b7280",
        marginBottom: verticalScale(4),
    },
    bookingId: {
        fontSize: scale(12),
        color: "#6b7280",
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(16),
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: scale(12),
        fontWeight: "600",
        color: "#d97706",
    },
    infoRow: {
        flexDirection: "row",
        padding: scale(16),
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: scale(10),
        color: "#6b7280",
        fontWeight: "600",
        marginBottom: verticalScale(4),
    },
    infoValue: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
})

import React from "react"
import { View, Text, StyleSheet } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

interface LocationInfoSectionProps {
    title: string
    iconName: string
    iconColor: string
    location: string
    dateTime: { date: string; time: string }
}

export default function LocationInfoSection({
    title,
    iconName,
    iconColor,
    location,
    dateTime
}: LocationInfoSectionProps) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name={iconName as any} size={24} color={iconColor} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                <View style={styles.locationRow}>
                    <MaterialIcons name="place" size={20} color="#6b7280" />
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>Location</Text>
                        <Text style={styles.locationValue}>{location}</Text>
                    </View>
                </View>
                <View style={styles.locationRow}>
                    <MaterialIcons name="schedule" size={20} color="#6b7280" />
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>Date & Time</Text>
                        <Text style={styles.locationValue}>
                            {dateTime.date} at {dateTime.time}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        marginHorizontal: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        gap: scale(8),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontWeight: "600",
        color: colors.primary,
    },
    sectionContent: {
        padding: scale(16),
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: verticalScale(16),
        gap: scale(12),
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: scale(12),
        color: "#6b7280",
        marginBottom: verticalScale(4),
    },
    locationValue: {
        fontSize: scale(14),
        color: colors.primary,
        fontWeight: "500",
    },
})

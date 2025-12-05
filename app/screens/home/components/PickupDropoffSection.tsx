import React, { useState } from "react"
import { View, Text, Pressable, TextInput, Platform, Alert } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../../navigators/navigation-route"
import CustomDateTimePicker from "../../bookings/components/CustomDateTimePicker"

interface LocationSectionProps {
    type: "pickup" | "dropoff"
    location: string
    date: string
    time: string
    onLocationChange: (value: string) => void
    onOpenDateTimePicker: () => void
}

function LocationSection({
    type,
    location,
    date,
    time,
    onLocationChange,
    onOpenDateTimePicker,
}: LocationSectionProps) {
    const isPickup = type === "pickup"

    return (
        <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: scale(16) }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(12) }}>
                <View
                    style={{
                        width: scale(12),
                        height: scale(12),
                        borderRadius: scale(6),
                        backgroundColor: colors.morentBlue,
                        opacity: isPickup ? 0.3 : 1,
                        marginRight: scale(8),
                    }}
                />
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>
                    {isPickup ? "Pick - Up" : "Drop - Off"}
                </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {/* Location Input */}
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingRight: scale(8) }}>
                    <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                        Location
                    </Text>
                    <TextInput
                        placeholder="City name"
                        placeholderTextColor={colors.placeholder}
                        value={location}
                        onChangeText={onLocationChange}
                        style={{
                            fontSize: scale(11),
                            color: colors.primary,
                            padding: 0,
                            margin: 0,
                        }}
                    />
                </View>

                {/* Date & Time Picker Button */}
                <Pressable
                    onPress={onOpenDateTimePicker}
                    style={{ flex: 2, paddingLeft: scale(8), justifyContent: "center" }}
                >
                    <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                        Date & Time
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{
                            fontSize: scale(11),
                            color: date && time ? colors.primary : colors.placeholder,
                            flex: 1
                        }}>
                            {date && time ? `${date} ${time}` : "Select date and time"}
                        </Text>
                        <MaterialIcons name="event" size={scale(16)} color={colors.morentBlue} />
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

export default function PickupDropoffSection() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

    // Pickup state
    const [pickupLocation, setPickupLocation] = useState("")
    const [pickupDate, setPickupDate] = useState("")
    const [pickupTime, setPickupTime] = useState("")

    // Dropoff state
    const [dropoffLocation, setDropoffLocation] = useState("")
    const [dropoffDate, setDropoffDate] = useState("")
    const [dropoffTime, setDropoffTime] = useState("")

    // Date/Time picker modals
    const [showPickupPicker, setShowPickupPicker] = useState(false)
    const [showDropoffPicker, setShowDropoffPicker] = useState(false)

    // Parse date string to Date object
    const parseDate = (dateStr: string): Date => {
        if (!dateStr) return new Date()
        const parsed = new Date(dateStr)
        return isNaN(parsed.getTime()) ? new Date() : parsed
    }

    // Handle pickup date/time confirmation
    const handlePickupConfirm = (date: Date, time: string) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        setPickupDate(`${year}-${month}-${day}`)
        setPickupTime(time)
        setShowPickupPicker(false)
    }

    // Handle dropoff date/time confirmation
    const handleDropoffConfirm = (date: Date, time: string) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        setDropoffDate(`${year}-${month}-${day}`)
        setDropoffTime(time)
        setShowDropoffPicker(false)
    }

    // Swap pickup and dropoff
    const handleSwap = () => {
        const tempLocation = pickupLocation
        const tempDate = pickupDate
        const tempTime = pickupTime

        setPickupLocation(dropoffLocation)
        setPickupDate(dropoffDate)
        setPickupTime(dropoffTime)

        setDropoffLocation(tempLocation)
        setDropoffDate(tempDate)
        setDropoffTime(tempTime)
    }

    // Validate and open map
    const handleGo = () => {
        // Check required fields
        if (!pickupLocation.trim()) {
            Alert.alert("Missing Information", "Please enter pickup location")
            return
        }
        if (!dropoffLocation.trim()) {
            Alert.alert("Missing Information", "Please enter dropoff location")
            return
        }
        if (!pickupDate.trim() || !pickupTime.trim()) {
            Alert.alert("Missing Information", "Please select pickup date and time")
            return
        }
        if (!dropoffDate.trim() || !dropoffTime.trim()) {
            Alert.alert("Missing Information", "Please select dropoff date and time")
            return
        }

        // Navigate to map with route and charging stations
        navigation.navigate("CarMapRouteScreen" as any, {
            pickupLocation,
            pickupDate,
            pickupTime,
            dropoffLocation,
            dropoffDate,
            dropoffTime,
            showRoute: true,
        })
    }

    // Check if all required fields are filled
    const isFormValid = pickupLocation.trim() && dropoffLocation.trim() && pickupDate.trim() && pickupTime.trim() && dropoffDate.trim() && dropoffTime.trim()

    return (
        <>
            {/* Pick-Up Section */}
            <View style={{ paddingHorizontal: scale(16), marginBottom: scale(16) }}>
                <LocationSection
                    type="pickup"
                    location={pickupLocation}
                    date={pickupDate}
                    time={pickupTime}
                    onLocationChange={setPickupLocation}
                    onOpenDateTimePicker={() => setShowPickupPicker(true)}
                />
            </View>

            {/* Swap Button */}
            <View style={{ alignItems: "center", marginBottom: scale(16) }}>
                <Pressable
                    onPress={handleSwap}
                    style={{
                        backgroundColor: colors.morentBlue,
                        width: scale(50),
                        height: scale(50),
                        borderRadius: scale(8),
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: colors.morentBlue,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <MaterialIcons name="swap-vert" size={scale(24)} color={colors.white} />
                </Pressable>
            </View>

            {/* Drop-Off Section */}
            <View style={{ paddingHorizontal: scale(16), marginBottom: scale(16) }}>
                <LocationSection
                    type="dropoff"
                    location={dropoffLocation}
                    date={dropoffDate}
                    time={dropoffTime}
                    onLocationChange={setDropoffLocation}
                    onOpenDateTimePicker={() => setShowDropoffPicker(true)}
                />
            </View>

            {/* GO Button */}
            <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
                <Pressable
                    onPress={handleGo}
                    disabled={!isFormValid}
                    style={{
                        backgroundColor: isFormValid ? colors.morentBlue : colors.placeholder,
                        paddingVertical: scale(16),
                        borderRadius: scale(12),
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: isFormValid ? colors.morentBlue : "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isFormValid ? 0.3 : 0.1,
                        shadowRadius: 8,
                        elevation: isFormValid ? 6 : 2,
                    }}
                >
                    <MaterialIcons name="directions" size={scale(24)} color={colors.white} style={{ marginRight: scale(8) }} />
                    <Text
                        style={{
                            fontSize: scale(16),
                            fontWeight: "700",
                            color: colors.white,
                            letterSpacing: 0.5,
                        }}
                    >
                        GO
                    </Text>
                </Pressable>
            </View>

            {/* Pickup Date/Time Picker */}
            <CustomDateTimePicker
                visible={showPickupPicker}
                onClose={() => setShowPickupPicker(false)}
                onConfirm={handlePickupConfirm}
                initialDate={pickupDate ? parseDate(pickupDate) : new Date()}
                initialTime={pickupTime || '10:00'}
                minimumDate={new Date()}
                title="Select Pickup Date & Time"
            />

            {/* Dropoff Date/Time Picker */}
            <CustomDateTimePicker
                visible={showDropoffPicker}
                onClose={() => setShowDropoffPicker(false)}
                onConfirm={handleDropoffConfirm}
                initialDate={dropoffDate ? parseDate(dropoffDate) : pickupDate ? parseDate(pickupDate) : new Date()}
                initialTime={dropoffTime || '23:00'}
                minimumDate={pickupDate ? parseDate(pickupDate) : new Date()}
                title="Select Dropoff Date & Time"
            />
        </>
    )
}

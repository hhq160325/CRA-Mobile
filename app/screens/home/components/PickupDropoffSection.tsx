import React, { useState } from "react"
import { View, Text, Pressable, TextInput, Platform, Alert } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../../navigators/navigation-route"

interface LocationSectionProps {
    type: "pickup" | "dropoff"
    location: string
    date: string
    time: string
    onLocationChange: (value: string) => void
    onDateChange: (value: string) => void
    onTimeChange: (value: string) => void
}

function LocationSection({
    type,
    location,
    date,
    time,
    onLocationChange,
    onDateChange,
    onTimeChange,
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

                {/* Date Input */}
                <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingHorizontal: scale(8) }}>
                    <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                        Date
                    </Text>
                    <TextInput
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.placeholder}
                        value={date}
                        onChangeText={onDateChange}
                        keyboardType="numeric"
                        maxLength={10}
                        style={{
                            fontSize: scale(11),
                            color: colors.primary,
                            padding: 0,
                            margin: 0,
                        }}
                    />
                </View>

                {/* Time Input */}
                <View style={{ flex: 1, paddingLeft: scale(8) }}>
                    <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                        Time
                    </Text>
                    <TextInput
                        placeholder="HH:MM"
                        placeholderTextColor={colors.placeholder}
                        value={time}
                        onChangeText={onTimeChange}
                        keyboardType="numeric"
                        maxLength={5}
                        style={{
                            fontSize: scale(11),
                            color: colors.primary,
                            padding: 0,
                            margin: 0,
                        }}
                    />
                </View>
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

    // Format date input (auto-add slashes)
    const formatDateInput = (text: string): string => {
        // Remove non-numeric characters
        const numbers = text.replace(/[^\d]/g, "")

        // Add slashes automatically
        if (numbers.length <= 2) {
            return numbers
        } else if (numbers.length <= 4) {
            return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
        } else {
            return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
        }
    }

    // Format time input (auto-add colon)
    const formatTimeInput = (text: string): string => {
        // Remove non-numeric characters
        const numbers = text.replace(/[^\d]/g, "")

        // Add colon automatically
        if (numbers.length <= 2) {
            return numbers
        } else {
            return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`
        }
    }

    // Handle date change with formatting
    const handlePickupDateChange = (text: string) => {
        setPickupDate(formatDateInput(text))
    }

    const handleDropoffDateChange = (text: string) => {
        setDropoffDate(formatDateInput(text))
    }

    // Handle time change with formatting
    const handlePickupTimeChange = (text: string) => {
        setPickupTime(formatTimeInput(text))
    }

    const handleDropoffTimeChange = (text: string) => {
        setDropoffTime(formatTimeInput(text))
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

    // Validate date format (DD/MM/YYYY)
    const validateDate = (dateStr: string): boolean => {
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        const match = dateStr.match(dateRegex)

        if (!match) return false

        const day = parseInt(match[1], 10)
        const month = parseInt(match[2], 10)
        const year = parseInt(match[3], 10)

        if (month < 1 || month > 12) return false
        if (day < 1 || day > 31) return false
        if (year < new Date().getFullYear()) return false

        return true
    }

    // Validate time format (HH:MM)
    const validateTime = (timeStr: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/
        return timeRegex.test(timeStr)
    }

    // Check if pickup date/time is in the future
    const isPickupInFuture = (dateStr: string, timeStr: string): boolean => {
        const [day, month, year] = dateStr.split("/").map(Number)
        const [hours, minutes] = timeStr.split(":").map(Number)

        const pickupDateTime = new Date(year, month - 1, day, hours, minutes)
        const now = new Date()

        return pickupDateTime > now
    }

    // Check if dropoff is after pickup
    const isDropoffAfterPickup = (
        pickupDateStr: string,
        pickupTimeStr: string,
        dropoffDateStr: string,
        dropoffTimeStr: string
    ): boolean => {
        const [pDay, pMonth, pYear] = pickupDateStr.split("/").map(Number)
        const [pHours, pMinutes] = pickupTimeStr.split(":").map(Number)
        const pickupDateTime = new Date(pYear, pMonth - 1, pDay, pHours, pMinutes)

        const [dDay, dMonth, dYear] = dropoffDateStr.split("/").map(Number)
        const [dHours, dMinutes] = dropoffTimeStr.split(":").map(Number)
        const dropoffDateTime = new Date(dYear, dMonth - 1, dDay, dHours, dMinutes)

        return dropoffDateTime > pickupDateTime
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
        if (!pickupDate.trim()) {
            Alert.alert("Missing Information", "Please enter pickup date")
            return
        }
        if (!pickupTime.trim()) {
            Alert.alert("Missing Information", "Please enter pickup time")
            return
        }

        // Validate date format
        if (!validateDate(pickupDate)) {
            Alert.alert("Invalid Date", "Please enter pickup date in DD/MM/YYYY format (e.g., 25/12/2024)")
            return
        }

        // Validate time format
        if (!validateTime(pickupTime)) {
            Alert.alert("Invalid Time", "Please enter pickup time in HH:MM format (e.g., 14:30)")
            return
        }

        // Check if pickup is in the future
        if (!isPickupInFuture(pickupDate, pickupTime)) {
            Alert.alert("Invalid Pickup Time", "Pickup date and time must be in the future")
            return
        }

        // Validate dropoff if provided
        if (dropoffDate && dropoffTime) {
            if (!validateDate(dropoffDate)) {
                Alert.alert("Invalid Date", "Please enter dropoff date in DD/MM/YYYY format (e.g., 26/12/2024)")
                return
            }
            if (!validateTime(dropoffTime)) {
                Alert.alert("Invalid Time", "Please enter dropoff time in HH:MM format (e.g., 16:30)")
                return
            }
            if (!isDropoffAfterPickup(pickupDate, pickupTime, dropoffDate, dropoffTime)) {
                Alert.alert("Invalid Dropoff Time", "Dropoff date and time must be after pickup")
                return
            }
        }

        // Navigate to map with route and charging stations
        navigation.navigate("CarMapRouteScreen" as any, {
            pickupLocation,
            pickupDate,
            pickupTime,
            dropoffLocation,
            dropoffDate: dropoffDate || pickupDate,
            dropoffTime: dropoffTime || pickupTime,
            showRoute: true,
        })
    }

    // Check if all required fields are filled
    const isFormValid = pickupLocation.trim() && dropoffLocation.trim() && pickupDate.trim() && pickupTime.trim()

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
                    onDateChange={handlePickupDateChange}
                    onTimeChange={handlePickupTimeChange}
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
                    onDateChange={handleDropoffDateChange}
                    onTimeChange={handleDropoffTimeChange}
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
        </>
    )
}

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, ActivityIndicator } from "react-native"
import MapViewComponent, { MapMarker } from "./MapView"
import { locationService, type Location } from "../../../lib/api"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

interface LocationPickerProps {
    onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void
    initialLocation?: { latitude: number; longitude: number }
    type?: "pickup" | "dropoff"
}

export default function LocationPicker({ onLocationSelect, initialLocation, type = "pickup" }: LocationPickerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [searching, setSearching] = useState(false)
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(
        initialLocation || null
    )
    const [address, setAddress] = useState("")

    useEffect(() => {
        loadNearbyLocations()
    }, [])

    const loadNearbyLocations = async () => {
        const { data } = await locationService.getLocations(type)
        if (data) {
            setLocations(data)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setSearching(true)
        const { data, error } = await locationService.geocodeAddress(searchQuery)

        if (data && !error) {
            setSelectedLocation({ latitude: data.latitude, longitude: data.longitude })
            setAddress(data.formattedAddress)
        }
        setSearching(false)
    }

    const handleMapPress = async (coordinate: { latitude: number; longitude: number }) => {
        setSelectedLocation(coordinate)


        const { data } = await locationService.reverseGeocode(coordinate.latitude, coordinate.longitude)
        if (data) {
            setAddress(data.address)
        }
    }

    const handleLocationSelect = (location: Location) => {
        setSelectedLocation({ latitude: location.latitude, longitude: location.longitude })
        setAddress(location.address)
    }

    const handleConfirm = () => {
        if (selectedLocation && address) {
            onLocationSelect({
                ...selectedLocation,
                address,
            })
        }
    }

    const markers: MapMarker[] = [

        ...(selectedLocation
            ? [
                {
                    id: "selected",
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    title: type === "pickup" ? "Pickup Location" : "Dropoff Location",
                    description: address,
                    type: type,
                },
            ]
            : []),

        ...locations.map((loc) => ({
            id: loc.id,
            latitude: loc.latitude,
            longitude: loc.longitude,
            title: loc.name,
            description: loc.address,
            type: type,
        })),
    ]

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={scale(24)} color={colors.placeholder} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search location or address"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {searching && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
            </View>

            {/* Map */}
            <MapViewComponent
                initialRegion={
                    selectedLocation
                        ? {
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }
                        : undefined
                }
                markers={markers}
                showUserLocation={true}
                onMapPress={handleMapPress}
                height={300}
            />

            {/* Selected Address */}
            {selectedLocation && address && (
                <View style={styles.selectedAddressContainer}>
                    <MaterialIcons name={type === "pickup" ? "location-on" : "flag"} size={scale(24)} color={colors.morentBlue} />
                    <View style={styles.selectedAddressText}>
                        <Text style={styles.selectedAddressLabel}>{type === "pickup" ? "Pickup" : "Dropoff"} Location</Text>
                        <Text style={styles.selectedAddress}>{address}</Text>
                    </View>
                </View>
            )}

            {/* Nearby Locations */}
            <View style={styles.locationsContainer}>
                <Text style={styles.locationsTitle}>Nearby {type === "pickup" ? "Pickup" : "Dropoff"} Points</Text>
                <FlatList
                    data={locations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable style={styles.locationItem} onPress={() => handleLocationSelect(item)}>
                            <View style={styles.locationIcon}>
                                <MaterialIcons name="place" size={scale(24)} color={colors.morentBlue} />
                            </View>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationName}>{item.name}</Text>
                                <Text style={styles.locationAddress}>{item.address}</Text>
                                {item.workingHours && (
                                    <Text style={styles.locationHours}>
                                        {item.workingHours.open} - {item.workingHours.close}
                                    </Text>
                                )}
                            </View>
                            <MaterialIcons name="chevron-right" size={scale(24)} color={colors.placeholder} />
                        </Pressable>
                    )}
                    style={styles.locationsList}
                />
            </View>

            {/* Confirm Button */}
            <Pressable
                style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={!selectedLocation}
            >
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        padding: scale(16),
        backgroundColor: "white",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: scale(12),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        gap: scale(8),
    },
    searchInput: {
        flex: 1,
        fontSize: scale(14),
        color: colors.primary,
    },
    selectedAddressContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: scale(16),
        gap: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectedAddressText: {
        flex: 1,
    },
    selectedAddressLabel: {
        fontSize: scale(12),
        fontWeight: "600",
        color: colors.placeholder,
        marginBottom: verticalScale(4),
    },
    selectedAddress: {
        fontSize: scale(14),
        color: colors.primary,
    },
    locationsContainer: {
        flex: 1,
        backgroundColor: "white",
        marginTop: verticalScale(8),
    },
    locationsTitle: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
        padding: scale(16),
        paddingBottom: verticalScale(8),
    },
    locationsList: {
        flex: 1,
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: scale(12),
    },
    locationIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    locationAddress: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: verticalScale(2),
    },
    locationHours: {
        fontSize: scale(11),
        color: colors.morentBlue,
    },
    confirmButton: {
        backgroundColor: colors.morentBlue,
        margin: scale(16),
        paddingVertical: verticalScale(16),
        borderRadius: scale(12),
        alignItems: "center",
    },
    confirmButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    confirmButtonText: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: "white",
    },
})

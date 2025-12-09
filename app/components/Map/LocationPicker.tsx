import React, { useState, useEffect } from "react"
import { View, Text, Pressable, TextInput, FlatList, ActivityIndicator } from "react-native"
import MapViewComponent, { MapMarker } from "./MapView"
import { locationService, type Location } from "../../../lib/api"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { styles } from "./components/LocationPicker.styles"

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

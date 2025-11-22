import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from "react-native"
import MapViewComponent, { MapMarker } from "../../components/Map/MapView"
import { locationService, carsService, type CarLocation } from "../../../lib/api"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"

interface RouteParams {
    pickupLocation?: string
    pickupDate?: string
    pickupTime?: string
    dropoffLocation?: string
    dropoffDate?: string
    dropoffTime?: string
    showRoute?: boolean
}

export default function CarMapScreen({ route }: { route?: { params?: RouteParams } }) {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [loading, setLoading] = useState(true)
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [nearbyCars, setNearbyCars] = useState<CarLocation[]>([])
    const [selectedCar, setSelectedCar] = useState<CarLocation | null>(null)
    const [searchRadius, setSearchRadius] = useState(10) // km
    const [chargingStations, setChargingStations] = useState<Array<{ id: string; latitude: number; longitude: number; name: string }>>([])
    const [routeDistance, setRouteDistance] = useState<number | null>(null)

    const params = route?.params

    useEffect(() => {
        if (params?.showRoute && params.pickupLocation && params.dropoffLocation) {
            loadRouteWithChargingStations()
        } else {
            loadUserLocationAndCars()
        }
    }, [searchRadius, params])

    const loadRouteWithChargingStations = async () => {
        setLoading(true)

        // Mock coordinates for pickup and dropoff (in real app, geocode the location names)
        const pickupCoords = { latitude: 10.8231, longitude: 106.6297 } // Ho Chi Minh City
        const dropoffCoords = { latitude: 10.7769, longitude: 106.7009 } // Thu Duc City

        setUserLocation(pickupCoords)

        // Calculate distance between pickup and dropoff
        const distance = locationService.calculateDistance(
            pickupCoords.latitude,
            pickupCoords.longitude,
            dropoffCoords.latitude,
            dropoffCoords.longitude
        )
        setRouteDistance(distance)

        // Mock charging stations along the route
        const mockChargingStations = [
            {
                id: "station1",
                latitude: 10.8100,
                longitude: 106.6500,
                name: "EV Charging Station 1",
            },
            {
                id: "station2",
                latitude: 10.7950,
                longitude: 106.6700,
                name: "EV Charging Station 2",
            },
            {
                id: "station3",
                latitude: 10.7850,
                longitude: 106.6900,
                name: "EV Charging Station 3",
            },
        ]
        setChargingStations(mockChargingStations)

        setLoading(false)
    }

    const loadUserLocationAndCars = async () => {
        setLoading(true)

        // Get user's current location
        const { data: location, error: locationError } = await locationService.getCurrentLocation()

        if (locationError || !location) {
            // Fallback to default location (Ho Chi Minh City)
            setUserLocation({ latitude: 10.8231, longitude: 106.6297 })
        } else {
            setUserLocation(location)
        }

        // Get nearby cars
        const { data: cars } = await locationService.getCarsNearLocation(
            location?.latitude || 10.8231,
            location?.longitude || 106.6297,
            searchRadius
        )

        if (cars) {
            // Calculate distance for each car
            const carsWithDistance = cars.map((car) => ({
                ...car,
                distance: locationService.calculateDistance(
                    location?.latitude || 10.8231,
                    location?.longitude || 106.6297,
                    car.latitude,
                    car.longitude
                ),
            }))
            setNearbyCars(carsWithDistance)
        }

        setLoading(false)
    }

    const handleMarkerPress = (marker: MapMarker) => {
        const car = nearbyCars.find((c) => c.carId === marker.id)
        if (car) {
            setSelectedCar(car)
        }
    }

    const handleViewCarDetails = () => {
        if (selectedCar) {
            navigation.navigate("CarDetail" as any, { id: selectedCar.carId })
        }
    }

    const markers: MapMarker[] = [
        // User location marker
        ...(userLocation
            ? [
                {
                    id: "user",
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    title: "Your Location",
                    type: "user" as const,
                },
            ]
            : []),
        // Car markers
        ...nearbyCars.map((car) => ({
            id: car.carId,
            latitude: car.latitude,
            longitude: car.longitude,
            title: car.carName,
            description: `$${car.price}/day`,
            type: "car" as const,
            price: car.price,
        })),
    ]

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Finding nearby cars...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header />

            {/* Map */}
            <MapViewComponent
                initialRegion={
                    userLocation
                        ? {
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }
                        : undefined
                }
                markers={markers}
                showUserLocation={true}
                onMarkerPress={handleMarkerPress}
                height={500}
                searchRadius={searchRadius}
                searchCenter={userLocation || undefined}
            />

            {/* Search Radius Control */}
            <View style={styles.radiusControl}>
                <Text style={styles.radiusLabel}>Search Radius: {searchRadius} km</Text>
                <View style={styles.radiusButtons}>
                    {[5, 10, 20, 50].map((radius) => (
                        <Pressable
                            key={radius}
                            style={[styles.radiusButton, searchRadius === radius && styles.radiusButtonActive]}
                            onPress={() => setSearchRadius(radius)}
                        >
                            <Text style={[styles.radiusButtonText, searchRadius === radius && styles.radiusButtonTextActive]}>
                                {radius}km
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Car List */}
            <View style={styles.carListContainer}>
                <View style={styles.carListHeader}>
                    <Text style={styles.carListTitle}>Nearby Cars ({nearbyCars.length})</Text>
                    <Pressable onPress={loadUserLocationAndCars}>
                        <MaterialIcons name="refresh" size={scale(24)} color={colors.primary} />
                    </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carList}>
                    {nearbyCars.map((car) => (
                        <Pressable
                            key={car.carId}
                            style={[styles.carCard, selectedCar?.carId === car.carId && styles.carCardSelected]}
                            onPress={() => setSelectedCar(car)}
                        >
                            <View style={styles.carInfo}>
                                <Text style={styles.carName} numberOfLines={1}>
                                    {car.carName}
                                </Text>
                                <View style={styles.carDetails}>
                                    <MaterialIcons name="location-on" size={scale(14)} color={colors.placeholder} />
                                    <Text style={styles.carDistance}>{car.distance?.toFixed(1)} km away</Text>
                                </View>
                                <Text style={styles.carPrice}>${car.price}/day</Text>
                            </View>
                            {car.available ? (
                                <View style={styles.availableBadge}>
                                    <Text style={styles.availableText}>Available</Text>
                                </View>
                            ) : (
                                <View style={styles.unavailableBadge}>
                                    <Text style={styles.unavailableText}>Booked</Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Selected Car Details */}
            {selectedCar && (
                <View style={styles.selectedCarContainer}>
                    <View style={styles.selectedCarInfo}>
                        <View style={styles.selectedCarDetails}>
                            <Text style={styles.selectedCarName}>{selectedCar.carName}</Text>
                            <View style={styles.selectedCarMeta}>
                                <MaterialIcons name="location-on" size={scale(16)} color={colors.placeholder} />
                                <Text style={styles.selectedCarDistance}>{selectedCar.distance?.toFixed(1)} km away</Text>
                            </View>
                            <Text style={styles.selectedCarPrice}>${selectedCar.price}/day</Text>
                        </View>
                        <Pressable style={styles.viewDetailsButton} onPress={handleViewCarDetails}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                            <MaterialIcons name="arrow-forward" size={scale(20)} color="white" />
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: scale(16),
        color: colors.placeholder,
    },
    radiusControl: {
        backgroundColor: "white",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    radiusLabel: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    radiusButtons: {
        flexDirection: "row",
        gap: scale(8),
    },
    radiusButton: {
        flex: 1,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },
    radiusButtonActive: {
        backgroundColor: colors.morentBlue,
        borderColor: colors.morentBlue,
    },
    radiusButtonText: {
        fontSize: scale(12),
        fontWeight: "600",
        color: colors.primary,
    },
    radiusButtonTextActive: {
        color: "white",
    },
    carListContainer: {
        backgroundColor: "white",
        paddingVertical: verticalScale(16),
    },
    carListHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(12),
    },
    carListTitle: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
    },
    carList: {
        paddingHorizontal: scale(16),
    },
    carCard: {
        width: scale(200),
        backgroundColor: colors.background,
        borderRadius: scale(12),
        padding: scale(12),
        marginRight: scale(12),
        borderWidth: 2,
        borderColor: "transparent",
    },
    carCardSelected: {
        borderColor: colors.morentBlue,
    },
    carInfo: {
        marginBottom: verticalScale(8),
    },
    carName: {
        fontSize: scale(14),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    carDetails: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(4),
    },
    carDistance: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    carPrice: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.morentBlue,
    },
    availableBadge: {
        backgroundColor: "#d1fae5",
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(4),
        alignSelf: "flex-start",
    },
    availableText: {
        fontSize: scale(10),
        fontWeight: "600",
        color: "#00B050",
    },
    unavailableBadge: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(4),
        alignSelf: "flex-start",
    },
    unavailableText: {
        fontSize: scale(10),
        fontWeight: "600",
        color: "#ef4444",
    },
    selectedCarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        padding: scale(20),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    selectedCarInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedCarDetails: {
        flex: 1,
    },
    selectedCarName: {
        fontSize: scale(18),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    selectedCarMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(4),
    },
    selectedCarDistance: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    selectedCarPrice: {
        fontSize: scale(20),
        fontWeight: "bold",
        color: colors.morentBlue,
    },
    viewDetailsButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        gap: scale(8),
    },
    viewDetailsText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: "white",
    },
})

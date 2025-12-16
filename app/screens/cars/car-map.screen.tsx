import React, { useState, useEffect } from "react"
import { View, Text, ActivityIndicator, Pressable, ScrollView } from "react-native"
import MapViewComponent, { MapMarker } from "../../components/Map/MapView"
import { locationService, carsService, type CarLocation } from "../../../lib/api"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { styles } from "./styles/carMap.styles"

type CarMapScreenRouteProp = RouteProp<NavigatorParamList, "CarMapScreen">

export default function CarMapScreen() {
    const route = useRoute<CarMapScreenRouteProp>()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [loading, setLoading] = useState(true)
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [userAddress, setUserAddress] = useState<string>("")
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


        const pickupCoords = { latitude: 10.8231, longitude: 106.6297 }
        const dropoffCoords = { latitude: 10.7769, longitude: 106.7009 }

        setUserLocation(pickupCoords)


        const distance = locationService.calculateDistance(
            pickupCoords.latitude,
            pickupCoords.longitude,
            dropoffCoords.latitude,
            dropoffCoords.longitude
        )
        setRouteDistance(distance)


        const mockChargingStations = [
            {
                id: "VinFast",
                latitude: 10.8100,
                longitude: 106.6500,
                name: "Vincom Cộng Hoà",
            },
            {
                id: "VinFast2",
                latitude: 10.7950,
                longitude: 106.6700,
                name: "Vincom Plaza - Phan Văn Trị",
            },
            {
                id: "VinFast3",
                latitude: 10.7850,
                longitude: 106.6900,
                name: "Leman Luxury Apartments",
            },
        ]
        setChargingStations(mockChargingStations)

        setLoading(false)
    }

    const loadUserLocationAndCars = async () => {
        setLoading(true)

        const { data: location, error: locationError } = await locationService.getCurrentLocation()

        const finalLocation = location || { latitude: 10.8231, longitude: 106.6297 }
        setUserLocation(finalLocation)


        try {
            const { data: addressData, error } = await locationService.reverseGeocode(
                finalLocation.latitude,
                finalLocation.longitude
            )
            if (error) {
                console.error("Reverse geocoding error:", error)
                setUserAddress(`${finalLocation.latitude.toFixed(4)}, ${finalLocation.longitude.toFixed(4)}`)
            } else if (addressData) {
                const displayAddress = addressData.address ||
                    (addressData.city && addressData.country ? `${addressData.city}, ${addressData.country}` : null) ||
                    `${finalLocation.latitude.toFixed(4)}, ${finalLocation.longitude.toFixed(4)}`
                setUserAddress(displayAddress)
            }
        } catch (err) {
            console.error("Failed to get address:", err)
            setUserAddress(`${finalLocation.latitude.toFixed(4)}, ${finalLocation.longitude.toFixed(4)}`)
        }

        const { data: cars } = await locationService.getCarsNearLocation(
            finalLocation.latitude,
            finalLocation.longitude,
            searchRadius
        )

        if (cars) {
            const carsWithDistance = cars.map((car) => ({
                ...car,
                distance: locationService.calculateDistance(
                    finalLocation.latitude,
                    finalLocation.longitude,
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

        ...nearbyCars.map((car) => ({
            id: car.carId,
            latitude: car.latitude,
            longitude: car.longitude,
            title: car.carName,
            description: `${car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND/day`,
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

            {/* User Location Info */}
            {userAddress && (
                <View style={styles.locationInfo}>
                    <MaterialIcons name="my-location" size={scale(20)} color={colors.morentBlue} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {userAddress}
                    </Text>
                </View>
            )}

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
                                <Text style={styles.carPrice}>{car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND/day</Text>
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
                            <Text style={styles.selectedCarPrice}>{selectedCar.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND/day</Text>
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

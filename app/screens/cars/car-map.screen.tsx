import React, { useState, useEffect } from "react"
import { View, Text, ActivityIndicator, Pressable, ScrollView, Linking, Alert } from "react-native"
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

    const openInNativeMap = (latitude: number, longitude: number, label?: string) => {
        const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label || 'Location'})`
        const iosUrl = `maps:${latitude},${longitude}?q=${label || 'Location'}`

        // Try iOS Maps first, then fallback to Android
        Linking.canOpenURL(iosUrl).then(supported => {
            if (supported) {
                Linking.openURL(iosUrl)
            } else {
                Linking.canOpenURL(url).then(androidSupported => {
                    if (androidSupported) {
                        Linking.openURL(url)
                    } else {
                        Alert.alert('Error', 'No map application found')
                    }
                })
            }
        })
    }

    const openDirections = (fromLat: number, fromLng: number, toLat: number, toLng: number, label?: string) => {
        const url = `google.navigation:q=${toLat},${toLng}`
        const iosUrl = `maps:daddr=${toLat},${toLng}&saddr=${fromLat},${fromLng}`

        Linking.canOpenURL(iosUrl).then(supported => {
            if (supported) {
                Linking.openURL(iosUrl)
            } else {
                Linking.canOpenURL(url).then(androidSupported => {
                    if (androidSupported) {
                        Linking.openURL(url)
                    } else {
                        // Fallback to web Google Maps
                        const webUrl = `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`
                        Linking.openURL(webUrl)
                    }
                })
            }
        })
    }

    const handleViewCarDetails = () => {
        if (selectedCar) {
            navigation.navigate("CarDetail" as any, { id: selectedCar.carId })
        }
    }

    const handleViewCarLocation = (car: CarLocation) => {
        openInNativeMap(car.latitude, car.longitude, car.carName)
    }

    const handleGetDirections = (car: CarLocation) => {
        if (userLocation) {
            openDirections(userLocation.latitude, userLocation.longitude, car.latitude, car.longitude, car.carName)
        } else {
            Alert.alert('Location Required', 'Please enable location services to get directions')
        }
    }

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

            {/* User Location Info */}
            {userAddress && (
                <View style={styles.locationInfo}>
                    <MaterialIcons name="my-location" size={scale(20)} color={colors.morentBlue} />
                    <Text style={styles.locationText} numberOfLines={3}>
                        Your Location: {userAddress}
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

            {/* Open Full Map Button */}
            {userLocation && (
                <View style={styles.mapButtonContainer}>
                    <Pressable
                        style={styles.openMapButton}
                        onPress={() => openInNativeMap(userLocation.latitude, userLocation.longitude, 'Your Location')}
                    >
                        <MaterialIcons name="map" size={scale(20)} color="white" />
                        <Text style={styles.openMapButtonText}>Open Map</Text>
                    </Pressable>
                </View>
            )}

            {/* Car List */}
            <View style={styles.carListContainer}>
                <View style={styles.carListHeader}>
                    <Text style={styles.carListTitle}>Nearby Cars ({nearbyCars.length})</Text>
                    <Pressable onPress={loadUserLocationAndCars}>
                        <MaterialIcons name="refresh" size={scale(24)} color={colors.primary} />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.carListVertical}>
                    {nearbyCars.map((car) => (
                        <View key={car.carId} style={styles.carCardVertical}>
                            <View style={styles.carInfo}>
                                <Text style={styles.carName} numberOfLines={1}>
                                    {car.carName}
                                </Text>
                                <View style={styles.carDetails}>
                                    <MaterialIcons name="location-on" size={scale(14)} color={colors.placeholder} />
                                    <Text style={styles.carDistance}>{car.distance?.toFixed(1)} km away</Text>
                                </View>
                                <Text style={styles.carPrice}>{car.price.toLocaleString()} VND/day</Text>

                                {car.available ? (
                                    <View style={styles.availableBadge}>
                                        <Text style={styles.availableText}>Available</Text>
                                    </View>
                                ) : (
                                    <View style={styles.unavailableBadge}>
                                        <Text style={styles.unavailableText}>Booked</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.carActions}>
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => handleViewCarLocation(car)}
                                >
                                    <MaterialIcons name="place" size={scale(18)} color={colors.morentBlue} />
                                    <Text style={styles.actionButtonText}>View</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => handleGetDirections(car)}
                                >
                                    <MaterialIcons name="directions" size={scale(18)} color={colors.morentBlue} />
                                    <Text style={styles.actionButtonText}>Directions</Text>
                                </Pressable>

                                <Pressable
                                    style={styles.primaryActionButton}
                                    onPress={() => navigation.navigate("CarDetail" as any, { id: car.carId })}
                                >
                                    <Text style={styles.primaryActionButtonText}>Details</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}

                    {nearbyCars.length === 0 && (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="directions-car" size={scale(48)} color={colors.placeholder} />
                            <Text style={styles.emptyStateText}>No cars found in this area</Text>
                            <Text style={styles.emptyStateSubtext}>Try increasing the search radius</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Browse Electric Cars Button */}
                <View style={styles.browseButtonContainer}>
                    <Pressable
                        style={styles.browseElectricButton}
                        onPress={() => {
                            console.log('Browse Electric Cars button pressed - navigating to AllCars with Electric filter');
                            try {
                                // Navigate to AllCars with electric filter
                                navigation.navigate('AllCars' as any, { fuelType: 'Electric' });
                            } catch (error) {
                                console.error('Navigation error:', error);
                                // Fallback: Show message to user
                                Alert.alert(
                                    'Browse Electric Cars',
                                    'To view electric vehicles, please navigate to "All Cars" from the home screen and use the electric filter.',
                                    [{ text: 'OK' }]
                                );
                            }
                        }}
                    >
                        <MaterialIcons name="electric-car" size={scale(20)} color="white" />
                        <Text style={styles.browseElectricButtonText}>Browse Electric Cars</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

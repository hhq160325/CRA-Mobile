import React, { useState, useEffect } from "react"
import { View, Text, ActivityIndicator, Pressable, ScrollView } from "react-native"
import MapViewComponent, { MapMarker } from "../../components/Map/MapView"
import { locationService } from "../../../lib/api"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { styles } from "./styles/carMapRoute.styles"

type CarMapRouteScreenRouteProp = RouteProp<NavigatorParamList, "CarMapRouteScreen">

export default function CarMapRouteScreen() {
    const route = useRoute<CarMapRouteScreenRouteProp>()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [loading, setLoading] = useState(true)
    const [chargingStations, setChargingStations] = useState<Array<{ id: string; latitude: number; longitude: number; name: string }>>([])
    const [routeDistance, setRouteDistance] = useState<number>(0)
    const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null)
    const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null)
    const [error, setError] = useState<string | null>(null)

    const params = route.params || {
        pickupLocation: 'Pickup Location',
        dropoffLocation: 'Dropoff Location',
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: '10:00',
        dropoffDate: new Date().toISOString().split('T')[0],
        dropoffTime: '10:00',
    }

    useEffect(() => {
        loadRouteData()
    }, [])

    const loadRouteData = async () => {
        setLoading(true)
        setError(null)

        try {
            // Get coordinates for pickup location
            console.log('Getting coordinates for pickup location:', params.pickupLocation)
            const pickupResult = await locationService.getCoordinatesFromAddress(params.pickupLocation)

            if (pickupResult.error || !pickupResult.data) {
                console.error('Failed to get pickup coordinates:', pickupResult.error)
                setError(`Could not find pickup location: ${params.pickupLocation}`)
                setLoading(false)
                return
            }

            // Get coordinates for dropoff location
            console.log('Getting coordinates for dropoff location:', params.dropoffLocation)
            const dropoffResult = await locationService.getCoordinatesFromAddress(params.dropoffLocation)

            if (dropoffResult.error || !dropoffResult.data) {
                console.error('Failed to get dropoff coordinates:', dropoffResult.error)
                setError(`Could not find dropoff location: ${params.dropoffLocation}`)
                setLoading(false)
                return
            }

            const pickupCoordinates = {
                latitude: parseFloat(pickupResult.data.latitude.toString()),
                longitude: parseFloat(pickupResult.data.longitude.toString())
            }

            const dropoffCoordinates = {
                latitude: parseFloat(dropoffResult.data.latitude.toString()),
                longitude: parseFloat(dropoffResult.data.longitude.toString())
            }

            setPickupCoords(pickupCoordinates)
            setDropoffCoords(dropoffCoordinates)

            // Calculate distance between actual coordinates
            const distance = locationService.calculateDistance(
                pickupCoordinates.latitude,
                pickupCoordinates.longitude,
                dropoffCoordinates.latitude,
                dropoffCoordinates.longitude
            )
            setRouteDistance(distance)

            console.log('Route loaded successfully:', {
                pickup: pickupCoordinates,
                dropoff: dropoffCoordinates,
                distance: distance
            })

            // Generate charging stations along the route (mock data for now)
            const mockStations = [
                {
                    id: "station1",
                    latitude: (pickupCoordinates.latitude + dropoffCoordinates.latitude) / 2 + 0.01,
                    longitude: (pickupCoordinates.longitude + dropoffCoordinates.longitude) / 2 + 0.01,
                    name: "VinFast Charging Station",
                },
                {
                    id: "station2",
                    latitude: (pickupCoordinates.latitude + dropoffCoordinates.latitude) / 2,
                    longitude: (pickupCoordinates.longitude + dropoffCoordinates.longitude) / 2,
                    name: "EV Point Midway",
                },
                {
                    id: "station3",
                    latitude: (pickupCoordinates.latitude + dropoffCoordinates.latitude) / 2 - 0.01,
                    longitude: (pickupCoordinates.longitude + dropoffCoordinates.longitude) / 2 - 0.01,
                    name: "Green Energy Station",
                },
            ]
            setChargingStations(mockStations)

        } catch (err) {
            console.error('Error loading route data:', err)
            setError('Failed to load route information')
        } finally {
            setLoading(false)
        }
    }


    // Route coordinates - only if both pickup and dropoff coords are available
    const routeCoordinates = pickupCoords && dropoffCoords ? [
        pickupCoords,
        ...chargingStations.map(station => ({ latitude: station.latitude, longitude: station.longitude })),
        dropoffCoords,
    ] : []

    const markers: MapMarker[] = [
        // Pickup marker - only if coordinates are available
        ...(pickupCoords ? [{
            id: "pickup",
            latitude: pickupCoords.latitude,
            longitude: pickupCoords.longitude,
            title: `📍 ${params.pickupLocation}`,
            description: `Pickup: ${params.pickupDate} ${params.pickupTime}`,
            type: "user" as const,
        }] : []),
        // Dropoff marker - only if coordinates are available
        ...(dropoffCoords ? [{
            id: "dropoff",
            latitude: dropoffCoords.latitude,
            longitude: dropoffCoords.longitude,
            title: `🏁 ${params.dropoffLocation}`,
            description: `Dropoff: ${params.dropoffDate} ${params.dropoffTime}`,
            type: "car" as const,
        }] : []),
        // Charging stations
        ...chargingStations.map((station) => ({
            id: station.id,
            latitude: station.latitude,
            longitude: station.longitude,
            title: `⚡ ${station.name}`,
            description: "EV Charging Available",
            type: "car" as const,
        })),
    ]

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading route...</Text>
                </View>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <MaterialIcons name="error-outline" size={scale(48)} color={colors.placeholder} />
                    <Text style={styles.loadingText}>{error}</Text>
                    <Pressable
                        style={[styles.actionButton, styles.primaryButton, { marginTop: scale(16) }]}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={scale(20)} color="white" />
                        <Text style={styles.primaryButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header />

            {/* Route Info Banner */}
            <View style={styles.routeInfo}>
                <View style={styles.routeInfoRow}>
                    <MaterialIcons name="route" size={scale(24)} color={colors.morentBlue} />
                    <View style={styles.routeInfoText}>
                        <Text style={styles.routeInfoTitle}>Route Distance</Text>
                        <Text style={styles.routeInfoValue}>{routeDistance.toFixed(1)} km</Text>
                    </View>
                </View>
                <View style={styles.routeInfoRow}>
                    <MaterialIcons name="ev-station" size={scale(24)} color="#00B050" />
                    <View style={styles.routeInfoText}>
                        <Text style={styles.routeInfoTitle}>Charging Stations</Text>
                        <Text style={styles.routeInfoValue}>{chargingStations.length} stations</Text>
                    </View>
                </View>
            </View>

            {/* Map */}
            <MapViewComponent
                initialRegion={pickupCoords && dropoffCoords ? {
                    latitude: (pickupCoords.latitude + dropoffCoords.latitude) / 2,
                    longitude: (pickupCoords.longitude + dropoffCoords.longitude) / 2,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                } : {
                    latitude: 10.8231,
                    longitude: 106.6297,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                }}
                markers={markers}
                route={routeCoordinates.length > 0 ? {
                    coordinates: routeCoordinates,
                    color: "#3B82F6",
                    width: 4,
                } : undefined}
                showUserLocation={false}
                height={400}
            />

            {/* Charging Stations List */}
            <View style={styles.stationsContainer}>
                <Text style={styles.stationsTitle}>⚡ Charging Stations on Route</Text>
                <ScrollView style={styles.stationsList}>
                    {chargingStations.map((station, index) => (
                        <View key={station.id} style={styles.stationCard}>
                            <View style={styles.stationNumber}>
                                <Text style={styles.stationNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.stationInfo}>
                                <Text style={styles.stationName}>{station.name}</Text>
                                <Text style={styles.stationDetails}>Fast charging available • Open 24/7</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={scale(24)} color={colors.placeholder} />
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Pressable
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={scale(20)} color={colors.primary} />
                    <Text style={styles.secondaryButtonText}>Back</Text>
                </Pressable>
                <Pressable
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => {
                        // Navigate back to main tab stack (home screen)
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "tabStack" as any }],
                        })
                    }}
                >
                    <MaterialIcons name="directions-car" size={scale(20)} color="white" />
                    <Text style={styles.primaryButtonText}>Browse Cars</Text>
                </Pressable>
            </View>
        </View>
    )
}

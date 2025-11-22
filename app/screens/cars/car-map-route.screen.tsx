import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from "react-native"
import MapViewComponent, { MapMarker } from "../../components/Map/MapView"
import { locationService } from "../../../lib/api"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import Header from "../../components/Header/Header"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"

interface RouteParams {
    pickupLocation: string
    pickupDate: string
    pickupTime: string
    dropoffLocation: string
    dropoffDate: string
    dropoffTime: string
    showRoute: boolean
}

export default function CarMapRouteScreen({ route }: { route: { params: RouteParams } }) {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [loading, setLoading] = useState(true)
    const [chargingStations, setChargingStations] = useState<Array<{ id: string; latitude: number; longitude: number; name: string }>>([])
    const [routeDistance, setRouteDistance] = useState<number>(0)

    const params = route.params

    // Mock coordinates (in real app, use geocoding API)
    const pickupCoords = { latitude: 10.8231, longitude: 106.6297 } // Ho Chi Minh City
    const dropoffCoords = { latitude: 10.7769, longitude: 106.7009 } // Thu Duc City

    useEffect(() => {
        loadRouteData()
    }, [])

    const loadRouteData = async () => {
        setLoading(true)

        // Calculate distance
        const distance = locationService.calculateDistance(
            pickupCoords.latitude,
            pickupCoords.longitude,
            dropoffCoords.latitude,
            dropoffCoords.longitude
        )
        setRouteDistance(distance)

        // Mock charging stations along the route (positioned between pickup and dropoff)
        const mockStations = [
            {
                id: "station1",
                latitude: 10.8100,
                longitude: 106.6500,
                name: "VinFast Charging Station",
            },
            {
                id: "station2",
                latitude: 10.7950,
                longitude: 106.6700,
                name: "EV Point District 2",
            },
            {
                id: "station3",
                latitude: 10.7850,
                longitude: 106.6900,
                name: "Green Energy Station",
            },
        ]
        setChargingStations(mockStations)

        setLoading(false)
    }

    // Create route coordinates (simple straight line with waypoints for charging stations)
    const routeCoordinates = [
        pickupCoords,
        ...chargingStations.map(station => ({ latitude: station.latitude, longitude: station.longitude })),
        dropoffCoords,
    ]

    const markers: MapMarker[] = [
        // Pickup location
        {
            id: "pickup",
            latitude: pickupCoords.latitude,
            longitude: pickupCoords.longitude,
            title: `📍 ${params.pickupLocation}`,
            description: `Pickup: ${params.pickupDate} ${params.pickupTime}`,
            type: "user" as const,
        },
        // Dropoff location
        {
            id: "dropoff",
            latitude: dropoffCoords.latitude,
            longitude: dropoffCoords.longitude,
            title: `🏁 ${params.dropoffLocation}`,
            description: `Dropoff: ${params.dropoffDate} ${params.dropoffTime}`,
            type: "car" as const,
        },
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
                initialRegion={{
                    latitude: (pickupCoords.latitude + dropoffCoords.latitude) / 2,
                    longitude: (pickupCoords.longitude + dropoffCoords.longitude) / 2,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                }}
                markers={markers}
                route={{
                    coordinates: routeCoordinates,
                    color: "#3B82F6",
                    width: 4,
                }}
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
    routeInfo: {
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    routeInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(12),
    },
    routeInfoText: {
        gap: verticalScale(4),
    },
    routeInfoTitle: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    routeInfoValue: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
    },
    stationsContainer: {
        flex: 1,
        backgroundColor: "white",
        padding: scale(16),
    },
    stationsTitle: {
        fontSize: scale(16),
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: verticalScale(12),
    },
    stationsList: {
        flex: 1,
    },
    stationCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: scale(12),
        padding: scale(12),
        marginBottom: verticalScale(8),
        gap: scale(12),
    },
    stationNumber: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.morentBlue,
        justifyContent: "center",
        alignItems: "center",
    },
    stationNumberText: {
        fontSize: scale(14),
        fontWeight: "bold",
        color: "white",
    },
    stationInfo: {
        flex: 1,
        gap: verticalScale(4),
    },
    stationName: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
    stationDetails: {
        fontSize: scale(12),
        color: colors.placeholder,
    },
    actionButtons: {
        flexDirection: "row",
        padding: scale(16),
        gap: scale(12),
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        gap: scale(8),
    },
    primaryButton: {
        backgroundColor: colors.morentBlue,
    },
    secondaryButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    primaryButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: "white",
    },
    secondaryButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.primary,
    },
})

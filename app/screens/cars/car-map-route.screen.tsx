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

    const params = route.params


    const pickupCoords = { latitude: 10.8231, longitude: 106.6297 }
    const dropoffCoords = { latitude: 10.7769, longitude: 106.7009 }

    useEffect(() => {
        loadRouteData()
    }, [])

    const loadRouteData = async () => {
        setLoading(true)


        const distance = locationService.calculateDistance(
            pickupCoords.latitude,
            pickupCoords.longitude,
            dropoffCoords.latitude,
            dropoffCoords.longitude
        )
        setRouteDistance(distance)


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


    const routeCoordinates = [
        pickupCoords,
        ...chargingStations.map(station => ({ latitude: station.latitude, longitude: station.longitude })),
        dropoffCoords,
    ]

    const markers: MapMarker[] = [

        {
            id: "pickup",
            latitude: pickupCoords.latitude,
            longitude: pickupCoords.longitude,
            title: `📍 ${params.pickupLocation}`,
            description: `Pickup: ${params.pickupDate} ${params.pickupTime}`,
            type: "user" as const,
        },

        {
            id: "dropoff",
            latitude: dropoffCoords.latitude,
            longitude: dropoffCoords.longitude,
            title: `🏁 ${params.dropoffLocation}`,
            description: `Dropoff: ${params.dropoffDate} ${params.dropoffTime}`,
            type: "car" as const,
        },

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

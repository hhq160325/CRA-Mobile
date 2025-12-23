import React, { useState, useEffect } from "react"
import { View, Text, ActivityIndicator, Pressable, ScrollView, Linking, Alert } from "react-native"
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


    const openRouteInNativeMap = () => {
        if (pickupCoords && dropoffCoords) {
            const url = `google.navigation:q=${dropoffCoords.latitude},${dropoffCoords.longitude}&saddr=${pickupCoords.latitude},${pickupCoords.longitude}`
            const iosUrl = `maps:daddr=${dropoffCoords.latitude},${dropoffCoords.longitude}&saddr=${pickupCoords.latitude},${pickupCoords.longitude}`

            Linking.canOpenURL(iosUrl).then(supported => {
                if (supported) {
                    Linking.openURL(iosUrl)
                } else {
                    Linking.canOpenURL(url).then(androidSupported => {
                        if (androidSupported) {
                            Linking.openURL(url)
                        } else {
                            // Fallback to web Google Maps
                            const webUrl = `https://www.google.com/maps/dir/${pickupCoords.latitude},${pickupCoords.longitude}/${dropoffCoords.latitude},${dropoffCoords.longitude}`
                            Linking.openURL(webUrl)
                        }
                    })
                }
            })
        } else {
            Alert.alert('Error', 'Route coordinates not available')
        }
    }

    const openLocationInMap = (latitude: number, longitude: number, name: string) => {
        const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${name})`
        const iosUrl = `maps:${latitude},${longitude}?q=${name}`

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

            {/* Route Locations */}
            <View style={styles.locationsContainer}>
                <View style={styles.locationCard}>
                    <View style={styles.locationIcon}>
                        <MaterialIcons name="my-location" size={scale(20)} color={colors.morentBlue} />
                    </View>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>Pickup Location</Text>
                        <Text style={styles.locationAddress}>{params.pickupLocation}</Text>
                        <Text style={styles.locationTime}>{params.pickupDate} at {params.pickupTime}</Text>
                    </View>
                    <Pressable
                        style={styles.locationButton}
                        onPress={() => pickupCoords && openLocationInMap(pickupCoords.latitude, pickupCoords.longitude, params.pickupLocation)}
                    >
                        <MaterialIcons name="place" size={scale(18)} color={colors.morentBlue} />
                    </Pressable>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.locationCard}>
                    <View style={styles.locationIcon}>
                        <MaterialIcons name="flag" size={scale(20)} color="#ef4444" />
                    </View>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>Dropoff Location</Text>
                        <Text style={styles.locationAddress}>{params.dropoffLocation}</Text>
                        <Text style={styles.locationTime}>{params.dropoffDate} at {params.dropoffTime}</Text>
                    </View>
                    <Pressable
                        style={styles.locationButton}
                        onPress={() => dropoffCoords && openLocationInMap(dropoffCoords.latitude, dropoffCoords.longitude, params.dropoffLocation)}
                    >
                        <MaterialIcons name="place" size={scale(18)} color={colors.morentBlue} />
                    </Pressable>
                </View>
            </View>

            {/* Navigation Button */}
            <View style={styles.navigationContainer}>
                <Pressable
                    style={styles.navigationButton}
                    onPress={openRouteInNativeMap}
                >
                    <MaterialIcons name="navigation" size={scale(24)} color="white" />
                    <Text style={styles.navigationButtonText}>Start Navigation</Text>
                </Pressable>
            </View>

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
                            <Pressable
                                style={styles.stationViewButton}
                                onPress={() => openLocationInMap(station.latitude, station.longitude, station.name)}
                            >
                                <MaterialIcons name="place" size={scale(18)} color={colors.morentBlue} />
                            </Pressable>
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
                        console.log('Browse Cars button pressed - navigating to AllCars with Electric filter');
                        try {
                            // Navigate to AllCars with electric filter
                            navigation.navigate('AllCars' as any, { fuelType: 'Electric' });
                        } catch (error) {
                            console.error('Navigation error:', error);
                            // Fallback: Navigate to root and then to AllCars
                            navigation.reset({
                                index: 0,
                                routes: [
                                    {
                                        name: 'auth' as any,
                                        state: {
                                            routes: [
                                                {
                                                    name: 'tabStack' as any,
                                                    state: {
                                                        routes: [
                                                            {
                                                                name: 'AllCars' as any,
                                                                params: { fuelType: 'Electric' }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            });
                        }
                    }}
                >
                    <MaterialIcons name="electric-car" size={scale(20)} color="white" />
                    <Text style={styles.primaryButtonText}>Browse Cars</Text>
                </Pressable>
            </View>
        </View>
    )
}

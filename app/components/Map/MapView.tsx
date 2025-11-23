import React, { useState, useRef } from "react"
import { View, StyleSheet, Pressable, Text } from "react-native"
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from "react-native-maps"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

export interface MapMarker {
    id: string
    latitude: number
    longitude: number
    title: string
    description?: string
    type?: "car" | "pickup" | "dropoff" | "user"
    price?: number
    image?: string
}

export interface MapRoute {
    coordinates: { latitude: number; longitude: number }[]
    color?: string
    width?: number
}

interface MapViewComponentProps {
    initialRegion?: {
        latitude: number
        longitude: number
        latitudeDelta: number
        longitudeDelta: number
    }
    markers?: MapMarker[]
    route?: MapRoute
    showUserLocation?: boolean
    onMarkerPress?: (marker: MapMarker) => void
    onMapPress?: (coordinate: { latitude: number; longitude: number }) => void
    height?: number
    searchRadius?: number
    searchCenter?: { latitude: number; longitude: number }
}

export default function MapViewComponent({
    initialRegion = {
        latitude: 10.8231,
        longitude: 106.6297,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    },
    markers = [],
    route,
    showUserLocation = true,
    onMarkerPress,
    onMapPress,
    height = 400,
    searchRadius,
    searchCenter,
}: MapViewComponentProps) {
    const mapRef = useRef<MapView>(null)
    const [mapType, setMapType] = useState<"standard" | "satellite">("standard")

    const getMarkerColor = (type?: string) => {
        switch (type) {
            case "car":
                return colors.morentBlue
            case "pickup":
                return "#00B050"
            case "dropoff":
                return "#ef4444"
            case "user":
                return colors.primary
            default:
                return colors.morentBlue
        }
    }

    const getMarkerIcon = (type?: string) => {
        switch (type) {
            case "car":
                return "directions-car"
            case "pickup":
                return "location-on"
            case "dropoff":
                return "flag"
            case "user":
                return "person-pin"
            default:
                return "place"
        }
    }

    const fitToMarkers = () => {
        if (markers.length > 0 && mapRef.current) {
            mapRef.current.fitToSuppliedMarkers(
                markers.map((m) => m.id),
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            )
        }
    }

    const centerOnUser = () => {
        if (showUserLocation && mapRef.current) {
            mapRef.current.animateToRegion(initialRegion, 1000)
        }
    }

    return (
        <View style={[styles.container, { height }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation={showUserLocation}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                mapType={mapType}
                onPress={(e) => onMapPress?.(e.nativeEvent.coordinate)}
            >
                {/* Markers */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        identifier={marker.id}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                        title={marker.title}
                        description={marker.description}
                        pinColor={getMarkerColor(marker.type)}
                        onPress={() => onMarkerPress?.(marker)}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.markerIcon, { backgroundColor: getMarkerColor(marker.type) }]}>
                                <MaterialIcons name={getMarkerIcon(marker.type)} size={scale(20)} color="white" />
                            </View>
                            {marker.price && (
                                <View style={styles.priceTag}>
                                    <Text style={styles.priceText}>{marker.price} VND</Text>
                                </View>
                            )}
                        </View>
                    </Marker>
                ))}

                {/* Route Polyline */}
                {route && (
                    <Polyline
                        coordinates={route.coordinates}
                        strokeColor={route.color || colors.morentBlue}
                        strokeWidth={route.width || 3}
                    />
                )}

                {/* Search Radius Circle */}
                {searchRadius && searchCenter && (
                    <Circle
                        center={searchCenter}
                        radius={searchRadius * 1000} // Convert km to meters
                        strokeColor="rgba(59, 130, 246, 0.5)"
                        fillColor="rgba(59, 130, 246, 0.1)"
                        strokeWidth={2}
                    />
                )}
            </MapView>

            {/* Map Controls */}
            <View style={styles.controls}>
                {/* Map Type Toggle */}
                <Pressable
                    style={styles.controlButton}
                    onPress={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
                >
                    <MaterialIcons name="layers" size={scale(24)} color={colors.primary} />
                </Pressable>

                {/* Center on User */}
                {showUserLocation && (
                    <Pressable style={styles.controlButton} onPress={centerOnUser}>
                        <MaterialIcons name="my-location" size={scale(24)} color={colors.primary} />
                    </Pressable>
                )}

                {/* Fit to Markers */}
                {markers.length > 1 && (
                    <Pressable style={styles.controlButton} onPress={fitToMarkers}>
                        <MaterialIcons name="zoom-out-map" size={scale(24)} color={colors.primary} />
                    </Pressable>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderRadius: scale(12),
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
    controls: {
        position: "absolute",
        right: scale(16),
        top: scale(16),
        gap: scale(8),
    },
    controlButton: {
        backgroundColor: "white",
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerContainer: {
        alignItems: "center",
    },
    markerIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    priceTag: {
        backgroundColor: "white",
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        marginTop: scale(4),
        borderWidth: 1,
        borderColor: colors.border,
    },
    priceText: {
        fontSize: scale(12),
        fontWeight: "bold",
        color: colors.primary,
    },
})

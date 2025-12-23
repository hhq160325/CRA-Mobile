import React, { useRef } from "react"
import { View, Text, Pressable, Image, Dimensions, Animated } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { getAsset } from "../../../../lib/getAsset"
import type { Car } from "../../../../lib/api"
import { useFavorites } from "../../../../lib/favorites-context"

const { width: screenWidth } = Dimensions.get('window')

const horizontalCardWidth = Math.min(scale(240), screenWidth * 0.65)

interface CarCardProps {
    car: Car
    isHorizontal?: boolean
    onPress: () => void
    onRentPress: () => void
}

export default function CarCard({ car, isHorizontal = false, onPress, onRentPress }: CarCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const isLiked = isFavorite(car.id)

    // Animation values for sink-and-float effect
    const scaleAnim = useRef(new Animated.Value(1)).current
    const shadowAnim = useRef(new Animated.Value(2)).current
    const translateYAnim = useRef(new Animated.Value(0)).current

    const handleFavoritePress = (e: any) => {
        e.stopPropagation()
        toggleFavorite(car.id)
    }

    // Sink effect when pressed
    const handlePressIn = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(shadowAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(translateYAnim, {
                toValue: 2,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start()
    }

    // Float effect when released
    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(shadowAnim, {
                toValue: 2,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.spring(translateYAnim, {
                toValue: 0,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start()
    }

    return (
        <Animated.View
            style={{
                transform: [
                    { scale: scaleAnim },
                    { translateY: translateYAnim }
                ],
            }}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={{
                    backgroundColor: colors.white,
                    borderRadius: 10,
                    padding: scale(16),
                    marginRight: isHorizontal ? scale(12) : 0,
                    marginBottom: scale(16),
                    width: isHorizontal ? horizontalCardWidth : "100%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: scale(12),
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: scale(16), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                            {car.name}
                        </Text>
                        <Text style={{ fontSize: scale(12), color: colors.placeholder }}>
                            {car.category ? car.category.toUpperCase() : "STANDARD"}
                        </Text>
                    </View>
                    <Pressable onPress={handleFavoritePress}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={scale(20)}
                            color={isLiked ? "#EF4444" : colors.placeholder}
                        />
                    </Pressable>
                </View>

                <Image
                    source={
                        car.image && (car.image.startsWith('http://') || car.image.startsWith('https://'))
                            ? { uri: car.image }
                            : getAsset(car.image) || require("../../../../assets/tesla-model-s-luxury.png")
                    }
                    style={{ width: "100%", height: scale(80), resizeMode: "contain", marginBottom: scale(16) }}
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(12) }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialIcons name="settings" size={scale(14)} color={colors.placeholder} />
                        <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(4) }}>
                            {car.transmission}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialIcons name="people" size={scale(14)} color={colors.placeholder} />
                        <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(4) }}>
                            {car.seats} People
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                        {car.price > 0 ? (
                            <Text style={{ fontSize: scale(16), fontWeight: "700", color: colors.primary }}>
                                {car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND
                                <Text style={{ fontSize: scale(12), fontWeight: "400", color: colors.placeholder }}>/day</Text>
                            </Text>
                        ) : (
                            <Text style={{ fontSize: scale(12), color: colors.placeholder }}>
                                Price on request
                            </Text>
                        )}
                    </View>
                    <Pressable
                        onPress={(e) => {
                            e.stopPropagation()
                            onRentPress()
                        }}
                        style={{
                            backgroundColor: colors.morentBlue,
                            paddingHorizontal: scale(16),
                            paddingVertical: scale(8),
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: colors.white, fontSize: scale(12), fontWeight: "600" }}>Rent Now</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Animated.View>
    )
}

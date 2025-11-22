import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { getAsset } from "../../../../lib/getAsset"
import type { Car } from "../../../../lib/api"

interface CarCardProps {
    car: Car
    isHorizontal?: boolean
    onPress: () => void
    onRentPress: () => void
}

export default function CarCard({ car, isHorizontal = false, onPress, onRentPress }: CarCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: scale(16),
                marginRight: isHorizontal ? scale(12) : 0,
                marginBottom: scale(16),
                width: isHorizontal ? scale(240) : "100%",
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
                <Ionicons name="heart-outline" size={scale(20)} color={colors.placeholder} />
            </View>

            <Image
                source={getAsset(car.image) || require("../../../../assets/tesla-model-s-luxury.png")}
                style={{ width: "100%", height: scale(80), resizeMode: "contain", marginBottom: scale(16) }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(12) }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name="local-gas-station" size={scale(14)} color={colors.placeholder} />
                    <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(4) }}>
                        {car.fuelType === "Electric" ? "90L" : "70L"}
                    </Text>
                </View>
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
                    <Text style={{ fontSize: scale(16), fontWeight: "700", color: colors.primary }}>
                        ${car.price}.00
                        <Text style={{ fontSize: scale(12), fontWeight: "400", color: colors.placeholder }}>/day</Text>
                    </Text>
                </View>
                <Pressable
                    onPress={onRentPress}
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
    )
}

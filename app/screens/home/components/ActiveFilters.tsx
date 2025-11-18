import React from "react"
import { View, Text, Pressable, ScrollView } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

interface ActiveFiltersProps {
    maxPrice: number | null
    selectedType: string | null
    selectedSeats: number | null
    onRemovePrice: () => void
    onRemoveType: () => void
    onRemoveSeats: () => void
    onClearAll: () => void
}

export default function ActiveFilters({
    maxPrice,
    selectedType,
    selectedSeats,
    onRemovePrice,
    onRemoveType,
    onRemoveSeats,
    onClearAll,
}: ActiveFiltersProps) {
    return (
        <View style={{ paddingHorizontal: scale(16), paddingBottom: scale(12), backgroundColor: colors.white }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: scale(8) }}>
                    {maxPrice && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: colors.morentBlue,
                                paddingHorizontal: scale(12),
                                paddingVertical: scale(6),
                                borderRadius: scale(16),
                            }}
                        >
                            <Text style={{ fontSize: scale(12), color: colors.white, marginRight: scale(6) }}>Max ${maxPrice}</Text>
                            <Pressable onPress={onRemovePrice}>
                                <MaterialIcons name="close" size={scale(14)} color={colors.white} />
                            </Pressable>
                        </View>
                    )}
                    {selectedType && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: colors.morentBlue,
                                paddingHorizontal: scale(12),
                                paddingVertical: scale(6),
                                borderRadius: scale(16),
                            }}
                        >
                            <Text style={{ fontSize: scale(12), color: colors.white, marginRight: scale(6) }}>{selectedType}</Text>
                            <Pressable onPress={onRemoveType}>
                                <MaterialIcons name="close" size={scale(14)} color={colors.white} />
                            </Pressable>
                        </View>
                    )}
                    {selectedSeats && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: colors.morentBlue,
                                paddingHorizontal: scale(12),
                                paddingVertical: scale(6),
                                borderRadius: scale(16),
                            }}
                        >
                            <Text style={{ fontSize: scale(12), color: colors.white, marginRight: scale(6) }}>
                                {selectedSeats} Seats
                            </Text>
                            <Pressable onPress={onRemoveSeats}>
                                <MaterialIcons name="close" size={scale(14)} color={colors.white} />
                            </Pressable>
                        </View>
                    )}
                    <Pressable
                        onPress={onClearAll}
                        style={{
                            paddingHorizontal: scale(12),
                            paddingVertical: scale(6),
                            borderRadius: scale(16),
                            borderWidth: 1,
                            borderColor: colors.morentBlue,
                        }}
                    >
                        <Text style={{ fontSize: scale(12), color: colors.morentBlue }}>Clear All</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

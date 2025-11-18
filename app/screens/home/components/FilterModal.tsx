import React from "react"
import { View, Text, Pressable, Modal, ScrollView } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

interface FilterModalProps {
    visible: boolean
    onClose: () => void
    maxPrice: number | null
    selectedType: string | null
    selectedSeats: number | null
    onPriceChange: (price: number | null) => void
    onTypeChange: (type: string | null) => void
    onSeatsChange: (seats: number | null) => void
    onClearAll: () => void
}

export default function FilterModal({
    visible,
    onClose,
    maxPrice,
    selectedType,
    selectedSeats,
    onPriceChange,
    onTypeChange,
    onSeatsChange,
    onClearAll,
}: FilterModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    justifyContent: "flex-end",
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderTopLeftRadius: scale(20),
                        borderTopRightRadius: scale(20),
                        padding: scale(20),
                        maxHeight: "80%",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: scale(20),
                        }}
                    >
                        <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary }}>Filters</Text>
                        <Pressable onPress={onClose}>
                            <MaterialIcons name="close" size={scale(24)} color={colors.primary} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Price Filter */}
                        <View style={{ marginBottom: scale(24) }}>
                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary, marginBottom: scale(12) }}>
                                Max Price per Day
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: scale(8) }}>
                                {[50, 100, 150, 200, 300].map((price) => (
                                    <Pressable
                                        key={price}
                                        onPress={() => onPriceChange(maxPrice === price ? null : price)}
                                        style={{
                                            paddingHorizontal: scale(16),
                                            paddingVertical: scale(10),
                                            borderRadius: scale(8),
                                            borderWidth: 1,
                                            borderColor: maxPrice === price ? colors.morentBlue : colors.border,
                                            backgroundColor: maxPrice === price ? colors.morentBlue : colors.white,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: scale(13),
                                                color: maxPrice === price ? colors.white : colors.primary,
                                                fontWeight: maxPrice === price ? "600" : "400",
                                            }}
                                        >
                                            ${price}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Car Type Filter */}
                        <View style={{ marginBottom: scale(24) }}>
                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary, marginBottom: scale(12) }}>
                                Car Type
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: scale(8) }}>
                                {["Sports", "SUV", "Sedan", "Luxury", "Electric"].map((type) => (
                                    <Pressable
                                        key={type}
                                        onPress={() => onTypeChange(selectedType === type ? null : type)}
                                        style={{
                                            paddingHorizontal: scale(16),
                                            paddingVertical: scale(10),
                                            borderRadius: scale(8),
                                            borderWidth: 1,
                                            borderColor: selectedType === type ? colors.morentBlue : colors.border,
                                            backgroundColor: selectedType === type ? colors.morentBlue : colors.white,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: scale(13),
                                                color: selectedType === type ? colors.white : colors.primary,
                                                fontWeight: selectedType === type ? "600" : "400",
                                            }}
                                        >
                                            {type}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Seats Filter */}
                        <View style={{ marginBottom: scale(24) }}>
                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary, marginBottom: scale(12) }}>
                                Number of Seats
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: scale(8) }}>
                                {[2, 4, 5, 6, 7, 8].map((seats) => (
                                    <Pressable
                                        key={seats}
                                        onPress={() => onSeatsChange(selectedSeats === seats ? null : seats)}
                                        style={{
                                            paddingHorizontal: scale(16),
                                            paddingVertical: scale(10),
                                            borderRadius: scale(8),
                                            borderWidth: 1,
                                            borderColor: selectedSeats === seats ? colors.morentBlue : colors.border,
                                            backgroundColor: selectedSeats === seats ? colors.morentBlue : colors.white,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: scale(13),
                                                color: selectedSeats === seats ? colors.white : colors.primary,
                                                fontWeight: selectedSeats === seats ? "600" : "400",
                                            }}
                                        >
                                            {seats} Seats
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={{ flexDirection: "row", gap: scale(12), marginTop: scale(16) }}>
                        <Pressable
                            onPress={() => {
                                onClearAll()
                                onClose()
                            }}
                            style={{
                                flex: 1,
                                paddingVertical: scale(14),
                                borderRadius: scale(8),
                                borderWidth: 1,
                                borderColor: colors.morentBlue,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.morentBlue }}>Clear All</Text>
                        </Pressable>
                        <Pressable
                            onPress={onClose}
                            style={{
                                flex: 1,
                                paddingVertical: scale(14),
                                borderRadius: scale(8),
                                backgroundColor: colors.morentBlue,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.white }}>Apply Filters</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

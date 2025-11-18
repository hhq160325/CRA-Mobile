import React from "react"
import { View, Text } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

const chartData = [
    { label: "Sport Car", value: 17439, color: "#1E3A8A" },
    { label: "SUV", value: 9478, color: "#3B82F6" },
    { label: "Coupe", value: 18197, color: "#60A5FA" },
    { label: "Hatchback", value: 12310, color: "#93C5FD" },
    { label: "MPV", value: 14406, color: "#DBEAFE" },
]

export default function DonutChart() {
    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
        <View style={{ alignItems: "center" }}>
            <View
                style={{
                    width: scale(150),
                    height: scale(150),
                    borderRadius: scale(75),
                    backgroundColor: colors.background,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: scale(16),
                    borderWidth: scale(20),
                    borderColor: "#3563E9",
                    position: "relative",
                }}
            >
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: scale(24), fontWeight: "700", color: colors.primary }}>
                        {total.toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: scale(12), color: colors.placeholder, marginTop: scale(4) }}>Rental Car</Text>
                </View>
            </View>

            <View style={{ width: "100%" }}>
                {chartData.map((item, index) => (
                    <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(12) }}>
                        <View
                            style={{
                                width: scale(12),
                                height: scale(12),
                                borderRadius: scale(2),
                                backgroundColor: item.color,
                                marginRight: scale(12),
                            }}
                        />
                        <Text style={{ fontSize: scale(12), color: colors.primary, fontWeight: "500", flex: 1 }}>{item.label}</Text>
                        <Text style={{ fontSize: scale(12), color: colors.placeholder, fontWeight: "600" }}>
                            {item.value.toLocaleString()}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

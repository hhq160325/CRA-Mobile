import React, { useState, useEffect } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import { carsService } from "../../../../lib/api"

interface ChartDataItem {
    label: string
    value: number
    color: string
}

const categoryColors: Record<string, string> = {
    "Sport": "#1E3A8A",
    "SUV": "#3B82F6",
    "Coupe": "#60A5FA",
    "Sedan": "#93C5FD",
    "Hatchback": "#DBEAFE",
    "MPV": "#BFDBFE",
    "Luxury": "#1E40AF",
    "Electric": "#3B82F6",
}

export default function DonutChart() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCarStatistics()
    }, [])

    const loadCarStatistics = async () => {
        try {
            const { data, error } = await carsService.getCars({})

            if (data && data.length > 0) {
                // Count cars by category
                const categoryCounts: Record<string, number> = {}

                data.forEach(car => {
                    const category = car.category || "Other"
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1
                })

                // Convert to chart data format
                const chartItems: ChartDataItem[] = Object.entries(categoryCounts)
                    .map(([label, value]) => ({
                        label,
                        value,
                        color: categoryColors[label] || "#94A3B8"
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5) // Top 5 categories

                setChartData(chartItems)
            }
        } catch (err) {
            console.error("Error loading car statistics:", err)
        } finally {
            setLoading(false)
        }
    }

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    if (loading) {
        return (
            <View style={{ alignItems: "center", paddingVertical: scale(40) }}>
                <ActivityIndicator size="small" color={colors.morentBlue} />
                <Text style={{ marginTop: scale(8), color: colors.placeholder, fontSize: scale(12) }}>
                    Loading statistics...
                </Text>
            </View>
        )
    }

    if (chartData.length === 0) {
        return (
            <View style={{ alignItems: "center", paddingVertical: scale(40) }}>
                <Text style={{ color: colors.placeholder, fontSize: scale(14) }}>
                    No data available
                </Text>
            </View>
        )
    }

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
                {chartData.map((item) => (
                    <View key={item.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(12) }}>
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

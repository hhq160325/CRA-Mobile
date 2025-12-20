import { View, Text, ActivityIndicator } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../../theme/colors"

interface DistanceCardProps {
    distanceInKm: number | null | undefined
    calculatingDistance: boolean
    t: (key: string) => string
}

export default function DistanceCard({ distanceInKm, calculatingDistance, t }: DistanceCardProps) {
    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            padding: 12,
            marginTop: 16,
            borderLeftWidth: 4,
            borderLeftColor: colors.morentBlue
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="straighten" size={24} color={colors.morentBlue} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 4 }}>
                        Distance from Park Lot
                    </Text>
                    {calculatingDistance ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={colors.morentBlue} />
                            <Text style={{ fontSize: 14, color: colors.placeholder, marginLeft: 8 }}>
                                Calculating...
                            </Text>
                        </View>
                    ) : distanceInKm !== null && distanceInKm !== undefined && distanceInKm > 0 ? (
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                            {distanceInKm.toFixed(2)} km
                        </Text>
                    ) : (
                        <Text style={{ fontSize: 14, color: colors.placeholder }}>
                            Enter custom pickup address
                        </Text>
                    )}
                </View>
            </View>
            {distanceInKm !== null && distanceInKm !== undefined && distanceInKm > 0 && (
                <View style={{
                    backgroundColor: '#E3F2FD',
                    padding: 8,
                    borderRadius: 6,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <MaterialIcons name="local-shipping" size={16} color={colors.morentBlue} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 11, color: colors.morentBlue, flex: 1 }}>
                        Shipping fee: {Math.round(distanceInKm * 20000).toLocaleString()} VND (distance × 20,000 VND/km)
                    </Text>
                </View>
            )}
        </View>
    )
}

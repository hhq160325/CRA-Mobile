import { View, Text } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { Car } from "../../../../lib/api"

interface CarSpecificationsProps {
    car: Car
}

export default function CarSpecifications({ car }: CarSpecificationsProps) {
    return (
        <>
            {/* License Plate & Status */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: scale(8),
                gap: scale(12)
            }}>
                {car.licensePlate && (
                    <View style={{
                        backgroundColor: colors.background,
                        paddingHorizontal: scale(12),
                        paddingVertical: scale(6),
                        borderRadius: scale(6),
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <Text style={{ fontSize: scale(12), fontWeight: '600', color: colors.primary }}>
                            {car.licensePlate}
                        </Text>
                    </View>
                )}
                {car.status && (
                    <View style={{
                        backgroundColor: car.status === 'Active' ? '#E8F5E9' : '#FFF3E0',
                        paddingHorizontal: scale(12),
                        paddingVertical: scale(6),
                        borderRadius: scale(6)
                    }}>
                        <Text style={{
                            fontSize: scale(12),
                            fontWeight: '600',
                            color: car.status === 'Active' ? '#4CAF50' : '#FF9800'
                        }}>
                            {car.status}
                        </Text>
                    </View>
                )}
            </View>

            {/* Specs */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: scale(20),
                paddingVertical: scale(16),
                backgroundColor: colors.background,
                borderRadius: scale(8)
            }}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Fuel</Text>
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.fuelType}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Transmission</Text>
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.transmission}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Seats</Text>
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.seats}</Text>
                </View>
            </View>

            {/* Additional Specs */}
            {car.fuelConsumption && (
                <View style={{
                    marginTop: scale(12),
                    paddingVertical: scale(12),
                    paddingHorizontal: scale(16),
                    backgroundColor: colors.background,
                    borderRadius: scale(8)
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: scale(13), color: colors.placeholder }}>Fuel Consumption</Text>
                        <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>
                            {car.fuelConsumption} L/100km
                        </Text>
                    </View>
                </View>
            )}

            {/* Parking Lot Information */}
            {car.preferredLot && (
                <View style={{
                    marginTop: scale(16),
                    padding: scale(16),
                    backgroundColor: colors.background,
                    borderRadius: scale(8),
                    borderLeftWidth: 4,
                    borderLeftColor: colors.morentBlue
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(8) }}>
                        <Icon name="local-parking" size={scale(20)} color={colors.morentBlue} />
                        <Text style={{
                            fontSize: scale(15),
                            fontWeight: '600',
                            color: colors.primary,
                            marginLeft: scale(8)
                        }}>
                            Parking Location
                        </Text>
                    </View>
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary, marginBottom: scale(4) }}>
                        {car.preferredLot.name}
                    </Text>
                    <Text style={{ fontSize: scale(13), color: colors.placeholder, marginBottom: scale(2) }}>
                        {car.preferredLot.address}
                    </Text>
                    <Text style={{ fontSize: scale(13), color: colors.placeholder, marginBottom: scale(8) }}>
                        {car.preferredLot.city}
                    </Text>
                    {car.preferredLot.contactNum && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4) }}>
                            <Icon name="phone" size={scale(14)} color={colors.placeholder} />
                            <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(6) }}>
                                {car.preferredLot.contactNum}
                            </Text>
                        </View>
                    )}
                    {car.preferredLot.notes && (
                        <Text style={{ fontSize: scale(12), color: colors.placeholder, marginTop: scale(6), fontStyle: 'italic' }}>
                            Note: {car.preferredLot.notes}
                        </Text>
                    )}
                </View>
            )}
        </>
    )
}

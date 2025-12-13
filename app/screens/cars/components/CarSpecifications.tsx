import { View, Text } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { Car } from "../../../../lib/api"
import { styles } from "../styles/carSpecifications.styles"

interface CarSpecificationsProps {
    car: Car
}

export default function CarSpecifications({ car }: CarSpecificationsProps) {
    return (
        <>
            {/* License Plate & Status */}
            <View style={styles.licensePlateContainer}>
                {car.licensePlate && (
                    <View style={styles.licensePlate}>
                        <Text style={styles.licensePlateText}>
                            {car.licensePlate}
                        </Text>
                    </View>
                )}
                {car.status && (
                    <View style={car.status === 'Active' ? styles.statusActive : styles.statusInactive}>
                        <Text style={car.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive}>
                            {car.status}
                        </Text>
                    </View>
                )}
            </View>

            {/* Specs */}
            <View style={styles.specsContainer}>
                <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Fuel</Text>
                    <Text style={styles.specValue}>{car.fuelType}</Text>
                </View>
                <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Transmission</Text>
                    <Text style={styles.specValue}>{car.transmission}</Text>
                </View>
                <View style={styles.specItem}>
                    <Text style={styles.specLabel}>Seats</Text>
                    <Text style={styles.specValue}>{car.seats}</Text>
                </View>
            </View>

            {/* Additional Specs */}
            {car.fuelConsumption && (
                <View style={styles.fuelConsumptionContainer}>
                    <View style={styles.fuelConsumptionRow}>
                        <Text style={styles.fuelConsumptionLabel}>Fuel Consumption</Text>
                        <Text style={styles.fuelConsumptionValue}>
                            {car.fuelConsumption} L/100km
                        </Text>
                    </View>
                </View>
            )}

            {/* Parking Lot Information */}
            {car.preferredLot && (
                <View style={styles.parkingContainer}>
                    <View style={styles.parkingHeader}>
                        <Icon name="local-parking" size={scale(20)} color={colors.morentBlue} />
                        <Text style={styles.parkingTitle}>
                            Parking Location
                        </Text>
                    </View>
                    <Text style={styles.parkingName}>
                        {car.preferredLot.name}
                    </Text>
                    <Text style={styles.parkingAddress}>
                        {car.preferredLot.address}
                    </Text>
                    <Text style={styles.parkingCity}>
                        {car.preferredLot.city}
                    </Text>
                    {car.preferredLot.contactNum && (
                        <View style={styles.parkingContact}>
                            <Icon name="phone" size={scale(14)} color={colors.placeholder} />
                            <Text style={styles.parkingContactText}>
                                {car.preferredLot.contactNum}
                            </Text>
                        </View>
                    )}
                    {car.preferredLot.notes && (
                        <Text style={styles.parkingNotes}>
                            Note: {car.preferredLot.notes}
                        </Text>
                    )}
                </View>
            )}
        </>
    )
}

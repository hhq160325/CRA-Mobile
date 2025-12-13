import { View, Text } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"
import { styles } from "../styles/carAmenities.styles"

export default function CarAmenities() {
    const amenities = [
        { icon: 'bluetooth', label: 'Bluetooth' },
        { icon: 'camera-rear', label: 'Rear camera' },
        { icon: 'wb-sunny', label: 'Sunroof' },
        { icon: 'navigation', label: 'GPS navigation' },
        { icon: 'toll', label: 'ETC' },
        { icon: 'tv', label: 'DVD screen' },
        { icon: 'album', label: 'Spare tire' },
        { icon: 'usb', label: 'USB slot' },
        { icon: 'security', label: 'Airbag' }
    ]

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Other Amenities
            </Text>
            <View style={styles.amenitiesContainer}>
                {amenities.map((amenity, index) => (
                    <View
                        key={index}
                        style={styles.amenityItem}
                    >
                        <Icon name={amenity.icon} size={scale(16)} color={colors.morentBlue} />
                        <Text style={styles.amenityText}>
                            {amenity.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

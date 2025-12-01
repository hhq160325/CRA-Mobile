import { View, Text } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"

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
        <View style={{ marginTop: scale(20) }}>
            <Text style={{
                fontSize: scale(16),
                fontWeight: '600',
                color: colors.primary,
                marginBottom: scale(12)
            }}>
                Other Amenities
            </Text>
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: scale(8)
            }}>
                {amenities.map((amenity, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.background,
                            paddingHorizontal: scale(12),
                            paddingVertical: scale(8),
                            borderRadius: scale(20),
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <Icon name={amenity.icon} size={scale(16)} color={colors.morentBlue} />
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.primary,
                            marginLeft: scale(6),
                            fontWeight: '500'
                        }}>
                            {amenity.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

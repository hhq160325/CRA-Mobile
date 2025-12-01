import { Modal, View, Text, Pressable, ScrollView } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"

interface CarTermsModalProps {
    visible: boolean
    onClose: () => void
}

export default function CarTermsModal({ visible, onClose }: CarTermsModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" }}
                onPress={onClose}
            >
                <View
                    style={{ backgroundColor: colors.white, borderRadius: 16, padding: scale(20), width: "90%", maxWidth: scale(400), maxHeight: "80%" }}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(16) }}>
                        <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary }}>General Terms</Text>
                        <Pressable onPress={onClose}>
                            <Icon name="close" size={scale(24)} color={colors.placeholder} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ backgroundColor: '#E3F2FD', padding: scale(16), borderRadius: scale(8), marginBottom: scale(16) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(8) }}>
                                <Icon name="payment" size={scale(20)} color={colors.morentBlue} />
                                <Text style={{ fontSize: scale(15), fontWeight: '600', color: colors.morentBlue, marginLeft: scale(8) }}>Payment</Text>
                            </View>
                            <Text style={{ fontSize: scale(13), color: colors.primary, lineHeight: scale(20) }}>
                                Pay the rental fee immediately upon receiving the car.
                            </Text>
                        </View>

                        <View style={{ backgroundColor: colors.background, padding: scale(16), borderRadius: scale(8), marginBottom: scale(16) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(12) }}>
                                <Icon name="rule" size={scale(20)} color="#F57C00" />
                                <Text style={{ fontSize: scale(15), fontWeight: '600', color: colors.primary, marginLeft: scale(8) }}>Other regulations</Text>
                            </View>
                            <View style={{ marginLeft: scale(8) }}>
                                {[
                                    "Use the car for the right purpose.",
                                    "Do not use the rented car for illegal or unlawful purposes.",
                                    "Do not use the rented car as collateral or mortgage.",
                                    "Do not smoke, spit out gum, or litter in the car.",
                                    "Do not carry flammable or explosive prohibited goods.",
                                    "Do not carry fruit or strong-smelling food in the car.",
                                    "When returning the car, if the car is dirty or has an odor, the customer must clean the car or pay an additional cleaning fee."
                                ].map((rule, index) => (
                                    <View key={index} style={{ flexDirection: 'row', marginBottom: scale(8) }}>
                                        <Text style={{ color: colors.primary, marginRight: scale(8) }}>-</Text>
                                        <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>{rule}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#E8F5E9', padding: scale(16), borderRadius: scale(8), alignItems: 'center' }}>
                            <Icon name="favorite" size={scale(24)} color="#4CAF50" style={{ marginBottom: scale(8) }} />
                            <Text style={{ fontSize: scale(14), color: '#2E7D32', textAlign: 'center', lineHeight: scale(20) }}>
                                Sincerely thank you, wish you a wonderful trip!
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>
    )
}

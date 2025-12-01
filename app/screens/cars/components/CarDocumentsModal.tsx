import { Modal, View, Text, Pressable, ScrollView } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"

interface CarDocumentsModalProps {
    visible: boolean
    onClose: () => void
}

export default function CarDocumentsModal({ visible, onClose }: CarDocumentsModalProps) {
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
                        <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary }}>
                            Car Rental Documents
                        </Text>
                        <Pressable onPress={onClose}>
                            <Icon name="close" size={scale(24)} color={colors.placeholder} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ backgroundColor: '#E8F5E9', padding: scale(16), borderRadius: scale(8), marginBottom: scale(16) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(12) }}>
                                <Icon name="check-circle" size={scale(20)} color="#4CAF50" />
                                <Text style={{ fontSize: scale(15), fontWeight: '600', color: '#2E7D32', marginLeft: scale(8) }}>
                                    You have a chip-embedded ID card
                                </Text>
                            </View>
                            <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary, marginBottom: scale(8) }}>
                                Car rental documents include:
                            </Text>
                            <View style={{ marginLeft: scale(8) }}>
                                <View style={{ flexDirection: 'row', marginBottom: scale(8) }}>
                                    <Text style={{ color: colors.primary, marginRight: scale(8) }}>•</Text>
                                    <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                                        Driver's license (car owner compares the original or electronic copy (view on VN-eID/VN-eTraffic) with the verified driver's license information on the Mioto app & sends it back to you)
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: colors.primary, marginRight: scale(8) }}>•</Text>
                                    <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                                        Chip-embedded ID card (car owner compares the original with personal information on VN-eID & sends it back to you)
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#FFF3E0', padding: scale(16), borderRadius: scale(8) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(12) }}>
                                <Icon name="info" size={scale(20)} color="#F57C00" />
                                <Text style={{ fontSize: scale(15), fontWeight: '600', color: '#E65100', marginLeft: scale(8) }}>
                                    You do not have a chip-embedded ID card
                                </Text>
                            </View>
                            <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary, marginBottom: scale(8) }}>
                                Car rental documents include:
                            </Text>
                            <View style={{ marginLeft: scale(8) }}>
                                <View style={{ flexDirection: 'row', marginBottom: scale(8) }}>
                                    <Text style={{ color: colors.primary, marginRight: scale(8) }}>•</Text>
                                    <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                                        Driver's license (car owner compares the original or electronic copy (view on VN-eID/VN-eTraffic) with the verified driver's license information on the Mioto app & sends it back to you)
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: colors.primary, marginRight: scale(8) }}>•</Text>
                                    <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                                        Passport (car owner checks the original, keeps it & returns it when you return the car)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>
    )
}

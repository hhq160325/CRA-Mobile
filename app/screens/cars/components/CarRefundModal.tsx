import { Modal, View, Text, Pressable, ScrollView } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"

interface CarRefundModalProps {
    visible: boolean
    onClose: () => void
}

export default function CarRefundModal({ visible, onClose }: CarRefundModalProps) {
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
                        <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary, flex: 1 }}>
                            Refund & Cancellation Compensation Procedure
                        </Text>
                        <Pressable onPress={onClose}>
                            <Icon name="close" size={scale(24)} color={colors.placeholder} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ backgroundColor: '#E3F2FD', padding: scale(16), borderRadius: scale(8), marginBottom: scale(16) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(8) }}>
                                <Icon name="account-balance" size={scale(20)} color={colors.morentBlue} style={{ marginRight: scale(8), marginTop: scale(2) }} />
                                <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                                    Mioto will refund the deposit (& compensation for cancellation by the car owner (if any) according to the cancellation policy) via the renter's bank account within <Text style={{ fontWeight: '700' }}>1-3 working days</Text> from the time of cancellation.
                                </Text>
                            </View>
                        </View>

                        <View style={{ backgroundColor: '#FFF3E0', padding: scale(16), borderRadius: scale(8), borderLeftWidth: 4, borderLeftColor: '#F57C00' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(12) }}>
                                <Text style={{ color: '#F57C00', marginRight: scale(8), fontSize: scale(14) }}>*</Text>
                                <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                                    Mioto staff will contact the renter (via the phone number registered on Mioto) to request bank account information, or the renter can proactively send information to Mioto via:
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: scale(12), borderRadius: scale(8), marginBottom: scale(8) }}>
                                <Icon name="email" size={scale(20)} color={colors.morentBlue} style={{ marginRight: scale(12) }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: scale(11), color: colors.placeholder, marginBottom: scale(2) }}>Email</Text>
                                    <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.morentBlue }}>contact@mioto.vn</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: scale(12), borderRadius: scale(8) }}>
                                <Icon name="facebook" size={scale(20)} color="#1877F2" style={{ marginRight: scale(12) }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: scale(11), color: colors.placeholder, marginBottom: scale(2) }}>Facebook</Text>
                                    <Text style={{ fontSize: scale(13), fontWeight: '600', color: '#1877F2' }}>Mioto Fanpage</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: scale(16), padding: scale(16), backgroundColor: '#E8F5E9', borderRadius: scale(8), alignItems: 'center' }}>
                            <Icon name="support-agent" size={scale(24)} color="#4CAF50" style={{ marginBottom: scale(8) }} />
                            <Text style={{ fontSize: scale(12), color: '#2E7D32', textAlign: 'center', lineHeight: scale(18) }}>
                                Our support team is ready to assist you with the refund process
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>
    )
}

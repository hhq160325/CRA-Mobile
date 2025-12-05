import { View, Text, Pressable } from "react-native"
import { colors } from "../../../theme/colors"

interface PaymentMethodStepProps {
    paymentMethod: string
    onPaymentMethodChange: (method: string) => void
}

export default function PaymentMethodStep({ paymentMethod, onPaymentMethodChange }: PaymentMethodStepProps) {
    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Payment Method</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 16 }}>
                Please enter your payment method
            </Text>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                <Pressable onPress={() => onPaymentMethodChange("qr-payos")} style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: paymentMethod === "qr-payos" ? colors.morentBlue : colors.border, marginRight: 12, justifyContent: "center", alignItems: "center" }}>
                        {paymentMethod === "qr-payos" && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.morentBlue }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600" }}>QR PayOS</Text>
                        <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Scan QR code to pay</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

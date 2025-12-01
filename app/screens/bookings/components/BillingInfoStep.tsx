import { View, Text, TextInput } from "react-native"
import { colors } from "../../../theme/colors"

interface BillingInfoStepProps {
    name: string
    address: string
    phone: string
    city: string
    onNameChange: (text: string) => void
    onAddressChange: (text: string) => void
    onPhoneChange: (text: string) => void
    onCityChange: (text: string) => void
}

export default function BillingInfoStep({
    name,
    address,
    phone,
    city,
    onNameChange,
    onAddressChange,
    onPhoneChange,
    onCityChange,
}: BillingInfoStepProps) {
    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Billing Info</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 16 }}>
                Please enter your billing info
            </Text>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Name</Text>
                <TextInput
                    placeholder="Your name"
                    value={name}
                    onChangeText={onNameChange}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 12 }}
                />

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Address</Text>
                <TextInput
                    placeholder="Address"
                    value={address}
                    onChangeText={onAddressChange}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 12 }}
                />

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Phone Number</Text>
                <TextInput
                    placeholder="Phone number"
                    value={phone}
                    onChangeText={onPhoneChange}
                    keyboardType="phone-pad"
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 12 }}
                />

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Town/City</Text>
                <TextInput
                    placeholder="Town or city"
                    value={city}
                    onChangeText={onCityChange}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12 }}
                />
            </View>
        </View>
    )
}

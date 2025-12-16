import { View, Text, TextInput } from "react-native"
import { colors } from "../../../theme/colors"

interface BillingInfoStepProps {
    name: string
    address: string
    phone: string
    city: string
    phoneError?: string
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
    phoneError,
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
                    placeholder="Phone number (must start with 0, max 10 digits)"
                    value={phone}
                    onChangeText={onPhoneChange}
                    keyboardType="numeric"
                    maxLength={10}
                    style={{
                        borderWidth: 1,
                        borderColor: phoneError ? '#FF6B6B' : colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: phoneError ? 4 : 16,
                        fontSize: 12
                    }}
                />
                {phoneError ? (
                    <Text style={{
                        fontSize: 11,
                        color: '#FF6B6B',
                        marginBottom: 16,
                        marginLeft: 4
                    }}>
                        {phoneError}
                    </Text>
                ) : null}

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

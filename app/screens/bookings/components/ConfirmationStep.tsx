import { View, Text, Pressable } from "react-native"
import { colors } from "../../../theme/colors"

interface ConfirmationStepProps {
    agreeMarketing: boolean
    agreeTerms: boolean
    onAgreeMarketingChange: (value: boolean) => void
    onAgreeTermsChange: (value: boolean) => void
}

export default function ConfirmationStep({
    agreeMarketing,
    agreeTerms,
    onAgreeMarketingChange,
    onAgreeTermsChange,
}: ConfirmationStepProps) {
    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Confirmation</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 16 }}>
                We are getting to the end. Just few clicks and your rental is ready!
            </Text>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <Pressable onPress={() => onAgreeMarketingChange(!agreeMarketing)} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 16 }}>
                    <View style={{ width: 18, height: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 4, marginRight: 12, marginTop: 2, justifyContent: "center", alignItems: "center", backgroundColor: agreeMarketing ? colors.morentBlue : colors.white }}>
                        {agreeMarketing && <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>}
                    </View>
                    <Text style={{ fontSize: 12, flex: 1, color: colors.primary }}>
                        I agree with sending an Marketing and newsletter emails. No spam, promised!
                    </Text>
                </Pressable>

                <Pressable onPress={() => onAgreeTermsChange(!agreeTerms)} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <View style={{ width: 18, height: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 4, marginRight: 12, marginTop: 2, justifyContent: "center", alignItems: "center", backgroundColor: agreeTerms ? colors.morentBlue : colors.white }}>
                        {agreeTerms && <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>}
                    </View>
                    <Text style={{ fontSize: 12, flex: 1, color: colors.primary }}>
                        I agree with our terms and conditions and privacy policy!
                    </Text>
                </Pressable>
            </View>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12, alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 4 }}>🛡️ All your data are safe</Text>
                <Text style={{ fontSize: 12, color: colors.placeholder, textAlign: "center" }}>
                    We are using the most advanced security to provide you the best experience ever.
                </Text>
            </View>
        </View>
    )
}

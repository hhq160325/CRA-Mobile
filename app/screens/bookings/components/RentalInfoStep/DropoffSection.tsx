import { View, Text, Pressable } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../../theme/colors"

interface DropoffSectionProps {
    dropoffLocation: string
    dropoffDate: string
    dropoffTime: string
    dropoffDateError: string
    dropoffTimeError: string
    onShowDateTimePicker: () => void
    t: (key: string) => string
}

export default function DropoffSection({
    dropoffLocation,
    dropoffDate,
    dropoffTime,
    dropoffDateError,
    dropoffTimeError,
    onShowDateTimePicker,
    t
}: DropoffSectionProps) {
    return (
        <View>
            <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 {t("dropOff")}</Text>

            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("locations")}</Text>
            <View style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                backgroundColor: '#f5f5f5'
            }}>
                <Text style={{ fontSize: 12, color: colors.placeholder }}>
                    {dropoffLocation || "Same as pickup location"}
                </Text>
            </View>

            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>
                {t("dateAndTime") || "Date & Time"}
            </Text>
            <Pressable
                onPress={onShowDateTimePicker}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: dropoffDateError || dropoffTimeError ? "#ef4444" : colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: dropoffDateError || dropoffTimeError ? 4 : 12,
                    backgroundColor: colors.white
                }}
            >
                <Text style={{ fontSize: 12, color: dropoffDate && dropoffTime ? colors.primary : colors.placeholder }}>
                    {dropoffDate && dropoffTime ? `${dropoffDate} ${dropoffTime}` : "Select date and time"}
                </Text>
                <MaterialIcons name="event" size={18} color={colors.morentBlue} />
            </Pressable>
            {(dropoffDateError || dropoffTimeError) && (
                <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
                    ⚠️ {dropoffDateError || dropoffTimeError}
                </Text>
            )}
        </View>
    )
}

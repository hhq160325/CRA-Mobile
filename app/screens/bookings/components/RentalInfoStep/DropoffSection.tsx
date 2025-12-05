import { View, Text, TextInput, Pressable } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../../theme/colors"
import LocationModeSelector from "./LocationModeSelector"

interface DropoffSectionProps {
    dropoffMode: "parklot" | "custom"
    dropoffLocation: string
    dropoffDate: string
    dropoffTime: string
    dropoffDateError: string
    dropoffTimeError: string
    onDropoffModeChange: (mode: "parklot" | "custom") => void
    onDropoffLocationChange: (text: string) => void
    onShowParkLotModal: () => void
    onShowDateTimePicker: () => void
    t: (key: string) => string
}

export default function DropoffSection({
    dropoffMode,
    dropoffLocation,
    dropoffDate,
    dropoffTime,
    dropoffDateError,
    dropoffTimeError,
    onDropoffModeChange,
    onDropoffLocationChange,
    onShowParkLotModal,
    onShowDateTimePicker,
    t
}: DropoffSectionProps) {
    return (
        <>
            <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 {t("dropOff")}</Text>

            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("locations")}</Text>

            <LocationModeSelector
                mode={dropoffMode}
                onModeChange={onDropoffModeChange}
                parkLotLabel={t("parkLot")}
                customLabel={t("customAddress")}
            />

            {dropoffMode === "parklot" ? (
                <Pressable
                    onPress={onShowParkLotModal}
                    style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: 12,
                        backgroundColor: colors.white
                    }}
                >
                    <Text style={{ fontSize: 12, color: dropoffLocation ? colors.primary : colors.placeholder }}>
                        {dropoffLocation || t("selectParkLot")}
                    </Text>
                </Pressable>
            ) : (
                <TextInput
                    placeholder={t("enterCustomAddress")}
                    value={dropoffLocation}
                    onChangeText={onDropoffLocationChange}
                    style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: 12,
                        fontSize: 12
                    }}
                />
            )}

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
        </>
    )
}

import { View, Text, TextInput, Pressable } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../../theme/colors"
import LocationModeSelector from "./LocationModeSelector"
import type { ParkLot } from "../../../../../lib/api"

interface PickupSectionProps {
    pickupMode: "parklot" | "custom"
    pickupLocation: string
    pickupDate: string
    pickupTime: string
    pickupDateError: string
    pickupTimeError: string
    selectedParkLot: ParkLot | null
    onPickupModeChange: (mode: "parklot" | "custom") => void
    onPickupLocationChange: (text: string) => void
    onShowParkLotModal: () => void
    onShowDateTimePicker: () => void
    t: (key: string) => string
}

export default function PickupSection({
    pickupMode,
    pickupLocation,
    pickupDate,
    pickupTime,
    pickupDateError,
    pickupTimeError,
    selectedParkLot,
    onPickupModeChange,
    onPickupLocationChange,
    onShowParkLotModal,
    onShowDateTimePicker,
    t
}: PickupSectionProps) {
    return (
        <View>
            <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 {t("pickUp")}</Text>

            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("locations")}</Text>

            <LocationModeSelector
                mode={pickupMode}
                onModeChange={onPickupModeChange}
                parkLotLabel={t("parkLot")}
                customLabel={t("customAddress")}
            />

            {pickupMode === "parklot" ? (
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
                    <Text style={{ fontSize: 12, color: pickupLocation ? colors.primary : colors.placeholder }}>
                        {pickupLocation || t("selectParkLot")}
                    </Text>
                </Pressable>
            ) : (
                <>
                    <Text style={{ fontSize: 11, color: colors.placeholder, marginBottom: 6 }}>
                        Step 1: Select park lot (starting point)
                    </Text>
                    <Pressable
                        onPress={onShowParkLotModal}
                        style={{
                            borderWidth: 1,
                            borderColor: selectedParkLot ? colors.morentBlue : colors.border,
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 12,
                            backgroundColor: colors.white
                        }}
                    >
                        <Text style={{ fontSize: 12, color: selectedParkLot ? colors.primary : colors.placeholder }}>
                            {selectedParkLot ? (selectedParkLot.address || selectedParkLot.name) : t("selectParkLot")}
                        </Text>
                    </Pressable>
                    <Text style={{ fontSize: 11, color: colors.placeholder, marginBottom: 6 }}>
                        Step 2: Enter custom pickup address
                    </Text>
                    <TextInput
                        placeholder={t("enterCustomAddress")}
                        value={pickupLocation}
                        onChangeText={onPickupLocationChange}
                        editable={!!selectedParkLot}
                        style={{
                            borderWidth: 1,
                            borderColor: selectedParkLot ? colors.border : colors.placeholder,
                            borderRadius: 6,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 12,
                            fontSize: 12,
                            backgroundColor: selectedParkLot ? colors.white : '#f5f5f5',
                            color: selectedParkLot ? colors.primary : colors.placeholder
                        }}
                    />
                </>
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
                    borderColor: pickupDateError || pickupTimeError ? "#ef4444" : colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: pickupDateError || pickupTimeError ? 4 : 12,
                    backgroundColor: colors.white
                }}
            >
                <Text style={{ fontSize: 12, color: pickupDate && pickupTime ? colors.primary : colors.placeholder }}>
                    {pickupDate && pickupTime ? `${pickupDate} ${pickupTime}` : "Select date and time"}
                </Text>
                <MaterialIcons name="event" size={18} color={colors.morentBlue} />
            </Pressable>
            {(pickupDateError || pickupTimeError) && (
                <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
                    ⚠️ {pickupDateError || pickupTimeError}
                </Text>
            )}
        </View>
    )
}

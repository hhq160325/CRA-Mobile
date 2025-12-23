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
    onShowDateTimePicker
}: PickupSectionProps) {
    return (
        <View>
            <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 Pick Up</Text>

            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Location</Text>

            <LocationModeSelector
                mode={pickupMode}
                onModeChange={onPickupModeChange}
                parkLotLabel="Park Lot"
                customLabel="Custom Address"
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
                        {pickupLocation || "Select Park Lot"}
                    </Text>
                </Pressable>
            ) : (
                <TextInput
                    placeholder="Enter custom pickup address"
                    value={pickupLocation}
                    onChangeText={onPickupLocationChange}
                    multiline={true}
                    numberOfLines={2}
                    textAlignVertical="top"
                    style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: 12,
                        fontSize: 12,
                        backgroundColor: colors.white,
                        color: colors.primary,
                        minHeight: 60,
                        maxHeight: 100
                    }}
                />
            )}

            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>
                Date & Time
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

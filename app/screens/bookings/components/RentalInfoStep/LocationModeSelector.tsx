import { View, Text, Pressable } from "react-native"
import { colors } from "../../../../theme/colors"

interface LocationModeSelectorProps {
    mode: "parklot" | "custom"
    onModeChange: (mode: "parklot" | "custom") => void
    parkLotLabel: string
    customLabel: string
}

export default function LocationModeSelector({
    mode,
    onModeChange,
    parkLotLabel,
    customLabel
}: LocationModeSelectorProps) {
    return (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <Pressable
                onPress={() => onModeChange("parklot")}
                style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: mode === "parklot" ? colors.morentBlue : colors.background,
                    borderWidth: 1,
                    borderColor: mode === "parklot" ? colors.morentBlue : colors.border
                }}
            >
                <Text style={{
                    fontSize: 11,
                    textAlign: "center",
                    color: mode === "parklot" ? colors.white : colors.primary
                }}>
                    {parkLotLabel}
                </Text>
            </Pressable>
            <Pressable
                onPress={() => onModeChange("custom")}
                style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor: mode === "custom" ? colors.morentBlue : colors.background,
                    borderWidth: 1,
                    borderColor: mode === "custom" ? colors.morentBlue : colors.border
                }}
            >
                <Text style={{
                    fontSize: 11,
                    textAlign: "center",
                    color: mode === "custom" ? colors.white : colors.primary
                }}>
                    {customLabel}
                </Text>
            </Pressable>
        </View>
    )
}

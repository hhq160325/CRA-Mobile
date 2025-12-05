import { View, Text, Modal, Pressable, FlatList, ActivityIndicator } from "react-native"
import { colors } from "../../../../theme/colors"
import type { ParkLot } from "../../../../../lib/api"

interface ParkLotModalProps {
    visible: boolean
    loading: boolean
    parkLots: ParkLot[]
    title: string
    emptyText: string
    onClose: () => void
    onSelect: (parkLot: ParkLot) => void
}

export default function ParkLotModal({
    visible,
    loading,
    parkLots,
    title,
    emptyText,
    onClose,
    onSelect
}: ParkLotModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                <View style={{
                    backgroundColor: colors.white,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    maxHeight: "70%",
                    paddingTop: 16
                }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingBottom: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border
                    }}>
                        <Text style={{ fontSize: 16, fontWeight: "700" }}>{title}</Text>
                        <Pressable onPress={onClose}>
                            <Text style={{ fontSize: 18, color: colors.placeholder }}>✕</Text>
                        </Pressable>
                    </View>
                    {loading ? (
                        <View style={{ padding: 32, alignItems: "center" }}>
                            <ActivityIndicator size="large" color={colors.morentBlue} />
                        </View>
                    ) : (
                        <FlatList
                            data={parkLots}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => onSelect(item)}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border
                                    }}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                                        {item.name}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: colors.placeholder }}>
                                        {item.address}
                                    </Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <View style={{ padding: 32, alignItems: "center" }}>
                                    <Text style={{ color: colors.placeholder }}>{emptyText}</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    )
}

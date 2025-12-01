import { View, Text, TextInput, Pressable, Modal, FlatList, ActivityIndicator, Platform } from "react-native"
import { useState, useEffect } from "react"
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors } from "../../../theme/colors"
import { parkLotService, type ParkLot } from "../../../../lib/api"
import { useLanguage } from "../../../../lib/language-context"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import CustomDateTimePicker from "./CustomDateTimePicker"

interface RentalInfoStepProps {
    pickupLocation: string
    pickupDate: string
    pickupTime: string
    dropoffLocation: string
    dropoffDate: string
    dropoffTime: string
    pickupDateError: string
    pickupTimeError: string
    dropoffDateError: string
    dropoffTimeError: string
    onPickupLocationChange: (text: string) => void
    onPickupDateChange: (text: string) => void
    onPickupTimeChange: (text: string) => void
    onDropoffLocationChange: (text: string) => void
    onDropoffDateChange: (text: string) => void
    onDropoffTimeChange: (text: string) => void
}

export default function RentalInfoStep({
    pickupLocation,
    pickupDate,
    pickupTime,
    dropoffLocation,
    dropoffDate,
    dropoffTime,
    pickupDateError,
    pickupTimeError,
    dropoffDateError,
    dropoffTimeError,
    onPickupLocationChange,
    onPickupDateChange,
    onPickupTimeChange,
    onDropoffLocationChange,
    onDropoffDateChange,
    onDropoffTimeChange,
}: RentalInfoStepProps) {
    const [parkLots, setParkLots] = useState<ParkLot[]>([])
    const [loading, setLoading] = useState(false)
    const [showPickupModal, setShowPickupModal] = useState(false)
    const [showDropoffModal, setShowDropoffModal] = useState(false)
    const [pickupMode, setPickupMode] = useState<"parklot" | "custom">("parklot")
    const [dropoffMode, setDropoffMode] = useState<"parklot" | "custom">("parklot")
    const [showPickupDatePicker, setShowPickupDatePicker] = useState(false)
    const [showPickupTimePicker, setShowPickupTimePicker] = useState(false)
    const [showDropoffDatePicker, setShowDropoffDatePicker] = useState(false)
    const [showCustomPickupPicker, setShowCustomPickupPicker] = useState(false)
    const [showCustomDropoffPicker, setShowCustomDropoffPicker] = useState(false)
    const [showDropoffTimePicker, setShowDropoffTimePicker] = useState(false)
    const { t } = useLanguage()

    useEffect(() => {
        fetchParkLots()
    }, [])

    const fetchParkLots = async () => {
        setLoading(true)
        const result = await parkLotService.getAllParkLots()
        if (result.data) {
            setParkLots(result.data)
        }
        setLoading(false)
    }

    const handleSelectPickupParkLot = (parkLot: ParkLot) => {
        onPickupLocationChange(parkLot.address || parkLot.name)
        setShowPickupModal(false)
    }

    const handleSelectDropoffParkLot = (parkLot: ParkLot) => {
        onDropoffLocationChange(parkLot.address || parkLot.name)
        setShowDropoffModal(false)
    }

    // Parse date string to Date object
    const parseDate = (dateStr: string): Date => {
        if (!dateStr) return new Date()
        const parsed = new Date(dateStr)
        return isNaN(parsed.getTime()) ? new Date() : parsed
    }

    // Parse time string to Date object (for time picker)
    const parseTime = (timeStr: string): Date => {
        const now = new Date()
        if (!timeStr) return now
        const [hours, minutes] = timeStr.split(':').map(Number)
        if (isNaN(hours) || isNaN(minutes)) return now
        now.setHours(hours, minutes, 0, 0)
        return now
    }

    // Format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Format time to HH:MM
    const formatTime = (date: Date): string => {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const handlePickupDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowPickupDatePicker(false)
            return
        }
        if (selectedDate) {
            onPickupDateChange(formatDate(selectedDate))
        }
        if (Platform.OS === 'android') {
            setShowPickupDatePicker(false)
        }
    }

    const handlePickupTimeChange = (event: any, selectedTime?: Date) => {
        if (event.type === 'dismissed') {
            setShowPickupTimePicker(false)
            return
        }
        if (selectedTime) {
            onPickupTimeChange(formatTime(selectedTime))
        }
        if (Platform.OS === 'android') {
            setShowPickupTimePicker(false)
        }
    }

    const handleDropoffDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShowDropoffDatePicker(false)
            return
        }
        if (selectedDate) {
            onDropoffDateChange(formatDate(selectedDate))
        }
        if (Platform.OS === 'android') {
            setShowDropoffDatePicker(false)
        }
    }

    const handleDropoffTimeChange = (event: any, selectedTime?: Date) => {
        if (event.type === 'dismissed') {
            setShowDropoffTimePicker(false)
            return
        }
        if (selectedTime) {
            onDropoffTimeChange(formatTime(selectedTime))
        }
        if (Platform.OS === 'android') {
            setShowDropoffTimePicker(false)
        }
    }

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>{t("rentalInfo")}</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 16 }}>
                {t("rentalInfoDesc")}
            </Text>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 {t("pickUp")}</Text>

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("locations")}</Text>

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                    <Pressable
                        onPress={() => setPickupMode("parklot")}
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: pickupMode === "parklot" ? colors.morentBlue : colors.background, borderWidth: 1, borderColor: pickupMode === "parklot" ? colors.morentBlue : colors.border }}
                    >
                        <Text style={{ fontSize: 11, textAlign: "center", color: pickupMode === "parklot" ? colors.white : colors.primary }}>{t("parkLot")}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setPickupMode("custom")}
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: pickupMode === "custom" ? colors.morentBlue : colors.background, borderWidth: 1, borderColor: pickupMode === "custom" ? colors.morentBlue : colors.border }}
                    >
                        <Text style={{ fontSize: 11, textAlign: "center", color: pickupMode === "custom" ? colors.white : colors.primary }}>{t("customAddress")}</Text>
                    </Pressable>
                </View>

                {pickupMode === "parklot" ? (
                    <Pressable
                        onPress={() => setShowPickupModal(true)}
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, backgroundColor: colors.white }}
                    >
                        <Text style={{ fontSize: 12, color: pickupLocation ? colors.primary : colors.placeholder }}>
                            {pickupLocation || t("selectParkLot")}
                        </Text>
                    </Pressable>
                ) : (
                    <TextInput
                        placeholder={t("enterCustomAddress")}
                        value={pickupLocation}
                        onChangeText={onPickupLocationChange}
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 12 }}
                    />
                )}

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("dateAndTime") || "Date & Time"}</Text>
                <Pressable
                    onPress={() => setShowCustomPickupPicker(true)}
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
                {(pickupDateError || pickupTimeError) ? <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 12 }}>⚠️ {pickupDateError || pickupTimeError}</Text> : null}
                {showPickupDatePicker && Platform.OS === 'ios' && (
                    <Modal transparent animationType="slide">
                        <Pressable
                            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onPress={() => setShowPickupDatePicker(false)}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View style={{
                                    backgroundColor: colors.white,
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    paddingBottom: 20
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border
                                    }}>
                                        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>{t("selectDate") || "Select Date"}</Text>
                                        <Pressable
                                            onPress={() => setShowPickupDatePicker(false)}
                                            style={{
                                                backgroundColor: colors.morentBlue,
                                                paddingHorizontal: 20,
                                                paddingVertical: 8,
                                                borderRadius: 8
                                            }}
                                        >
                                            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                                                {t("done") || "Done"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <View style={{ paddingVertical: 10 }}>
                                        <DateTimePicker
                                            value={parseDate(pickupDate)}
                                            mode="date"
                                            display="spinner"
                                            onChange={handlePickupDateChange}
                                            minimumDate={new Date()}
                                            textColor={colors.primary}
                                            themeVariant="light"
                                        />
                                    </View>
                                </View>
                            </Pressable>
                        </Pressable>
                    </Modal>
                )}
                {showPickupDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={parseDate(pickupDate)}
                        mode="date"
                        display="default"
                        onChange={handlePickupDateChange}
                        minimumDate={new Date()}
                    />
                )}


                {showPickupTimePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={parseTime(pickupTime)}
                        mode="time"
                        display="default"
                        onChange={handlePickupTimeChange}
                        is24Hour={true}
                    />
                )}

                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 {t("dropOff")}</Text>

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("locations")}</Text>

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                    <Pressable
                        onPress={() => setDropoffMode("parklot")}
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: dropoffMode === "parklot" ? colors.morentBlue : colors.background, borderWidth: 1, borderColor: dropoffMode === "parklot" ? colors.morentBlue : colors.border }}
                    >
                        <Text style={{ fontSize: 11, textAlign: "center", color: dropoffMode === "parklot" ? colors.white : colors.primary }}>{t("parkLot")}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setDropoffMode("custom")}
                        style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: dropoffMode === "custom" ? colors.morentBlue : colors.background, borderWidth: 1, borderColor: dropoffMode === "custom" ? colors.morentBlue : colors.border }}
                    >
                        <Text style={{ fontSize: 11, textAlign: "center", color: dropoffMode === "custom" ? colors.white : colors.primary }}>{t("customAddress")}</Text>
                    </Pressable>
                </View>

                {dropoffMode === "parklot" ? (
                    <Pressable
                        onPress={() => setShowDropoffModal(true)}
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, backgroundColor: colors.white }}
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
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 12 }}
                    />
                )}

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("dateAndTime") || "Date & Time"}</Text>
                <Pressable
                    onPress={() => setShowCustomDropoffPicker(true)}
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
                {(dropoffDateError || dropoffTimeError) ? <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 12 }}>⚠️ {dropoffDateError || dropoffTimeError}</Text> : null}
                {showDropoffDatePicker && Platform.OS === 'ios' && (
                    <Modal transparent animationType="slide">
                        <Pressable
                            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onPress={() => setShowDropoffDatePicker(false)}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View style={{
                                    backgroundColor: colors.white,
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    paddingBottom: 20
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border
                                    }}>
                                        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>{t("selectDate") || "Select Date"}</Text>
                                        <Pressable
                                            onPress={() => setShowDropoffDatePicker(false)}
                                            style={{
                                                backgroundColor: colors.morentBlue,
                                                paddingHorizontal: 20,
                                                paddingVertical: 8,
                                                borderRadius: 8
                                            }}
                                        >
                                            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                                                {t("done") || "Done"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <View style={{ paddingVertical: 10 }}>
                                        <DateTimePicker
                                            value={parseDate(dropoffDate)}
                                            mode="date"
                                            display="spinner"
                                            onChange={handleDropoffDateChange}
                                            minimumDate={parseDate(pickupDate) || new Date()}
                                            textColor={colors.primary}
                                            themeVariant="light"
                                        />
                                    </View>
                                </View>
                            </Pressable>
                        </Pressable>
                    </Modal>
                )}
                {showDropoffDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={parseDate(dropoffDate)}
                        mode="date"
                        display="default"
                        onChange={handleDropoffDateChange}
                        minimumDate={parseDate(pickupDate) || new Date()}
                    />
                )}

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("time")}</Text>
                <Pressable
                    onPress={() => setShowDropoffTimePicker(true)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: dropoffTimeError ? "#ef4444" : colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        marginBottom: dropoffTimeError ? 4 : 0,
                        backgroundColor: colors.white
                    }}
                >
                    <Text style={{ fontSize: 12, color: dropoffTime ? colors.primary : colors.placeholder }}>
                        {dropoffTime || "HH:MM (e.g., 14:30)"}
                    </Text>
                    <MaterialIcons name="access-time" size={18} color={colors.morentBlue} />
                </Pressable>
                {dropoffTimeError ? <Text style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>⚠️ {dropoffTimeError}</Text> : null}
                {showDropoffTimePicker && Platform.OS === 'ios' && (
                    <Modal transparent animationType="slide">
                        <Pressable
                            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onPress={() => setShowDropoffTimePicker(false)}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <View style={{
                                    backgroundColor: colors.white,
                                    borderTopLeftRadius: 20,
                                    borderTopRightRadius: 20,
                                    paddingBottom: 20
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border
                                    }}>
                                        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>{t("selectTime") || "Select Time"}</Text>
                                        <Pressable
                                            onPress={() => setShowDropoffTimePicker(false)}
                                            style={{
                                                backgroundColor: colors.morentBlue,
                                                paddingHorizontal: 20,
                                                paddingVertical: 8,
                                                borderRadius: 8
                                            }}
                                        >
                                            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                                                {t("done") || "Done"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <View style={{ paddingVertical: 10 }}>
                                        <DateTimePicker
                                            value={parseTime(dropoffTime)}
                                            mode="time"
                                            display="spinner"
                                            onChange={handleDropoffTimeChange}
                                            is24Hour={true}
                                            textColor={colors.primary}
                                            themeVariant="light"
                                        />
                                    </View>
                                </View>
                            </Pressable>
                        </Pressable>
                    </Modal>
                )}
                {showDropoffTimePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={parseTime(dropoffTime)}
                        mode="time"
                        display="default"
                        onChange={handleDropoffTimeChange}
                        is24Hour={true}
                    />
                )}
            </View>

            {/* Pickup Location Modal */}
            <Modal visible={showPickupModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                    <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "70%", paddingTop: 16 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("selectPickupLocation")}</Text>
                            <Pressable onPress={() => setShowPickupModal(false)}>
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
                                        onPress={() => handleSelectPickupParkLot(item)}
                                        style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                    >
                                        <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4 }}>{item.name}</Text>
                                        <Text style={{ fontSize: 12, color: colors.placeholder }}>{item.address}</Text>
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <View style={{ padding: 32, alignItems: "center" }}>
                                        <Text style={{ color: colors.placeholder }}>{t("noParkLots")}</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Dropoff Location Modal */}
            <Modal visible={showDropoffModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                    <View style={{ backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "70%", paddingTop: 16 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ fontSize: 16, fontWeight: "700" }}>{t("selectDropoffLocation")}</Text>
                            <Pressable onPress={() => setShowDropoffModal(false)}>
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
                                        onPress={() => handleSelectDropoffParkLot(item)}
                                        style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                    >
                                        <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4 }}>{item.name}</Text>
                                        <Text style={{ fontSize: 12, color: colors.placeholder }}>{item.address}</Text>
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <View style={{ padding: 32, alignItems: "center" }}>
                                        <Text style={{ color: colors.placeholder }}>{t("noParkLots")}</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Custom Pickup Date & Time Picker */}
            <CustomDateTimePicker
                visible={showCustomPickupPicker}
                onClose={() => setShowCustomPickupPicker(false)}
                onConfirm={(date, time) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    onPickupDateChange(`${year}-${month}-${day}`);
                    onPickupTimeChange(time);
                    setShowCustomPickupPicker(false);
                }}
                initialDate={pickupDate ? new Date(pickupDate) : new Date()}
                initialTime={pickupTime || '06:00'}
                minimumDate={new Date()}
                title={t("selectPickupDateTime") || "Select Pickup Date & Time"}
            />

            {/* Custom Dropoff Date & Time Picker */}
            <CustomDateTimePicker
                visible={showCustomDropoffPicker}
                onClose={() => setShowCustomDropoffPicker(false)}
                onConfirm={(date, time) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    onDropoffDateChange(`${year}-${month}-${day}`);
                    onDropoffTimeChange(time);
                    setShowCustomDropoffPicker(false);
                }}
                initialDate={dropoffDate ? new Date(dropoffDate) : pickupDate ? new Date(pickupDate) : new Date()}
                initialTime={dropoffTime || '23:00'}
                minimumDate={pickupDate ? new Date(pickupDate) : new Date()}
                title={t("selectDropoffDateTime") || "Select Dropoff Date & Time"}
            />
        </View>
    )
}

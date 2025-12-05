import { View, Text } from "react-native"
import { useState, useEffect } from "react"
import { colors } from "../../../../theme/colors"
import { parkLotService, type ParkLot } from "../../../../../lib/api"
import { useLanguage } from "../../../../../lib/language-context"
import CustomDateTimePicker from "../CustomDateTimePicker"
import ParkLotModal from "./ParkLotModal"
import PickupSection from "./PickupSection"
import DropoffSection from "./DropoffSection"
import DistanceCard from "./DistanceCard"
import type { RentalInfoStepProps } from "./types"

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
    pickupMode,
    dropoffMode,
    distanceInKm,
    onPickupLocationChange,
    onPickupDateChange,
    onPickupTimeChange,
    onDropoffLocationChange,
    onDropoffDateChange,
    onDropoffTimeChange,
    onPickupModeChange,
    onDropoffModeChange,
    onCalculateDistance,
}: RentalInfoStepProps) {
    const [parkLots, setParkLots] = useState<ParkLot[]>([])
    const [loading, setLoading] = useState(false)
    const [showPickupModal, setShowPickupModal] = useState(false)
    const [calculatingDistance, setCalculatingDistance] = useState(false)
    const [showCustomPickupPicker, setShowCustomPickupPicker] = useState(false)
    const [showCustomDropoffPicker, setShowCustomDropoffPicker] = useState(false)
    const [selectedParkLot, setSelectedParkLot] = useState<ParkLot | null>(null)
    const { t } = useLanguage()

    useEffect(() => {
        fetchParkLots()
    }, [])

    // Auto-sync dropoff location with pickup location
    useEffect(() => {
        if (pickupLocation && pickupMode === "parklot") {
            // When pickup location changes in park lot mode, auto-set dropoff to same location
            onDropoffLocationChange(pickupLocation)
        }
    }, [pickupLocation, pickupMode])

    // Calculate distance when pickup is custom and user enters address
    useEffect(() => {
        const shouldCalculate =
            pickupMode === "custom" &&
            selectedParkLot &&
            pickupLocation.trim().length > 5 &&
            onCalculateDistance

        if (shouldCalculate) {
            const timer = setTimeout(async () => {
                setCalculatingDistance(true)
                await onCalculateDistance(selectedParkLot.address || selectedParkLot.name)
                setCalculatingDistance(false)
            }, 1500)

            return () => clearTimeout(timer)
        }
    }, [pickupLocation, pickupMode, selectedParkLot, onCalculateDistance])

    const fetchParkLots = async () => {
        setLoading(true)
        const result = await parkLotService.getAllParkLots()
        if (result.data) {
            setParkLots(result.data)
        }
        setLoading(false)
    }

    const handleSelectPickupParkLot = (parkLot: ParkLot) => {
        setSelectedParkLot(parkLot)
        const parkLotAddress = parkLot.address || parkLot.name

        if (pickupMode === "parklot") {
            onPickupLocationChange(parkLotAddress)
            // Auto-set dropoff to same location
            onDropoffLocationChange(parkLotAddress)
        }
        setShowPickupModal(false)
    }

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>{t("rentalInfo")}</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 16 }}>
                {t("rentalInfoDesc")}
            </Text>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                <PickupSection
                    pickupMode={pickupMode}
                    pickupLocation={pickupLocation}
                    pickupDate={pickupDate}
                    pickupTime={pickupTime}
                    pickupDateError={pickupDateError}
                    pickupTimeError={pickupTimeError}
                    selectedParkLot={selectedParkLot}
                    onPickupModeChange={onPickupModeChange}
                    onPickupLocationChange={onPickupLocationChange}
                    onShowParkLotModal={() => setShowPickupModal(true)}
                    onShowDateTimePicker={() => setShowCustomPickupPicker(true)}
                    t={t}
                />

                <DropoffSection
                    dropoffLocation={dropoffLocation}
                    dropoffDate={dropoffDate}
                    dropoffTime={dropoffTime}
                    dropoffDateError={dropoffDateError}
                    dropoffTimeError={dropoffTimeError}
                    onShowDateTimePicker={() => setShowCustomDropoffPicker(true)}
                    t={t}
                />
            </View>

            {/* Pickup Location Modal */}
            <ParkLotModal
                visible={showPickupModal}
                loading={loading}
                parkLots={parkLots}
                title={t("selectPickupLocation")}
                emptyText={t("noParkLots")}
                onClose={() => setShowPickupModal(false)}
                onSelect={handleSelectPickupParkLot}
            />

            {/* Custom Pickup Date & Time Picker */}
            <CustomDateTimePicker
                visible={showCustomPickupPicker}
                onClose={() => setShowCustomPickupPicker(false)}
                onConfirm={(date, time) => {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    onPickupDateChange(`${year}-${month}-${day}`)
                    onPickupTimeChange(time)
                    setShowCustomPickupPicker(false)
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
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    onDropoffDateChange(`${year}-${month}-${day}`)
                    onDropoffTimeChange(time)
                    setShowCustomDropoffPicker(false)
                }}
                initialDate={dropoffDate ? new Date(dropoffDate) : pickupDate ? new Date(pickupDate) : new Date()}
                initialTime={dropoffTime || '23:00'}
                minimumDate={pickupDate ? new Date(pickupDate) : new Date()}
                title={t("selectDropoffDateTime") || "Select Dropoff Date & Time"}
            />

            {/* Distance Display */}
            {pickupMode === "custom" && selectedParkLot && (
                <DistanceCard
                    distanceInKm={distanceInKm}
                    calculatingDistance={calculatingDistance}
                    t={t}
                />
            )}
        </View>
    )
}

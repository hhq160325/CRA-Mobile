import { View, Text } from "react-native"
import { useState, useEffect } from "react"
import { parkLotService, type ParkLot } from "../../../../../lib/api"
import CustomDateTimePicker from "../CustomDateTimePicker"
import ParkLotModal from "./ParkLotModal"
import PickupSection from "./PickupSection"
import DropoffSection from "./DropoffSection"
import DistanceCard from "./DistanceCard"
import type { RentalInfoStepProps } from "./types"
import { styles } from "./styles"

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
    const [showCustomPickupPicker, setShowCustomPickupPicker] = useState(false)
    const [showCustomDropoffPicker, setShowCustomDropoffPicker] = useState(false)
    const [selectedParkLot, setSelectedParkLot] = useState<ParkLot | null>(null)

    useEffect(() => {
        fetchParkLots()
    }, [])


    useEffect(() => {
        if (pickupLocation && pickupMode === "parklot") {

            onDropoffLocationChange(pickupLocation)
        }
    }, [pickupLocation, pickupMode])




    const fetchParkLots = async () => {
        setLoading(true)
        const result = await parkLotService.getAllParkLots()
        if (result.data) {
            setParkLots(result.data)


            if (!selectedParkLot && !pickupLocation) {
                const thuDucLot = result.data.find(lot => lot.name === "ThuDucLot")
                if (thuDucLot) {
                    setSelectedParkLot(thuDucLot)
                    const parkLotAddress = thuDucLot.address || thuDucLot.name
                    onPickupLocationChange(parkLotAddress)
                    onDropoffLocationChange(parkLotAddress)
                }
            }
        }
        setLoading(false)
    }

    const handleSelectPickupParkLot = (parkLot: ParkLot) => {
        setSelectedParkLot(parkLot)
        const parkLotAddress = parkLot.address || parkLot.name

        if (pickupMode === "parklot") {
            onPickupLocationChange(parkLotAddress)

            onDropoffLocationChange(parkLotAddress)
        }
        setShowPickupModal(false)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rental Information</Text>
            <Text style={styles.description}>
                Please specify your pick-up and drop-off location and date & time.
            </Text>

            <View style={styles.contentCard}>
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
                    onDropoffLocationChange={onDropoffLocationChange}
                    t={t}
                />
            </View>

            {/* Pickup Location Modal */}
            <ParkLotModal
                visible={showPickupModal}
                loading={loading}
                parkLots={parkLots}
                title="Select Pickup Location"
                emptyText="No park lots available"
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
                title="Select Pickup Date & Time"
                isPickup={true}
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
                title="Select Dropoff Date & Time"
                isPickup={false}
            />


        </View>
    )
}

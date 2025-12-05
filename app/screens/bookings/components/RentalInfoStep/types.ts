export interface RentalInfoStepProps {
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
    pickupMode: "parklot" | "custom"
    dropoffMode: "parklot" | "custom"
    distanceInKm?: number | null
    onPickupLocationChange: (text: string) => void
    onPickupDateChange: (text: string) => void
    onPickupTimeChange: (text: string) => void
    onDropoffLocationChange: (text: string) => void
    onDropoffDateChange: (text: string) => void
    onDropoffTimeChange: (text: string) => void
    onPickupModeChange: (mode: "parklot" | "custom") => void
    onDropoffModeChange: (mode: "parklot" | "custom") => void
    onCalculateDistance?: (parkLotAddress: string) => void
}

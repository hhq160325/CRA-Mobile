import { locationService } from '../../../../lib/api';


export const handleCalculateDistance = async (
    parkLotAddress: string,
    pickupMode: string,
    pickupLocation: string,
    setDistanceInKm: (distance: number | null) => void
) => {
    console.log('handleCalculateDistance called', {
        pickupMode,
        parkLotAddress,
        customPickupAddress: pickupLocation,
    });

    if (
        pickupMode === 'custom' &&
        parkLotAddress.trim() &&
        pickupLocation.trim()
    ) {
        console.log('Calculating distance from park lot to custom pickup address...');

        try {
            const result = await locationService.getDistanceBetweenAddresses(
                parkLotAddress,
                pickupLocation,
            );

            console.log('Distance API result:', result);

            if (result.data && result.data.distanceInMeters) {
                const distanceInKm = result.data.distanceInMeters / 1000;
                console.log(' Distance calculated:', distanceInKm, 'km');
                setDistanceInKm(distanceInKm);
            } else {
                console.log(' Could not calculate distance - no data');
                setDistanceInKm(null);
            }
        } catch (error) {
            console.error(' Error calculating distance:', error);
            setDistanceInKm(null);
        }
    } else {
        console.log('Resetting distance - pickup not custom or addresses empty');
        setDistanceInKm(null);
    }
};


export const calculateShippingDistance = async (
    pickupMode: string,
    pickupLocation: string,
    setDistanceInKm: (distance: number | null) => void
) => {
    if (
        pickupMode === 'custom' &&
        pickupLocation &&
        pickupLocation.trim().length > 5
    ) {
        try {
            const thuDucLotAddress = 'An Tư Công Chúa, Phường Linh Xuân, Thành phố Hồ Chí Minh';

            console.log('Calculating shipping distance from ThuDucLot to:', pickupLocation);

            const result = await locationService.getDistanceBetweenAddresses(
                thuDucLotAddress,
                pickupLocation,
            );

            if (result.data && result.data.distanceInMeters) {
                const distanceInKm = result.data.distanceInMeters / 1000;
                console.log(' Shipping distance calculated:', distanceInKm, 'km');
                setDistanceInKm(distanceInKm);
            } else {
                console.log(' Could not calculate shipping distance');
                setDistanceInKm(null);
            }
        } catch (error) {
            console.error(' Error calculating shipping distance:', error);
            setDistanceInKm(null);
        }
    } else if (pickupMode === 'parklot') {
        setDistanceInKm(null);
    }
};

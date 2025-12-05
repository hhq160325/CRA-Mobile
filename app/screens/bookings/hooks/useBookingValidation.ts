import {Alert} from 'react-native';
import {locationService} from '../../../../lib/api';

export function useBookingValidation() {
  const validateDateTime = (
    date: string,
    time: string,
    fieldName: string,
  ): Date | null => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert(
        'Error',
        `${fieldName} date must be in format YYYY-MM-DD (e.g., 2025-11-23)`,
      );
      return null;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert(
        'Error',
        `${fieldName} time must be in format HH:MM (e.g., 14:30)`,
      );
      return null;
    }

    const [hours, minutes] = time.split(':');
    const paddedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    const dateTimeString = `${date}T${paddedTime}:00`;
    const dateTime = new Date(dateTimeString);

    if (isNaN(dateTime.getTime())) {
      Alert.alert('Error', `Invalid ${fieldName} date or time`);
      return null;
    }

    console.log(`${fieldName} datetime:`, {
      input: `${date} ${time}`,
      parsed: dateTimeString,
      result: dateTime.toISOString(),
    });

    return dateTime;
  };

  const validateUUID = (id: string, fieldName: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      Alert.alert('Error', `Invalid ${fieldName}. Please try again.`);
      return false;
    }
    return true;
  };

  const validateStep1 = (
    name: string,
    address: string,
    phone: string,
    city: string,
  ): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    return true;
  };

  const validateAddress = async (
    address: string,
    fieldName: string,
  ): Promise<boolean> => {
    console.log(`Validating ${fieldName} address:`, address);

    const result = await locationService.getCoordinatesFromAddress(address);

    if (result.error || !result.data) {
      console.log(`${fieldName} address validation failed:`, result.error);
      Alert.alert(
        'Invalid Address',
        `Unable to find coordinates for ${fieldName} address: "${address}". Please check the address and try again.`,
      );
      return false;
    }

    console.log(`${fieldName} address validated:`, result.data);
    return true;
  };

  const validateStep2 = async (
    pickupLocation: string,
    pickupDate: string,
    pickupTime: string,
    dropoffLocation: string,
    dropoffDate: string,
    dropoffTime: string,
    pickupMode?: 'parklot' | 'custom',
    dropoffMode?: 'parklot' | 'custom',
    onDistanceCalculated?: (distanceInKm: number) => void,
  ): Promise<{
    valid: boolean;
    pickupDateTime?: Date;
    dropoffDateTime?: Date;
  }> => {
    if (!pickupLocation.trim()) {
      Alert.alert('Error', 'Please enter pick-up location');
      return {valid: false};
    }
    if (!pickupDate.trim() || !pickupTime.trim()) {
      Alert.alert('Error', 'Please enter pick-up date and time');
      return {valid: false};
    }
    if (!dropoffLocation.trim()) {
      Alert.alert('Error', 'Please enter drop-off location');
      return {valid: false};
    }
    if (!dropoffDate.trim() || !dropoffTime.trim()) {
      Alert.alert('Error', 'Please enter drop-off date and time');
      return {valid: false};
    }

    if (pickupMode === 'custom') {
      const isValid = await validateAddress(pickupLocation, 'Pick-up');
      if (!isValid) return {valid: false};
    }

    if (dropoffMode === 'custom') {
      const isValid = await validateAddress(dropoffLocation, 'Drop-off');
      if (!isValid) return {valid: false};
    }

    if (
      pickupMode === 'custom' &&
      dropoffMode === 'custom' &&
      onDistanceCalculated
    ) {
      console.log('Calculating distance between custom addresses');
      const distanceResult = await locationService.getDistanceBetweenAddresses(
        pickupLocation,
        dropoffLocation,
      );

      if (distanceResult.data && distanceResult.data.distanceInMeters) {
        const distanceInKm = distanceResult.data.distanceInMeters / 1000;
        console.log('Distance calculated:', distanceInKm, 'km');
        onDistanceCalculated(distanceInKm);
      } else {
        console.log('Could not calculate distance, but continuing');
        onDistanceCalculated(0);
      }
    } else {
      if (onDistanceCalculated) {
        onDistanceCalculated(0);
      }
    }

    const pickupDateTime = validateDateTime(pickupDate, pickupTime, 'Pick-up');
    if (!pickupDateTime) return {valid: false};

    const dropoffDateTime = validateDateTime(
      dropoffDate,
      dropoffTime,
      'Drop-off',
    );
    if (!dropoffDateTime) return {valid: false};

    const now = new Date();
    if (pickupDateTime < now) {
      Alert.alert('Error', 'Pick-up date and time cannot be in the past');
      return {valid: false};
    }

    if (dropoffDateTime <= pickupDateTime) {
      Alert.alert(
        'Error',
        'Drop-off date and time must be after pick-up date and time',
      );
      return {valid: false};
    }

    const durationHours =
      (dropoffDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1) {
      Alert.alert('Error', 'Minimum rental duration is 1 hour');
      return {valid: false};
    }

    return {valid: true, pickupDateTime, dropoffDateTime};
  };

  const validateStep3 = (paymentMethod: string): boolean => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }
    return true;
  };

  const validateStep4 = (
    agreeMarketing: boolean,
    agreeTerms: boolean,
  ): boolean => {
    if (!agreeMarketing) {
      Alert.alert('Error', 'Please agree to marketing terms');
      return false;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to terms and conditions');
      return false;
    }
    return true;
  };

  return {
    validateDateTime,
    validateUUID,
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateAddress,
  };
}

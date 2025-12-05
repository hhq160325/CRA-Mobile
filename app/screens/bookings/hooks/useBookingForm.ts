import {useState} from 'react';
import {Alert} from 'react-native';

export function useBookingForm() {
  const getDefaultDates = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(10, 0, 0, 0);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      pickupDate: formatDate(tomorrow),
      pickupTime: '10:00',
      dropoffDate: formatDate(dayAfter),
      dropoffTime: '10:00',
    };
  };

  const defaults = getDefaultDates();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState(defaults.pickupDate);
  const [pickupTime, setPickupTime] = useState(defaults.pickupTime);
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffDate, setDropoffDate] = useState(defaults.dropoffDate);
  const [dropoffTime, setDropoffTime] = useState(defaults.dropoffTime);
  const [pickupDateError, setPickupDateError] = useState('');
  const [pickupTimeError, setPickupTimeError] = useState('');
  const [dropoffDateError, setDropoffDateError] = useState('');
  const [dropoffTimeError, setDropoffTimeError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('qr-payos');
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [pickupMode, setPickupMode] = useState<'parklot' | 'custom'>('parklot');
  const [dropoffMode, setDropoffMode] = useState<'parklot' | 'custom'>(
    'parklot',
  );
  const [distanceInKm, setDistanceInKm] = useState<number | null>(null);

  const validateDateFormat = (date: string): string => {
    if (!date) return '';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return 'Format phải là YYYY-MM-DD (ví dụ: 2025-11-23)';
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }
    return '';
  };

  const validateTimeFormat = (time: string): string => {
    if (!time) return '';
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return 'Format phải là HH:MM (ví dụ: 14:30)';
    }
    return '';
  };

  const handlePickupDateChange = (text: string) => {
    setPickupDate(text);
    setPickupDateError(validateDateFormat(text));
  };

  const handlePickupTimeChange = (text: string) => {
    setPickupTime(text);
    setPickupTimeError(validateTimeFormat(text));
  };

  const handleDropoffDateChange = (text: string) => {
    setDropoffDate(text);
    setDropoffDateError(validateDateFormat(text));
  };

  const handleDropoffTimeChange = (text: string) => {
    setDropoffTime(text);
    setDropoffTimeError(validateTimeFormat(text));
  };

  const handleApplyPromo = (subtotal: number) => {
    if (promoCode.toLowerCase() === 'save10') {
      setDiscount(subtotal * 0.1);
      Alert.alert('Success', '10% discount applied!');
    } else {
      Alert.alert('Invalid', 'Promo code not found');
    }
  };

  return {
    name,
    setName,
    address,
    setAddress,
    phone,
    setPhone,
    city,
    setCity,
    pickupLocation,
    setPickupLocation,
    pickupDate,
    pickupTime,
    dropoffLocation,
    setDropoffLocation,
    dropoffDate,
    dropoffTime,
    pickupDateError,
    pickupTimeError,
    dropoffDateError,
    dropoffTimeError,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
    paymentMethod,
    setPaymentMethod,
    agreeMarketing,
    setAgreeMarketing,
    agreeTerms,
    setAgreeTerms,
    pickupMode,
    setPickupMode,
    dropoffMode,
    setDropoffMode,
    distanceInKm,
    setDistanceInKm,
    handlePickupDateChange,
    handlePickupTimeChange,
    handleDropoffDateChange,
    handleDropoffTimeChange,
    handleApplyPromo,
  };
}

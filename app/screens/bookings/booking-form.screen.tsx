'use client';

import {useState, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  bookingsService,
  carsService,
  userService,
  locationService,
  type Car,
} from '../../../lib/api';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {colors} from '../../theme/colors';
import getAsset from '../../../lib/getAsset';
import Header from '../../components/Header/Header';
import {useAuth} from '../../../lib/auth-context';

import RentalSummaryCard from './components/RentalSummaryCard';
import BillingInfoStep from './components/BillingInfoStep';
import RentalInfoStep from './components/RentalInfoStep';
import PaymentMethodStep from './components/PaymentMethodStep';
import ConfirmationStep from './components/ConfirmationStep';

import {useBookingForm} from './hooks/useBookingForm';
import {useBookingValidation} from './hooks/useBookingValidation';
import {useLanguage} from '../../../lib/language-context';

export default function BookingFormScreen({route}: any) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {user} = useAuth();
  const {t} = useLanguage();
  const carId = route?.params?.id;
  const [car, setCar] = useState<Car | null>(null);
  const [carLoading, setCarLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const formState = useBookingForm();
  const validation = useBookingValidation();

  useEffect(() => {
    if (route?.params?.pickupLocation)
      formState.setPickupLocation(route.params.pickupLocation);
    if (route?.params?.dropoffLocation)
      formState.setDropoffLocation(route.params.dropoffLocation);
  }, [route?.params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!carId) return;
      setCarLoading(true);

      const {data} = await carsService.getCarById(carId);
      if (data) setCar(data);

      if (user?.id) {
        try {
          const userResult = await userService.getUserById(user.id);
          if (userResult.data) {
            const userData = userResult.data;
            formState.setName(
              userData.fullname || userData.username || user.name || '',
            );
            formState.setAddress(userData.address || '');
            formState.setPhone(userData.phoneNumber || user.phone || '');

            if (userData.address) {
              const addressParts = userData.address.split(',');
              if (addressParts.length > 0) {
                formState.setCity(addressParts[addressParts.length - 1].trim());
              }
            }
          }
        } catch (err) {
          console.log('Could not fetch user profile, using auth context data');
          formState.setName(user.username || user.name || '');
          formState.setAddress(user.address || '');
          formState.setPhone(user.phone || '');
        }
      }

      setCarLoading(false);
    };
    fetchData();
  }, [carId, user?.id]);

  const subtotal = car ? car.price * 1 : 0;
  const tax = 0;

  const shippingFee =
    formState.pickupMode === 'custom' && formState.distanceInKm
      ? Math.round(formState.distanceInKm * 20000)
      : 0;

  const bookingFee = Math.round(subtotal * 0.15) + shippingFee;

  const total = subtotal + tax + shippingFee - formState.discount;

  const handleCalculateDistance = async (parkLotAddress: string) => {
    console.log('handleCalculateDistance called', {
      pickupMode: formState.pickupMode,
      parkLotAddress,
      customPickupAddress: formState.pickupLocation,
    });

    if (
      formState.pickupMode === 'custom' &&
      parkLotAddress.trim() &&
      formState.pickupLocation.trim()
    ) {
      console.log(
        'Calculating distance from park lot to custom pickup address...',
      );

      try {
        const result = await locationService.getDistanceBetweenAddresses(
          parkLotAddress,
          formState.pickupLocation,
        );

        console.log('Distance API result:', result);

        if (result.data && result.data.distanceInMeters) {
          const distanceInKm = result.data.distanceInMeters / 1000;
          console.log('✅ Distance calculated:', distanceInKm, 'km');
          formState.setDistanceInKm(distanceInKm);
        } else {
          console.log('❌ Could not calculate distance - no data');
          formState.setDistanceInKm(null);
        }
      } catch (error) {
        console.error('❌ Error calculating distance:', error);
        formState.setDistanceInKm(null);
      }
    } else {
      console.log('Resetting distance - pickup not custom or addresses empty');
      formState.setDistanceInKm(null);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (
        validation.validateStep1(
          formState.name,
          formState.address,
          formState.phone,
          formState.city,
        )
      ) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setLoading(true);
      const result = await validation.validateStep2(
        formState.pickupLocation,
        formState.pickupDate,
        formState.pickupTime,
        formState.dropoffLocation,
        formState.dropoffDate,
        formState.dropoffTime,
        formState.pickupMode,
        formState.dropoffMode,
        distance => formState.setDistanceInKm(distance),
      );
      setLoading(false);
      if (result.valid) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validation.validateStep3(formState.paymentMethod)) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      if (
        validation.validateStep4(formState.agreeMarketing, formState.agreeTerms)
      ) {
        handleCreate();
      }
    }
  };

  const handleCreate = async () => {
    if (!user?.id || !validation.validateUUID(user.id, 'User ID')) return;
    if (!carId || !validation.validateUUID(carId, 'Car ID')) return;

    setLoading(true);
    try {
      const step2Validation = await validation.validateStep2(
        formState.pickupLocation,
        formState.pickupDate,
        formState.pickupTime,
        formState.dropoffLocation,
        formState.dropoffDate,
        formState.dropoffTime,
        formState.pickupMode,
        formState.dropoffMode,
        distance => formState.setDistanceInKm(distance),
      );

      if (
        !step2Validation.valid ||
        !step2Validation.pickupDateTime ||
        !step2Validation.dropoffDateTime
      ) {
        setLoading(false);
        return;
      }

      const pickupDateTime = step2Validation.pickupDateTime;
      const dropoffDateTime = step2Validation.dropoffDateTime;

      if (
        !formState.pickupLocation.trim() ||
        !formState.dropoffLocation.trim()
      ) {
        Alert.alert('Error', 'Pick-up and drop-off locations are required');
        setLoading(false);
        return;
      }

      const durationMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
      const rentime = Math.max(
        1,
        Math.ceil(durationMs / (1000 * 60 * 60 * 24)),
      );
      const carPrice = car?.price || 0;

      if (carPrice <= 0) {
        Alert.alert('Error', 'Invalid car rental price');
        setLoading(false);
        return;
      }

      const bookingData = {
        customerId: String(user.id),
        carId: String(carId),
        pickupPlace: String(formState.pickupLocation.trim()),
        pickupTime: pickupDateTime.toISOString(),
        dropoffPlace: String(formState.dropoffLocation.trim()),
        dropoffTime: dropoffDateTime.toISOString(),
        bookingFee: 15,
        carRentPrice: Math.floor(Number(carPrice)),
        rentime: Number(rentime),
        rentType: 'daily',
        request: 'Standard rental request',
      };

      console.log(
        'Creating booking with data:',
        JSON.stringify(bookingData, null, 2),
      );
      console.log('Data types:', {
        customerId: typeof bookingData.customerId,
        carId: typeof bookingData.carId,
        pickupPlace: typeof bookingData.pickupPlace,
        pickupTime: typeof bookingData.pickupTime,
        dropoffPlace: typeof bookingData.dropoffPlace,
        dropoffTime: typeof bookingData.dropoffTime,
        bookingFee: typeof bookingData.bookingFee,
        carRentPrice: typeof bookingData.carRentPrice,
        rentime: typeof bookingData.rentime,
        rentType: typeof bookingData.rentType,
        request: typeof bookingData.request,
      });

      let res = await bookingsService.createBooking(bookingData);

      if (res.error && res.error.message.includes('Server error')) {
        console.log('First attempt failed, trying without bookingFee...');
        const {bookingFee, ...bookingDataWithoutFee} = bookingData;
        res = await bookingsService.createBooking(bookingDataWithoutFee as any);
      }

      if (res.error) {
        console.error('Booking creation failed:', res.error);
        const errorMessage = res.error?.message || 'Failed to create booking';
        Alert.alert(
          t('error') || 'Error',
          errorMessage +
            '\n\nPlease check your booking details and try again.\n\nIf the problem persists, please contact support with this information:\n- Car ID: ' +
            carId +
            '\n- User ID: ' +
            user.id,
        );
        return;
      }

      if (res.data) {
        const bookingResponse = res.data;
        let createdBookingId: string | null = null;
        let payosUrl: string | null = null;

        if (typeof bookingResponse === 'string') {
          payosUrl = bookingResponse;
        } else if (
          typeof bookingResponse === 'object' &&
          bookingResponse !== null
        ) {
          if (bookingResponse.payment) payosUrl = bookingResponse.payment;
          if (bookingResponse.booking && bookingResponse.booking.id)
            createdBookingId = bookingResponse.booking.id;
          if (!createdBookingId)
            createdBookingId =
              bookingResponse.bookingId || bookingResponse.id || null;
          if (!payosUrl)
            payosUrl =
              bookingResponse.paymentUrl || bookingResponse.checkoutUrl || null;
        }

        navigation.navigate('PayOSWebView' as any, {
          paymentUrl: payosUrl,
          bookingId: createdBookingId || 'pending',
        });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (carLoading) {
    return (
      <View style={{flex: 1, backgroundColor: colors.background}}>
        <Header />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={{flex: 1, backgroundColor: colors.background}}>
        <Header />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>{t('carNotFound')}</Text>
        </View>
      </View>
    );
  }

  const getCarImageSource = () => {
    if (car.imageUrls && car.imageUrls.length > 0)
      return {uri: car.imageUrls[0]};
    if (car.images && car.images.length > 0) return {uri: car.images[0]};
    if (car.image) {
      if (car.image.startsWith('http://') || car.image.startsWith('https://'))
        return {uri: car.image};
      const localAsset = getAsset(car.image);
      if (localAsset) return localAsset;
    }
    return null;
  };

  const carImageSource = getCarImageSource();

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <View style={{flex: 1, backgroundColor: colors.background}}>
        <Header />
        <ScrollView
          contentContainerStyle={{paddingBottom: 24}}
          keyboardShouldPersistTaps="handled">
          <RentalSummaryCard
            car={car}
            carImageSource={carImageSource}
            subtotal={subtotal}
            tax={tax}
            shippingFee={shippingFee}
            bookingFee={bookingFee}
            discount={formState.discount}
            total={total}
            promoCode={formState.promoCode}
            onPromoCodeChange={formState.setPromoCode}
            onApplyPromo={() => formState.handleApplyPromo(subtotal)}
          />

          <View style={{paddingHorizontal: 16, marginBottom: 16}}>
            <Text style={{fontSize: 12, color: colors.placeholder}}>
              {t('step')} {currentStep} {t('of')} 4
            </Text>
          </View>

          {currentStep === 1 && (
            <BillingInfoStep
              name={formState.name}
              address={formState.address}
              phone={formState.phone}
              city={formState.city}
              onNameChange={formState.setName}
              onAddressChange={formState.setAddress}
              onPhoneChange={formState.setPhone}
              onCityChange={formState.setCity}
            />
          )}

          {currentStep === 2 && (
            <RentalInfoStep
              pickupLocation={formState.pickupLocation}
              pickupDate={formState.pickupDate}
              pickupTime={formState.pickupTime}
              dropoffLocation={formState.dropoffLocation}
              dropoffDate={formState.dropoffDate}
              dropoffTime={formState.dropoffTime}
              pickupDateError={formState.pickupDateError}
              pickupTimeError={formState.pickupTimeError}
              dropoffDateError={formState.dropoffDateError}
              dropoffTimeError={formState.dropoffTimeError}
              pickupMode={formState.pickupMode}
              dropoffMode={formState.dropoffMode}
              distanceInKm={formState.distanceInKm}
              onPickupLocationChange={formState.setPickupLocation}
              onPickupDateChange={formState.handlePickupDateChange}
              onPickupTimeChange={formState.handlePickupTimeChange}
              onDropoffLocationChange={formState.setDropoffLocation}
              onDropoffDateChange={formState.handleDropoffDateChange}
              onDropoffTimeChange={formState.handleDropoffTimeChange}
              onPickupModeChange={formState.setPickupMode}
              onDropoffModeChange={formState.setDropoffMode}
              onCalculateDistance={handleCalculateDistance}
            />
          )}

          {currentStep === 3 && (
            <PaymentMethodStep
              paymentMethod={formState.paymentMethod}
              onPaymentMethodChange={formState.setPaymentMethod}
            />
          )}

          {currentStep === 4 && (
            <ConfirmationStep
              agreeMarketing={formState.agreeMarketing}
              agreeTerms={formState.agreeTerms}
              onAgreeMarketingChange={formState.setAgreeMarketing}
              onAgreeTermsChange={formState.setAgreeTerms}
            />
          )}

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              paddingHorizontal: 16,
              paddingTop: 24,
            }}>
            {currentStep > 1 && (
              <Pressable
                onPress={() => setCurrentStep(currentStep - 1)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.morentBlue,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                <Text style={{color: colors.morentBlue, fontWeight: '600'}}>
                  {t('back')}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleNextStep}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: colors.morentBlue,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={{color: colors.white, fontWeight: '600'}}>
                  {currentStep === 4 ? t('rentalNow') : t('next')}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

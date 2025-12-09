'use client';

import { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import getAsset from '../../../lib/getAsset';
import Header from '../../components/Header/Header';
import { useAuth } from '../../../lib/auth-context';

import RentalSummaryCard from './components/RentalSummaryCard';
import BillingInfoStep from './components/BillingInfoStep';
import RentalInfoStep from './components/RentalInfoStep';
import PaymentMethodStep from './components/PaymentMethodStep';
import ConfirmationStep from './components/ConfirmationStep';

import { useBookingForm } from './hooks/useBookingForm';
import { useBookingValidation } from './hooks/useBookingValidation';
import { useLanguage } from '../../../lib/language-context';
import { styles } from './booking-form.styles';
import {
  calculateRentalDays,
  calculateShippingFee,
  calculateBookingFee,
  calculateTotal,
} from './helpers/calculations';
import { getCarImageSource } from './helpers/carImageHelper';
import {
  handleCalculateDistance as calculateDistance,
  calculateShippingDistance,
} from './helpers/distanceCalculator';
import { createBooking } from './helpers/bookingCreator';

export default function BookingFormScreen({ route }: any) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const carId = route?.params?.id;
  const [car, setCar] = useState<Car | null>(null);
  const [carLoading, setCarLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [customAddressInitialized, setCustomAddressInitialized] = useState(false);

  const formState = useBookingForm();
  const validation = useBookingValidation();

  useEffect(() => {
    if (route?.params?.pickupLocation)
      formState.setPickupLocation(route.params.pickupLocation);
    if (route?.params?.dropoffLocation)
      formState.setDropoffLocation(route.params.dropoffLocation);
  }, [route?.params]);

  // Pre-fill custom pickup address with billing address when switching to custom mode
  useEffect(() => {
    if (
      formState.pickupMode === 'custom' &&
      !customAddressInitialized &&
      formState.address
    ) {
      formState.setPickupLocation(formState.address);
      formState.setDropoffLocation(formState.address);
      setCustomAddressInitialized(true);
    }
  }, [formState.pickupMode, customAddressInitialized, formState.address]);

  // Sync drop-off location with pickup location whenever pickup changes
  useEffect(() => {
    if (formState.pickupLocation) {
      formState.setDropoffLocation(formState.pickupLocation);
    }
  }, [formState.pickupLocation]);

  // Calculate distance and shipping fee when in custom mode
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateShippingDistance(
        formState.pickupMode,
        formState.pickupLocation,
        formState.setDistanceInKm
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [formState.pickupMode, formState.pickupLocation]);

  useEffect(() => {
    const fetchData = async () => {
      if (!carId) return;
      setCarLoading(true);

      const { data } = await carsService.getCarById(carId);
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

  // Calculate rental days and prices
  const rentalDays = calculateRentalDays(
    formState.pickupDate,
    formState.pickupTime,
    formState.dropoffDate,
    formState.dropoffTime
  );
  const pricePerDay = car ? car.price : 0;
  const subtotal = pricePerDay * rentalDays;
  const shippingFee = calculateShippingFee(formState.pickupMode, formState.distanceInKm);
  const bookingFee = calculateBookingFee(subtotal, shippingFee);
  const total = calculateTotal(subtotal, shippingFee, formState.discount);

  const handleCalculateDistanceWrapper = async (parkLotAddress: string) => {
    await calculateDistance(
      parkLotAddress,
      formState.pickupMode,
      formState.pickupLocation,
      formState.setDistanceInKm
    );
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

      await createBooking(
        {
          userId: user.id,
          carId,
          carPrice: car?.price || 0,
          pickupLocation: formState.pickupLocation,
          dropoffLocation: formState.dropoffLocation,
          pickupDateTime: step2Validation.pickupDateTime,
          dropoffDateTime: step2Validation.dropoffDateTime,
          t,
        },
        navigation
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (carLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text>{t('carNotFound')}</Text>
        </View>
      </View>
    );
  }

  const carImageSource = getCarImageSource(car);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <View style={styles.container}>
        <Header />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <RentalSummaryCard
            car={car}
            carImageSource={carImageSource}
            subtotal={subtotal}
            shippingFee={shippingFee}
            bookingFee={bookingFee}
            discount={formState.discount}
            total={total}
            distanceInKm={formState.distanceInKm}
            rentalDays={rentalDays}
            pricePerDay={pricePerDay}
          />

          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
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
              onCalculateDistance={handleCalculateDistanceWrapper}
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

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <Pressable
                onPress={() => setCurrentStep(currentStep - 1)}
                style={styles.backButton}>
                <Text style={styles.backButtonText}>
                  {t('back')}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleNextStep}
              disabled={loading}
              style={styles.nextButton}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.nextButtonText}>
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

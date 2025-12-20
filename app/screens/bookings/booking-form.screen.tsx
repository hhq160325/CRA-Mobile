'use client';

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';

import RentalSummaryCard from './components/RentalSummaryCard';
import StepRenderer from './components/StepRenderer';
import LoadingStates from './components/LoadingStates';

import { useBookingForm } from './hooks/useBookingForm';
import { useBookingValidation } from './hooks/useBookingValidation';
import { useBookingFormEffects } from './hooks/useBookingFormEffects';
import { styles } from './styles/bookingForm.styles';
import { useBookingCalculations } from './helpers/bookingCalculations';
import { getCarImageSource } from './helpers/carImageHelper';
import { useStepNavigation } from './helpers/stepNavigation';

export default function BookingFormScreen({ route }: any) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const carId = route?.params?.id;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const formState = useBookingForm();
  const validation = useBookingValidation();

  // Use custom hooks for effects and data fetching
  const { car, carLoading, user } = useBookingFormEffects({
    carId,
    route,
    formState
  });

  // Calculate booking values
  const calculations = useBookingCalculations({
    car,
    pickupDate: formState.pickupDate,
    pickupTime: formState.pickupTime,
    dropoffDate: formState.dropoffDate,
    dropoffTime: formState.dropoffTime,
    pickupMode: formState.pickupMode,
    distanceInKm: formState.distanceInKm || 0,
    discount: formState.discount
  });

  // Handle step navigation
  const { handleNextStep } = useStepNavigation({
    currentStep,
    setCurrentStep,
    setLoading,
    formState,
    validation,
    user,
    carId,
    car,
    navigation,
    t
  });

  // Debug logging for step 3
  if (currentStep === 3) {
    console.log('Step 3 - Rental Summary Debug:', {
      pickupMode: formState.pickupMode,
      distanceInKm: formState.distanceInKm,
      shippingFee: calculations.shippingFee,
      bookingFee: calculations.bookingFee,
      total: calculations.total,
      subtotal: calculations.subtotal
    });
  }

  // Handle loading states
  const loadingComponent = LoadingStates({ carLoading, car, t });
  if (loadingComponent) {
    return loadingComponent;
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
            car={car!}
            carImageSource={carImageSource}
            subtotal={calculations.subtotal}
            shippingFee={calculations.shippingFee}
            bookingFee={calculations.bookingFee}
            discount={formState.discount}
            total={calculations.total}
            distanceInKm={formState.distanceInKm}
            rentalDays={calculations.rentalDays}
            pricePerDay={calculations.pricePerDay}
          />

          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {currentStep} of 4
            </Text>
          </View>

          <StepRenderer
            currentStep={currentStep}
            formState={formState}
          />

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <Pressable
                onPress={() => setCurrentStep(currentStep - 1)}
                style={styles.backButton}>
                <Text style={styles.backButtonText}>
                  Back
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
                  {currentStep === 4 ? 'Rent Now' : 'Next'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

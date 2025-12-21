import { Alert } from 'react-native';
import { createBooking } from './bookingCreator';
import type { Car } from '../../../../lib/api';

interface StepNavigationProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    setLoading: (loading: boolean) => void;
    formState: any;
    validation: any;
    user: any;
    carId: string;
    car: Car | null;
    navigation: any;
}

export function useStepNavigation({
    currentStep,
    setCurrentStep,
    setLoading,
    formState,
    validation,
    user,
    carId,
    car,
    navigation
}: StepNavigationProps) {

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
                (distance: number) => formState.setDistanceInKm(distance),
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
                (distance: number) => formState.setDistanceInKm(distance),
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
                },
                navigation
            );
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return {
        handleNextStep,
        handleCreate
    };
}
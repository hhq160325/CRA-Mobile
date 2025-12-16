import React from 'react';
import BillingInfoStep from './BillingInfoStep';
import RentalInfoStep from './RentalInfoStep';
import PaymentMethodStep from './PaymentMethodStep';
import ConfirmationStep from './ConfirmationStep';
import { handleCalculateDistance as calculateDistance } from '../helpers/distanceCalculator';

interface StepRendererProps {
    currentStep: number;
    formState: any;
}

export default function StepRenderer({ currentStep, formState }: StepRendererProps) {
    const handleCalculateDistanceWrapper = async (parkLotAddress: string) => {
        await calculateDistance(
            parkLotAddress,
            formState.pickupMode,
            formState.pickupLocation,
            formState.setDistanceInKm
        );
    };

    switch (currentStep) {
        case 1:
            return (
                <BillingInfoStep
                    name={formState.name}
                    address={formState.address}
                    phone={formState.phone}
                    city={formState.city}
                    phoneError={formState.phoneError}
                    onNameChange={formState.setName}
                    onAddressChange={formState.setAddress}
                    onPhoneChange={formState.setPhone}
                    onCityChange={formState.setCity}
                />
            );

        case 2:
            return (
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
            );

        case 3:
            return (
                <PaymentMethodStep
                    paymentMethod={formState.paymentMethod}
                    onPaymentMethodChange={formState.setPaymentMethod}
                />
            );

        case 4:
            return (
                <ConfirmationStep
                    agreeMarketing={formState.agreeMarketing}
                    agreeTerms={formState.agreeTerms}
                    onAgreeMarketingChange={formState.setAgreeMarketing}
                    onAgreeTermsChange={formState.setAgreeTerms}
                />
            );

        default:
            return null;
    }
}
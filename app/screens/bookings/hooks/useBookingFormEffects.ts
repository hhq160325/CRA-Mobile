import { useEffect, useState } from 'react';
import { carsService, userService, type Car } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import { calculateShippingDistance } from '../helpers/distanceCalculator';

interface UseBookingFormEffectsProps {
    carId: string;
    route: any;
    formState: any;
}

export function useBookingFormEffects({ carId, route, formState }: UseBookingFormEffectsProps) {
    const { user } = useAuth();
    const [car, setCar] = useState<Car | null>(null);
    const [carLoading, setCarLoading] = useState(true);
    const [customAddressInitialized, setCustomAddressInitialized] = useState(false);

    // Handle route params
    useEffect(() => {
        if (route?.params?.pickupLocation)
            formState.setPickupLocation(route.params.pickupLocation);
        if (route?.params?.dropoffLocation)
            formState.setDropoffLocation(route.params.dropoffLocation);
    }, [route?.params]);

    // Handle custom address initialization
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

    // Sync pickup and dropoff locations
    useEffect(() => {
        if (formState.pickupLocation) {
            formState.setDropoffLocation(formState.pickupLocation);
        }
    }, [formState.pickupLocation]);

    // Calculate shipping distance
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

    // Fetch car and user data
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

    return {
        car,
        carLoading,
        user
    };
}
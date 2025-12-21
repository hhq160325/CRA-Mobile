import { useState, useEffect } from 'react';
import {
  carsService,
  bookingsService,
  type Car,
  type Booking,
} from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';

export function useHomeData() {
  const [cars, setCars] = useState<Car[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Debounce loading to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      loadData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      console.log('🚀 Loading home data...');

      // Load cars first for immediate display
      const carsResult = await carsService.getCars({});

      if (carsResult.data) {
        // Filter out Reserved cars from home screen - only show Available and Active cars
        const availableStatuses = ['Active', 'Available'];
        const availableCars = carsResult.data.filter(car =>
          availableStatuses.includes(car.status || ''),
        );

        console.log(`📊 Total cars: ${carsResult.data.length}, Available: ${availableCars.length}`);

        // Show cars immediately with placeholder prices
        const carsWithPlaceholderPrices = availableCars.map(car => ({
          ...car,
          price: 0, // Will be updated when rates load
        }));

        setCars(carsWithPlaceholderPrices);
        console.log(`⚡ Cars displayed in ${Date.now() - startTime}ms`);

        // Load rental rates in parallel (much faster)
        const ratePromises = availableCars.map(car =>
          carsService.getCarRentalRate(car.id).catch(error => {
            console.warn(`Failed to load rate for ${car.name}:`, error);
            return { data: null, error };
          })
        );

        const rateResults = await Promise.all(ratePromises);

        // Update cars with actual prices
        const carsWithRates = availableCars.map((car, index) => {
          const rateResult = rateResults[index];

          if (
            rateResult.data &&
            rateResult.data.status === 'Active' &&
            rateResult.data.dailyRate > 0
          ) {
            return { ...car, price: rateResult.data.dailyRate };
          }

          return { ...car, price: 0 };
        });

        setCars(carsWithRates);
        console.log(`💰 Prices loaded in ${Date.now() - startTime}ms total`);
      }

      // Load bookings in parallel (non-blocking)
      if (user?.id) {
        bookingsService.getBookings(user.id).then(bookingsResult => {
          if (bookingsResult.data) {
            setRecentBookings(bookingsResult.data.slice(0, 4));
            console.log(`📋 Bookings loaded`);
          }
        }).catch(error => {
          console.warn('Failed to load bookings:', error);
        });
      }

    } catch (error) {
      console.error('❌ Error loading home data:', error);
    } finally {
      setLoading(false);
      console.log(`✅ Home data loading completed in ${Date.now() - startTime}ms`);
    }
  };

  const forceRefresh = async () => {
    // Clear cache and reload
    const { apiCache, cacheKeys } = await import('../../../../lib/api/cache');
    apiCache.invalidatePattern('cars');
    apiCache.invalidatePattern('booking');
    await loadData();
  };

  return {
    cars,
    recentBookings,
    loading,
    refetch: loadData,
    forceRefresh,
  };
}

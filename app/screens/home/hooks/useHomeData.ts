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
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [carsResult, bookingsResult] = await Promise.all([
        carsService.getCars({}),
        user?.id
          ? bookingsService.getBookings(user.id)
          : Promise.resolve({ data: null as Booking[] | null, error: null }),
      ]);

      if (carsResult.data) {
        const rentableStatuses = ['Active', 'Reserved', 'Available'];
        const rentableCars = carsResult.data.filter(car =>
          rentableStatuses.includes(car.status || ''),
        );

        console.log(
          `Total cars: ${carsResult.data.length}, Rentable: ${rentableCars.length}`,
        );

        const carsWithRates = await Promise.all(
          rentableCars.map(async car => {
            const rateResult = await carsService.getCarRentalRate(car.id);

            if (
              rateResult.data &&
              rateResult.data.status === 'Active' &&
              rateResult.data.dailyRate > 0
            ) {
              console.log(
                ` ${car.name
                }: ${rateResult.data.dailyRate.toLocaleString()} VND/day`,
              );
              return { ...car, price: rateResult.data.dailyRate };
            }

            console.log(` ${car.name}: No active rental rate`);
            return { ...car, price: 0 };
          }),
        );

        console.log(`Displaying ${carsWithRates.length} cars`);
        setCars(carsWithRates);
      }

      if (bookingsResult.data) {
        setRecentBookings(bookingsResult.data.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { cars, recentBookings, loading, refetch: loadData };
}

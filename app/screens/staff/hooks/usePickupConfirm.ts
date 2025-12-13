import { useState, useEffect } from 'react';
import { bookingsService } from '../../../../lib/api/services/bookings.service';
import { carsService } from '../../../../lib/api/services/cars.service';
import { userService } from '../../../../lib/api/services/user.service';
import { scheduleService } from '../../../../lib/api/services/schedule.service';

interface BookingDetails {
  id: string;
  carName: string;
  carModel: string;
  carLicensePlate: string;
  carImage: string;
  customerName: string;
  pickupPlace: string;
  pickupTime: string;
  dropoffPlace: string;
  dropoffTime: string;
  amount: number;
  status: string;
}

export function usePickupConfirm(bookingId: string) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyCheckedIn, setIsAlreadyCheckedIn] = useState(false);
  const [existingCheckInData, setExistingCheckInData] = useState<{
    images: string[];
    description: string;
  } | null>(null);
  const [initialDescription, setInitialDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching booking details for:', bookingId);

        const checkInResult = await scheduleService.getCheckInImages(bookingId);
        console.log(' Check-in result:', {
          hasData: !!checkInResult.data,
          hasError: !!checkInResult.error,
          imagesCount: checkInResult.data?.images.length || 0,
          description: checkInResult.data?.description || '',
        });

        if (checkInResult.data && checkInResult.data.images.length > 0) {
          console.log(' Check-in data found - pickup already completed');
          setIsAlreadyCheckedIn(true);
          setExistingCheckInData(checkInResult.data);
          setInitialDescription(checkInResult.data.description);
        } else {
          console.log('ℹ No check-in data found, proceeding with check-in flow');
          setIsAlreadyCheckedIn(false);
        }

        const bookingResult = await bookingsService.getBookingById(bookingId);
        if (bookingResult.error || !bookingResult.data) {
          setError('Failed to load booking details');
          setLoading(false);
          return;
        }

        const bookingData = bookingResult.data;

        let carName = 'Unknown Car';
        let carModel = '';
        let carLicensePlate = '';
        let carImage = '';

        if (bookingData.carId) {
          const carResult = await carsService.getCarById(bookingData.carId);
          if (carResult.data) {
            carName = carResult.data.name;
            carModel = carResult.data.model;
            carLicensePlate = carResult.data.licensePlate || '';
            carImage = carResult.data.image;
          }
        }

        let customerName = 'Customer';
        if (bookingData.userId) {
          const userResult = await userService.getUserById(bookingData.userId);
          if (userResult.data) {
            customerName =
              userResult.data.fullname ||
              userResult.data.username ||
              'Customer';
          }
        }

        setBooking({
          id: bookingData.id,
          carName,
          carModel,
          carLicensePlate,
          carImage,
          customerName,
          pickupPlace: bookingData.pickupLocation,
          pickupTime: bookingData.startDate,
          dropoffPlace: bookingData.dropoffLocation,
          dropoffTime: bookingData.endDate,
          amount: bookingData.totalPrice,
          status: bookingData.status,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('An error occurred');
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  return {
    booking,
    loading,
    error,
    isAlreadyCheckedIn,
    existingCheckInData,
    initialDescription,
  };
}

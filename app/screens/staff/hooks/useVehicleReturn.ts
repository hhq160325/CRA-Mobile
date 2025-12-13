import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
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

export function useVehicleReturn(bookingId: string) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupImages, setPickupImages] = useState<string[]>([]);
  const [pickupDescription, setPickupDescription] = useState('');
  const [isAlreadyCheckedOut, setIsAlreadyCheckedOut] = useState(false);
  const [existingCheckOutData, setExistingCheckOutData] = useState<{
    images: string[];
    description: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for return:', bookingId);

        const checkOutResult = await scheduleService.getCheckOutImages(
          bookingId,
        );
        if (checkOutResult.data && checkOutResult.data.images.length > 0) {
          setIsAlreadyCheckedOut(true);
          setExistingCheckOutData(checkOutResult.data);
        } else {
          setIsAlreadyCheckedOut(false);
        }

        const checkInResult = await scheduleService.getCheckInImages(bookingId);
        if (checkInResult.data) {
          setPickupImages(checkInResult.data.images);
          setPickupDescription(checkInResult.data.description);
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

        console.log('🔍 useVehicleReturn: bookingData.totalPrice:', bookingData.totalPrice, typeof bookingData.totalPrice);
        console.log('🔍 useVehicleReturn: raw bookingResult.data:', JSON.stringify(bookingResult.data, null, 2));

        // Try to get amount from multiple sources
        let amount = bookingData.totalPrice || 0;

        // If totalPrice is 0, try to get from raw booking data
        if (amount === 0) {
          const rawBooking = bookingResult.data as any; // Use any to access raw API fields
          amount = rawBooking.invoice?.amount ||
            rawBooking.bookingFee ||
            rawBooking.carRentPrice ||
            0;
          console.log('🔍 useVehicleReturn: fallback amount sources:', {
            invoiceAmount: rawBooking.invoice?.amount,
            bookingFee: rawBooking.bookingFee,
            carRentPrice: rawBooking.carRentPrice,
            finalAmount: amount
          });
        }

        // If still 0, try to get from payment data (Rental Fee)
        if (amount === 0 && bookingData.invoiceId) {
          try {
            const paymentUrl = `https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/Invoice/${bookingData.invoiceId}`;
            const paymentResponse = await fetch(paymentUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
              },
            });

            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              const rentalFeePayment = paymentData.find((payment: any) =>
                payment.item === 'Rental Fee'
              );

              if (rentalFeePayment && rentalFeePayment.paidAmount) {
                amount = rentalFeePayment.paidAmount;
                console.log('🔍 useVehicleReturn: found Rental Fee amount:', amount);
              }
            }
          } catch (error) {
            console.warn('🔍 useVehicleReturn: failed to fetch payment data:', error);
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
          amount: amount,
          status: bookingData.status,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
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
    pickupImages,
    pickupDescription,
    isAlreadyCheckedOut,
    existingCheckOutData,
    initialDescription: existingCheckOutData?.description || '',
  };
}

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { bookingsService } from '../../../../lib/api';
import { invoiceService } from '../../../../lib/api/services/invoice.service';
import { paymentService } from '../../../../lib/api/services/payment.service';
import { useAuth } from '../../../../lib/auth-context';

export function useBookingDetail(bookingIdOrNumber: string, navigation: any) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [bookingFee, setBookingFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      console.log(' BookingDetail: Starting load process');
      console.log(' BookingDetail: Booking ID or Number:', bookingIdOrNumber);
      console.log(' BookingDetail: Current user:', {
        id: user?.id,
        role: user?.role,
        roleId: user?.roleId,
        hasUser: !!user
      });

      if (!user || !bookingIdOrNumber) {
        console.log(' BookingDetail: No authenticated user or booking identifier, skipping load');
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let res;

        // Detect if it's a booking number (starts with BK) or booking ID (UUID format)
        const isBookingNumber = bookingIdOrNumber.toUpperCase().startsWith('BK');

        if (isBookingNumber) {
          console.log(' BookingDetail: Calling getBookingByNumber...');
          res = await bookingsService.getBookingByNumber(bookingIdOrNumber);
        } else {
          console.log(' BookingDetail: Calling getBookingById...');
          res = await bookingsService.getBookingById(bookingIdOrNumber);
        }
        console.log('BookingDetail: API response:', {
          hasData: !!res.data,
          hasError: !!res.error,
          errorMessage: res.error?.message,
          bookingData: res.data ? {
            id: res.data.id,
            userId: res.data.userId,
            bookingNumber: res.data.bookingNumber,
            carName: res.data.carName,
            status: res.data.status
          } : null
        });

        if (!mounted) {
          console.log(' BookingDetail: Component unmounted, stopping');
          return;
        }

        if (res.error) {
          console.error(' BookingDetail: Error loading booking:', res.error);
          Alert.alert(
            'Error',
            'Failed to load booking details. Please try again.',
          );
          setLoading(false);
          return;
        }

        if (res.data) {

          let completeBooking = res.data;

          if (res.data.bookingNumber) {
            try {
              console.log(' BookingDetail: Fetching complete booking data for:', res.data.bookingNumber);
              const detailedRes = await bookingsService.getBookingByNumber(res.data.bookingNumber);
              console.log(' BookingDetail: Detailed booking response:', {
                hasData: !!detailedRes.data,
                hasError: !!detailedRes.error,
                hasCar: !!detailedRes.data?.car,
                hasUser: !!detailedRes.data?.user,
                userId: detailedRes.data?.user?.id
              });

              if (detailedRes.data) {

                completeBooking = {
                  ...res.data,
                  userId: detailedRes.data.user?.id || res.data.userId,
                  carName: detailedRes.data.car ? `${detailedRes.data.car.manufacturer} ${detailedRes.data.car.model}` : res.data.carName,
                  carImage: detailedRes.data.car?.imageUrls?.[0] || res.data.carImage,
                  carDetails: detailedRes.data.car,
                  userDetails: detailedRes.data.user
                };
                console.log(' BookingDetail: Enhanced booking with complete data:', {
                  userId: completeBooking.userId,
                  carName: completeBooking.carName
                });
              }
            } catch (err) {
              console.log(' BookingDetail: Could not fetch detailed booking, using basic data:', err);
            }
          }

          console.log(' BookingDetail: Checking permissions with complete data...');
          const isStaff = user?.role === 'staff' || user?.roleId === 1002;
          const isOwner = completeBooking.userId === user?.id;

          console.log(' BookingDetail: Permission check:', {
            isStaff,
            isOwner,
            bookingUserId: completeBooking.userId,
            currentUserId: user?.id,
            userRole: user?.role,
            userRoleId: user?.roleId
          });

          if (!isStaff && !isOwner) {
            console.log(' BookingDetail: Access denied - booking belongs to different user');
            Alert.alert(
              'Access Denied',
              "You don't have permission to view this booking.",
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
            setLoading(false);
            return;
          }

          console.log(' BookingDetail: Permission granted, setting booking data');
          setBooking(completeBooking);

          // Use the actual booking ID from the response data
          const actualBookingId = completeBooking.id;

          console.log(
            'BookingDetail: Fetching payments for booking:',
            actualBookingId,
          );
          try {
            const paymentsRes = await paymentService.getBookingPayments(
              actualBookingId,
            );
            if (mounted && paymentsRes.data) {
              console.log(
                'BookingDetail: Payments loaded successfully:',
                paymentsRes.data,
              );
              setPayments(paymentsRes.data);


              const bookingFeePayment = paymentsRes.data.find(
                (payment: any) => payment.item === 'Booking Fee'
              );
              if (bookingFeePayment) {
                console.log(
                  'BookingDetail: Booking fee found:',
                  bookingFeePayment.paidAmount,
                );
                setBookingFee(bookingFeePayment.paidAmount);
              }
            }
          } catch (err) {
            console.log('BookingDetail: Error fetching payments:', err);
          }

          if (res.data.invoiceId) {
            console.log('BookingDetail: Fetching invoice:', res.data.invoiceId);
            try {
              const invoiceRes = await invoiceService.getInvoiceById(
                res.data.invoiceId,
              );
              if (mounted && invoiceRes.data) {
                console.log('BookingDetail: Invoice loaded successfully');
                setInvoice(invoiceRes.data);
              }
            } catch (err) {
              console.log('BookingDetail: Error fetching invoice:', err);
            }
          }
        }
      } catch (err) {
        console.error('BookingDetail: Unexpected error:', err);
        if (mounted) {
          Alert.alert(
            'Error',
            'An unexpected error occurred. Please try again.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (bookingIdOrNumber && user) {
      load();
    } else {
      console.error('BookingDetail: No booking identifier provided or no authenticated user');
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [bookingIdOrNumber, user?.id]);

  return { booking, invoice, payments, bookingFee, loading };
}

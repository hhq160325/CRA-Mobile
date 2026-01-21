import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { bookingsService, carWalletService, carTravelLogService, type CarTravelLog } from '../../../../lib/api';
import { paymentService } from '../../../../lib/api/services/payment.service';
import { useAuth } from '../../../../lib/auth-context';

export function useBookingDetail(bookingIdOrNumber: string, navigation: any) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [bookingFee, setBookingFee] = useState<number>(0);
  const [carWalletBalance, setCarWalletBalance] = useState<number | null>(null);
  const [travelLogs, setTravelLogs] = useState<CarTravelLog[]>([]);
  const [travelLogsLoading, setTravelLogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBookingData() {
      if (!user || !bookingIdOrNumber) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Step 1: Load basic booking data first (fastest)
        const isBookingNumber = bookingIdOrNumber.toUpperCase().startsWith('BK');

        let res;
        if (isBookingNumber) {
          res = await bookingsService.getBookingByNumber(bookingIdOrNumber);
        } else {
          res = await bookingsService.getBookingById(bookingIdOrNumber);
        }

        if (!mounted) return;

        if (res.error) {
          console.error('BookingDetail: Error loading booking:', res.error);
          Alert.alert('Error', 'Failed to load booking details. Please try again.');
          setLoading(false);
          return;
        }

        if (!res.data) {
          setLoading(false);
          return;
        }

        // Step 2: Set basic booking data immediately (show UI faster)
        let completeBooking = res.data;

        // Permission check
        const isStaff = user?.role === 'staff' || user?.roleId === 1002;
        const isOwner = completeBooking.userId === user?.id;

        if (!isStaff && !isOwner) {
          Alert.alert(
            'Access Denied',
            "You don't have permission to view this booking.",
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          setLoading(false);
          return;
        }

        // Set booking data immediately - UI can show basic info
        setBooking(completeBooking);
        setLoading(false); // ✅ Show UI immediately with basic data

        // Step 3: Load additional data in parallel (non-blocking)
        const carId = completeBooking.carId;
        const bookingId = completeBooking.id;

        if (carId && bookingId) {
          // Run all secondary API calls in parallel
          const secondaryDataPromises = [
            // Car wallet
            carWalletService.getCarWallet(carId).catch(err => {
              console.log('BookingDetail: Car wallet error:', err);
              return { data: null, error: err };
            }),

            // Payments
            paymentService.getBookingPayments(bookingId).catch(err => {
              console.log('BookingDetail: Payments error:', err);
              return { data: null, error: err };
            })
          ];

          // Execute parallel calls
          const [walletRes, paymentsRes] = await Promise.all(secondaryDataPromises);

          if (!mounted) return;

          // Update car wallet
          if (walletRes.data) {
            setCarWalletBalance(walletRes.data.balance);
          }

          // Update payments
          if (paymentsRes.data) {
            setPayments(paymentsRes.data);

            const bookingFeePayment = paymentsRes.data.find(
              (payment: any) => payment.item === 'Booking Fee'
            );
            if (bookingFeePayment) {
              setBookingFee(bookingFeePayment.paidAmount);
            }

            // Check payment statuses in background (non-blocking)
            checkPaymentStatusesInBackground(bookingId, mounted);
          }

          // Load travel logs in background (non-blocking)
          loadTravelLogsInBackground(carId, bookingId, mounted);
        }

      } catch (err) {
        console.error('BookingDetail: Unexpected error:', err);
        if (mounted) {
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          setLoading(false);
        }
      }
    }

    // Background function for travel logs
    async function loadTravelLogsInBackground(carId: string, bookingId: string, isMounted: boolean) {
      setTravelLogsLoading(true);
      try {
        const travelLogsRes = await carTravelLogService.getCarTravelLogsByCarAndBooking(carId, bookingId);
        if (isMounted && travelLogsRes.data) {
          setTravelLogs(travelLogsRes.data);
        }
      } catch (err) {
        console.log('BookingDetail: Travel logs error:', err);
      } finally {
        if (isMounted) {
          setTravelLogsLoading(false);
        }
      }
    }

    // Background function for payment status updates
    async function checkPaymentStatusesInBackground(bookingId: string, isMounted: boolean) {
      try {
        const { checkAndUpdatePaymentStatuses } = await import('../../../../lib/api/services/payment-status-checker');
        const statusUpdateResult = await checkAndUpdatePaymentStatuses(bookingId);

        if (statusUpdateResult.results.some(r => r.updated)) {
          // Refetch payments if statuses were updated
          const updatedPaymentsRes = await paymentService.getBookingPayments(bookingId);
          if (isMounted && updatedPaymentsRes.data) {
            setPayments(updatedPaymentsRes.data);

            const updatedBookingFeePayment = updatedPaymentsRes.data.find(
              (payment: any) => payment.item === 'Booking Fee'
            );
            if (updatedBookingFeePayment) {
              setBookingFee(updatedBookingFeePayment.paidAmount);
            }
          }
        }
      } catch (statusError) {
        console.log('BookingDetail: Payment status check error:', statusError);
      }
    }

    if (bookingIdOrNumber && bookingIdOrNumber.trim() && user) {
      loadBookingData();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [bookingIdOrNumber, user?.id]);

  return { booking, invoice, payments, bookingFee, carWalletBalance, travelLogs, travelLogsLoading, loading };
}

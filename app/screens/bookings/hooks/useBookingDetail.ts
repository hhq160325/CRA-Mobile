import {useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {bookingsService} from '../../../../lib/api';
import {invoiceService} from '../../../../lib/api/services/invoice.service';
import {paymentService} from '../../../../lib/api/services/payment.service';
import {useAuth} from '../../../../lib/auth-context';

export function useBookingDetail(bookingId: string, navigation: any) {
  const {user} = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      console.log('BookingDetail: Loading booking with ID:', bookingId);
      setLoading(true);

      try {
        const res = await bookingsService.getBookingById(bookingId);
        console.log('BookingDetail: API response:', {
          hasData: !!res.data,
          hasError: !!res.error,
        });

        if (!mounted) return;

        if (res.error) {
          console.error('BookingDetail: Error loading booking:', res.error);
          Alert.alert(
            'Error',
            'Failed to load booking details. Please try again.',
          );
          setLoading(false);
          return;
        }

        if (res.data) {
          const isStaff = user?.role === 'staff' || user?.roleId === 1002;
          const isOwner = res.data.userId === user?.id;

          if (!isStaff && !isOwner) {
            console.log(
              'BookingDetail: Access denied - booking belongs to different user',
            );
            Alert.alert(
              'Access Denied',
              "You don't have permission to view this booking.",
              [{text: 'OK', onPress: () => navigation.goBack()}],
            );
            setLoading(false);
            return;
          }

          console.log('BookingDetail: Setting booking data');
          setBooking(res.data);

          console.log(
            'BookingDetail: Fetching payments for booking:',
            bookingId,
          );
          try {
            const paymentsRes = await paymentService.getBookingPayments(
              bookingId,
            );
            if (mounted && paymentsRes.data) {
              console.log(
                'BookingDetail: Payments loaded successfully:',
                paymentsRes.data,
              );
              setPayments(paymentsRes.data);
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

    if (bookingId) {
      load();
    } else {
      console.error('BookingDetail: No booking ID provided');
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [bookingId, user?.id]);

  return {booking, invoice, payments, loading};
}

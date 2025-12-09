'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { bookingsService, paymentService } from '../../../lib/api';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './booking-payment.styles';

export default function BookingPaymentScreen() {
  const route = useRoute<
    RouteProp<
      {
        params: {
          bookingId: string;
          bookingNumber?: string;
          paymentMethod: string;
          amount: number;
        };
      },
      'params'
    >
  >();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  const { bookingId, bookingNumber, paymentMethod, amount } =
    (route.params as any) || {};

  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'success' | 'failed'
  >('pending');

  useEffect(() => {
    if (paymentMethod === 'qr-payos') {
      createPayOSPayment();
    }
  }, [paymentMethod]);

  const createPayOSPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await paymentService.createPayOSPayment({
        amount: amount,
        description: `Payment for booking ${bookingId}`,
        returnUrl: 'morent://payment-success',
        cancelUrl: 'morent://payment-cancel',
        bookingId: bookingId,
      });

      if (error) {
        Alert.alert('Error', 'Failed to create payment. Please try again.');
        setPaymentStatus('failed');
        return;
      }

      if (data && data.qrCode) {
        setQrCodeUrl(data.qrCode);
        pollPaymentStatus(data.orderCode);
      }
    } catch (err: any) {
      console.error('Payment creation error:', err);
      Alert.alert('Error', err.message || 'Failed to create payment');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (orderCode: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await paymentService.getPayOSPayment(orderCode);

        if (data && data.status === 'PAID') {
          clearInterval(interval);
          setPaymentStatus('success');

          await updateBookingStatus('2');
          Alert.alert('Success', 'Payment completed successfully!', [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('BookingDetail' as any, { id: bookingId }),
            },
          ]);
        } else if (data && data.status === 'CANCELLED') {
          clearInterval(interval);
          setPaymentStatus('failed');
          Alert.alert('Payment Cancelled', 'Your payment was cancelled.');
        }
      } catch (err) {
        console.log('Polling error:', err);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const { error } = await bookingsService.updateBooking({
        bookingId: bookingId,
        status: '1',
      } as any);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to confirm booking');
        return;
      }

      Alert.alert(
        'Booking Confirmed',
        'Your booking has been confirmed. Please pay cash when picking up the car.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('BookingDetail' as any, { id: bookingId }),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (status: string) => {
    try {
      await bookingsService.updateBooking({
        bookingId: bookingId,
        status: status,
      } as any);
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>
          Complete your payment to confirm the booking
        </Text>

        {/* Payment Method Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>
              {paymentMethod === 'cash' ? 'Cash' : 'QR PayOS'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{bookingNumber || 'N/A'}</Text>
          </View>

          <View style={styles.rowBordered}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{amount} VND</Text>
          </View>
        </View>

        {/* Cash Payment */}
        {paymentMethod === 'cash' && (
          <View style={styles.cardCentered}>
            <MaterialIcons
              name="payments"
              size={64}
              color={colors.morentBlue}
              style={styles.icon}
            />
            <Text style={styles.paymentTitle}>Cash Payment</Text>
            <Text style={styles.paymentDescription}>
              You will pay cash when picking up the car. Please bring the exact
              amount or card for payment.
            </Text>

            <Pressable
              onPress={handleCashPayment}
              disabled={loading}
              style={styles.confirmButton}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* PayOS QR Code */}
        {paymentMethod === 'qr-payos' && (
          <View style={styles.cardCentered}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.morentBlue} />
                <Text style={styles.loadingText}>Generating QR code...</Text>
              </View>
            ) : qrCodeUrl ? (
              <>
                <Text style={styles.qrTitle}>Scan QR Code to Pay</Text>

                <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />

                <Text style={styles.qrDescription}>
                  Scan this QR code with your banking app
                </Text>

                {paymentStatus === 'pending' && (
                  <View style={styles.statusContainer}>
                    <ActivityIndicator size="small" color={colors.morentBlue} />
                    <Text style={styles.statusText}>Waiting for payment...</Text>
                  </View>
                )}

                {paymentStatus === 'success' && (
                  <View style={styles.successContainer}>
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.successText}>Payment Successful!</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.errorText}>Failed to generate QR code</Text>
            )}
          </View>
        )}

        {/* Cancel Button */}
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

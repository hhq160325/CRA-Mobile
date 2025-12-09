import React, { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { API_CONFIG } from '../../../lib/api/config';
import { styles } from './payos-webview.styles';

type PayOSWebViewRouteProp = RouteProp<
  { params: { paymentUrl: string; bookingId?: string; returnScreen?: string } },
  'params'
>;

export default function PayOSWebViewScreen() {
  const route = useRoute<PayOSWebViewRouteProp>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { paymentUrl, bookingId, returnScreen } = (route.params as any) || {};

  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const paymentProcessedRef = useRef(false);

  const navigateToDestination = () => {
    if (returnScreen === 'StaffScreen') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'staffStack' as any }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'tabStack' as any,
            state: {
              routes: [{ name: 'Home' as any }],
              index: 0,
            },
          },
        ],
      });
    }
  };

  const updateBookingStatus = async (status: 'Confirmed' | 'Canceled') => {
    if (!bookingId || bookingId === 'pending') {
      console.log('⚠️ No valid booking ID, skipping booking status update');
      return false;
    }

    console.log(`Updating booking status to ${status} for:`, bookingId);
    const updateUrl = `${API_CONFIG.BASE_URL}/Booking/UpdateBooking`;

    try {
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          status: status,
        }),
      });

      const responseText = await response.text();
      console.log('📥 Booking update response status:', response.status);
      console.log('📥 Booking update response body:', responseText);

      if (!response.ok) {
        console.error('❌ Booking update FAILED - Status:', response.status);
        return false;
      }

      console.log('✅ Booking status updated successfully');
      return true;
    } catch (err) {
      console.error('❌ Failed to update booking status:', err);
      return false;
    }
  };

  const updatePaymentStatus = async () => {
    console.log('Updating payment status...');
    const paymentUpdateUrl = `${API_CONFIG.BASE_URL.replace(
      '/api',
      '',
    )}/UpdatePayment/Booking/BookingPayment`;

    try {
      const response = await fetch(paymentUpdateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          paymentMethod: 'PayOS',
          status: 'Success',
        }),
      });

      const responseText = await response.text();
      console.log('Payment update response status:', response.status);
      console.log('Payment update response body:', responseText);

      if (!response.ok) {
        console.error('❌ Payment update failed with status:', response.status);
        return false;
      }

      console.log('✅ Payment status updated to Success');
      return true;
    } catch (err) {
      console.error('❌ Failed to update payment status:', err);
      return false;
    }
  };

  const handlePaymentSuccess = async () => {
    console.log('=== Payment Success Detected ===');
    console.log('Booking ID:', bookingId);

    if (bookingId && bookingId !== 'pending') {
      const bookingUpdated = await updateBookingStatus('Confirmed');

      if (bookingUpdated) {
        await updatePaymentStatus();
      } else {
        console.warn('⚠️ Booking update failed, skipping payment update');
      }
    }

    navigateToDestination();
  };

  const handlePaymentCancellation = async () => {
    console.log('=== Payment Cancelled Detected ===');
    console.log('Booking ID:', bookingId);

    if (bookingId && bookingId !== 'pending') {
      await updateBookingStatus('Canceled');
    }

    navigateToDestination();

    setTimeout(() => {
      Alert.alert(
        'Payment Cancelled',
        'Your payment was cancelled. You can try booking again from the home screen.',
      );
    }, 500);
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);

    const url = navState.url;
    console.log('WebView URL changed:', url);

    if (url.includes('success') || url.includes('completed')) {
      if (paymentProcessedRef.current) {
        console.log('⚠️ Payment already processed, skipping...');
        return;
      }
      paymentProcessedRef.current = true;
      handlePaymentSuccess();
    } else if (url.includes('cancel') || url.includes('failed')) {
      if (paymentProcessedRef.current) {
        console.log('⚠️ Payment cancellation already processed, skipping...');
        return;
      }
      paymentProcessedRef.current = true;
      handlePaymentCancellation();
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Close Payment',
      'Are you sure you want to close the payment page?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>PayOS Payment</Text>

        <Pressable
          onPress={() => webViewRef.current?.reload()}
          style={styles.headerButton}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.morentBlue} />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
}

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
import { bookingExtensionPaymentService, additionalFeePaymentService } from '../../../lib/api';
import { styles } from './styles/payosWebview.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const navigateToDestination = (isSuccess: boolean = true) => {
    if (returnScreen === 'StaffScreen') {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'auth' as any,
            state: {
              routes: [{ name: 'staffStack' as any }],
              index: 0,
            },
          },
        ],
      });
    } else {
      // Navigate to bookings list screen for success, home screen for cancellation
      const targetScreen = isSuccess ? 'Bookings' : 'Home';
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'auth' as any,
            state: {
              routes: [
                {
                  name: 'tabStack' as any,
                  state: {
                    routes: [{ name: targetScreen as any }],
                    index: 0,
                  },
                },
              ],
              index: 0,
            },
          },
        ],
      });
    }
  };

  const updateBookingStatus = async (status: 'Confirmed' | 'Canceled') => {
    if (!bookingId || bookingId === 'pending') {
      console.log(' No valid booking ID, skipping booking status update');
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
      console.log(' Booking update response status:', response.status);
      console.log(' Booking update response body:', responseText);

      if (!response.ok) {
        console.error(' Booking update FAILED - Status:', response.status);
        return false;
      }

      console.log(' Booking status updated successfully');
      return true;
    } catch (err) {
      console.error(' Failed to update booking status:', err);
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
        console.error(' Payment update failed with status:', response.status);
        return false;
      }

      console.log(' Payment status updated to Success');
      return true;
    } catch (err) {
      console.error('Failed to update payment status:', err);
      return false;
    }
  };

  const updateRentalFeeStatus = async () => {
    console.log('Updating rental fee payment status...');
    const rentalPaymentUpdateUrl = `${API_CONFIG.BASE_URL.replace(
      '/api',
      '',
    )}/UpdatePayment/Booking/RentalPayment`;

    try {
      const response = await fetch(rentalPaymentUpdateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          status: 'Paid',
        }),
      });

      const responseText = await response.text();
      console.log('Rental fee payment update response status:', response.status);
      console.log('Rental fee payment update response body:', responseText);

      if (!response.ok) {
        console.error(' Rental fee payment update failed with status:', response.status);
        return false;
      }

      console.log(' Rental fee payment status updated to Paid');
      return true;
    } catch (err) {
      console.error(' Failed to update rental fee payment status:', err);
      return false;
    }
  };

  const handleBookingExtensionPayment = async () => {
    console.log('Handling booking extension payment...');

    try {
      // Check if there's a booking extension payment and handle it
      const result = await bookingExtensionPaymentService.handlePayOSCompletion(
        bookingId,
        paymentUrl
      );

      if (result?.data?.success && result?.data?.wasUpdated) {
        console.log(' Booking extension payment updated successfully');
      } else if (result?.data?.success && !result?.data?.wasUpdated) {
        console.log('ℹ Booking extension payment was already completed');
      } else {
        console.log('ℹ No booking extension payment found or update needed');
      }
    } catch (err) {
      console.error(' Failed to handle booking extension payment:', err);

    }
  };

  const handleAdditionalFeePayment = async () => {
    console.log('🎯 === STARTING ADDITIONAL FEE PAYMENT HANDLER ===');
    console.log('🎯 Booking ID:', bookingId);
    console.log('🎯 Payment URL:', paymentUrl);

    if (!bookingId || bookingId === 'undefined' || bookingId === 'null' || bookingId === 'pending') {
      console.log('⚠️ Invalid booking ID for additional fee payment:', bookingId);
      return false;
    }

    try {
      console.log('🔄 Calling additionalFeePaymentService.handleAdditionalFeePayOSCompletion...');

      // Check if there's an additional fee payment and handle it
      const result = await additionalFeePaymentService.handleAdditionalFeePayOSCompletion(
        bookingId,
        paymentUrl
      );

      console.log('📋 Additional fee payment service returned:');
      console.log('📋 Result:', JSON.stringify(result, null, 2));

      if (result?.error) {
        console.error('❌ Additional fee payment service error:', result.error.message);
        console.error('❌ Full error:', result.error);
        return false;
      }

      if (!result?.data) {
        console.error('❌ Additional fee payment service returned no data');
        return false;
      }

      const { success, wasUpdated, orderCode } = result.data;
      console.log('📋 Service result details:', { success, wasUpdated, orderCode });

      if (success && wasUpdated) {
        console.log('✅ Additional fee payment updated successfully');
        console.log('✅ OrderCode that was updated:', orderCode);
        return true;
      } else if (success && !wasUpdated) {
        console.log('ℹ️ Additional fee payment was already completed');
        console.log('ℹ️ OrderCode (already completed):', orderCode);
        return true;
      } else {
        console.log('ℹ️ Additional fee payment service returned success=false');
        return false;
      }
    } catch (err) {
      console.error('💥 Exception in handleAdditionalFeePayment:', err);
      console.error('💥 Error details:', JSON.stringify(err, null, 2));
      // Don't fail the entire flow for additional fee payment issues
      return false;
    }
  };

  const testDirectPatchCall = async (orderCode: number) => {
    console.log('🧪 === TESTING DIRECT PATCH CALL ===');
    console.log('🧪 OrderCode:', orderCode);

    try {
      // Get authentication token
      const token = await AsyncStorage.getItem("token");
      console.log('🧪 Auth token available:', !!token);

      const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
      const url = `${baseUrl}/UpdatePayment/Booking/PaymentOrderCode`;

      const payload = {
        orderCode: orderCode,
        status: 'Paid',
        method: 'payos'
      };

      console.log('🧪 Direct PATCH URL:', url);
      console.log('🧪 Direct PATCH payload:', JSON.stringify(payload, null, 2));

      const headers: Record<string, string> = {
        'accept': '*/*',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🧪 Direct PATCH headers:', JSON.stringify(headers, null, 2));

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      console.log('🧪 Direct PATCH response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🧪 Direct PATCH failed:', errorText);
        return false;
      }

      const responseText = await response.text();
      console.log('🧪 Direct PATCH success response:', responseText);
      return true;

    } catch (error) {
      console.error('🧪 Direct PATCH exception:', error);
      return false;
    }
  };

  const testDirectServiceCall = async () => {
    console.log('🧪 === TESTING DIRECT SERVICE CALL ===');
    console.log('🧪 Booking ID:', bookingId);

    try {
      // First, let's check what payments exist
      console.log('🧪 Step 1: Checking payments for booking...');
      const checkResult = await additionalFeePaymentService.checkAdditionalFeePayment(bookingId);
      console.log('🧪 Check result:', JSON.stringify(checkResult, null, 2));

      if (checkResult.data?.hasAdditionalFee && checkResult.data?.isPending && checkResult.data?.additionalFeePayment) {
        const orderCode = checkResult.data.additionalFeePayment.orderCode;
        console.log('🧪 Step 2: Found pending payment with orderCode:', orderCode);

        // Now test the update directly
        console.log('🧪 Step 3: Testing direct update...');
        const updateResult = await additionalFeePaymentService.updateAdditionalFeePaymentStatus(orderCode);
        console.log('🧪 Update result:', JSON.stringify(updateResult, null, 2));

        return updateResult;
      } else {
        console.log('🧪 No pending additional fee payment found');
        return null;
      }
    } catch (error) {
      console.error('🧪 Service call exception:', error);
      return null;
    }
  };

  const handlePaymentSuccess = async () => {
    console.log('🚀 === HANDLE PAYMENT SUCCESS CALLED ===');
    console.log('=== Payment Success Detected ===');
    console.log('🎯 Booking ID:', bookingId);
    console.log('🔗 Payment URL:', paymentUrl);
    console.log('🔗 Return Screen:', returnScreen);

    // TEMPORARY: Test direct PATCH call with the current pending orderCode
    console.log('🧪 Testing direct PATCH call with orderCode 1766521979542...');
    await testDirectPatchCall(1766521979542);

    // TEMPORARY: Test direct service call
    console.log('🧪 Testing direct service call...');
    await testDirectServiceCall();

    // For additional fee payments, we should focus on updating the additional fee status
    // rather than booking status (which might already be confirmed)

    // Always try to handle additional fee payment first
    console.log('🎯 Processing additional fee payment...');
    const additionalFeeResult = await handleAdditionalFeePayment();
    console.log('📋 Additional fee payment processing result:', additionalFeeResult);

    if (additionalFeeResult) {
      console.log('✅ Additional fee payment processed successfully');
    } else {
      console.log('⚠️ Additional fee payment processing failed or not needed');
    }

    // Only update booking status if we have a valid booking ID and it's not already confirmed
    if (bookingId && bookingId !== 'pending') {
      console.log('🔄 Attempting to update booking status...');
      const bookingUpdated = await updateBookingStatus('Confirmed');

      if (bookingUpdated) {
        console.log('✅ Booking status updated successfully');
        // Update both booking fee and rental fee payments
        await updatePaymentStatus();
        await updateRentalFeeStatus();

        // Handle booking extension payment if applicable
        await handleBookingExtensionPayment();
      } else {
        console.log('⚠️ Booking update failed or not needed, continuing...');
      }
    } else {
      console.log('ℹ️ No valid booking ID, skipping booking status updates');
    }

    console.log('🏁 Navigating to destination...');
    navigateToDestination(true);
  };

  const handlePaymentCancellation = async () => {
    console.log('=== Payment Cancelled Detected ===');
    console.log('Booking ID:', bookingId);

    if (bookingId && bookingId !== 'pending') {
      await updateBookingStatus('Canceled');
    }

    navigateToDestination(false);

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

    // Check for PayOS success URL pattern
    if (url.includes('pay.payos.vn') && url.includes('/success')) {
      if (paymentProcessedRef.current) {
        console.log(' Payment already processed, skipping...');
        return;
      }
      paymentProcessedRef.current = true;
      console.log('🎉 PayOS payment success detected!');
      console.log('🔗 Success URL:', url);
      console.log('🎯 About to call handlePaymentSuccess...');

      // Add a small delay to ensure the success page is fully loaded
      setTimeout(() => {
        handlePaymentSuccess();
      }, 1000);
      return;
    }

    // Block external website navigation after payment
    if (url.includes('cra-morent.vercel.app') || url.includes('payment-success') || url.includes('payment-cancel')) {
      console.log(' Blocking external website navigation:', url);
      // Don't allow navigation to external pages
      return;
    }

    // Handle other success/completion patterns
    if (url.includes('success') || url.includes('completed')) {
      if (paymentProcessedRef.current) {
        console.log(' Payment already processed, skipping...');
        return;
      }
      paymentProcessedRef.current = true;
      console.log('🎉 Generic success pattern detected:', url);
      setTimeout(() => {
        handlePaymentSuccess();
      }, 1000);
    } else if (url.includes('cancel') || url.includes('failed')) {
      if (paymentProcessedRef.current) {
        console.log(' Payment cancellation already processed, skipping...');
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
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url;
          console.log('WebView should start load:', url);

          // Allow PayOS URLs
          if (url.includes('pay.payos.vn')) {
            return true;
          }

          // Block external page navigation and handle payment results
          if (url.includes('cra-morent.vercel.app') || url.includes('payment-success') || url.includes('payment-cancel')) {
            console.log(' Blocking external navigation to:', url);

            if (!paymentProcessedRef.current) {
              paymentProcessedRef.current = true;

              // Check for cancellation first
              if (url.includes('payment-cancel') || url.includes('status=CANCELLED') || url.includes('cancel=true')) {
                console.log(' Payment cancellation detected from blocked URL, navigating to home...');
                handlePaymentCancellation();
              }
              // Then check for success
              else if (url.includes('payment-success') || url.includes('status=PAID')) {
                console.log(' Payment success detected from blocked URL, navigating to bookings...');
                handlePaymentSuccess();
              }
            }

            return false;
          }


          return true;
        }}
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

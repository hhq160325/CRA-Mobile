import React, {useRef, useState} from 'react';
import {View, Text, ActivityIndicator, Pressable, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {colors} from '../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {API_CONFIG} from '../../../lib/api/config';

type PayOSWebViewRouteProp = RouteProp<
  {params: {paymentUrl: string; bookingId?: string; returnScreen?: string}},
  'params'
>;

export default function PayOSWebViewScreen() {
  const route = useRoute<PayOSWebViewRouteProp>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {paymentUrl, bookingId, returnScreen} = (route.params as any) || {};

  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const paymentProcessedRef = useRef(false);

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

      console.log('=== Payment Success Detected ===');
      console.log('URL:', url);
      console.log('Booking ID:', bookingId);

      if (bookingId && bookingId !== 'pending') {
        console.log('Updating booking status to Confirmed for:', bookingId);

        const updateUrl = `${API_CONFIG.BASE_URL}/Booking/UpdateBooking`;

        const updatePayload = {
          bookingId: bookingId,
          status: 'Confirmed',
        };
        console.log(
          '📤 Sending booking update:',
          JSON.stringify(updatePayload),
        );

        fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        })
          .then(async response => {
            console.log('📥 Booking update response status:', response.status);
            const responseText = await response.text();
            console.log('📥 Booking update response body:', responseText);

            if (!response.ok) {
              console.error(
                '❌ Booking update FAILED - Status:',
                response.status,
              );
              console.error('❌ Error response:', responseText);
            } else {
              console.log('✅ Booking status updated successfully');
            }

            return responseText;
          })
          .then(() => {
            console.log('Updating payment status...');
            const paymentUpdateUrl = `${API_CONFIG.BASE_URL.replace(
              '/api',
              '',
            )}/UpdatePayment/Booking/BookingPayment`;

            return fetch(paymentUpdateUrl, {
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
          })
          .then(async response => {
            console.log('Payment update response status:', response.status);
            const responseText = await response.text();
            console.log('Payment update response body:', responseText);

            if (!response.ok) {
              console.error(
                '❌ Payment update failed with status:',
                response.status,
              );
            } else {
              console.log('✅ Payment status updated to Success');
            }
          })
          .catch(err => {
            console.error('❌ Failed to update booking/payment status:', err);
            console.error('Error details:', err.message);
          })
          .finally(() => {
            if (returnScreen === 'StaffScreen') {
              console.log(`✅ Payment completed, navigating to staffStack`);
              navigation.reset({
                index: 0,
                routes: [{name: 'staffStack' as any}],
              });
            } else {
              console.log(`✅ Payment completed, navigating to Home screen`);
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'tabStack' as any,
                    state: {
                      routes: [{name: 'Home' as any}],
                      index: 0,
                    },
                  },
                ],
              });
            }
          });
      } else {
        console.log('⚠️ No valid booking ID, skipping booking status update');

        if (returnScreen === 'StaffScreen') {
          console.log(`Navigating to staffStack`);
          navigation.reset({
            index: 0,
            routes: [{name: 'staffStack' as any}],
          });
        } else {
          console.log(`Navigating to Home screen`);
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'tabStack' as any,
                state: {
                  routes: [{name: 'Home' as any}],
                  index: 0,
                },
              },
            ],
          });
        }
      }
    } else if (url.includes('cancel') || url.includes('failed')) {
      if (paymentProcessedRef.current) {
        console.log('⚠️ Payment cancellation already processed, skipping...');
        return;
      }
      paymentProcessedRef.current = true;

      console.log('=== Payment Cancelled Detected ===');
      console.log('URL:', url);
      console.log('Booking ID:', bookingId);

      if (bookingId && bookingId !== 'pending') {
        console.log('Updating booking status to Canceled for:', bookingId);

        const updateUrl = `${API_CONFIG.BASE_URL}/Booking/UpdateBooking`;

        fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: bookingId,
            status: 'Canceled',
          }),
        })
          .then(response => {
            console.log('Booking update response status:', response.status);
            return response.text();
          })
          .then(responseText => {
            console.log('Booking update response:', responseText);
            console.log('✓ Booking status updated to Canceled');
          })
          .catch(err => {
            console.error('✗ Failed to update booking status:', err);
          });
      } else {
        console.log('⚠️ No valid booking ID, skipping booking status update');
      }

      if (returnScreen === 'StaffScreen') {
        console.log(`Payment cancelled, navigating to staffStack`);
        navigation.reset({
          index: 0,
          routes: [{name: 'staffStack' as any}],
        });
      } else {
        console.log(`Payment cancelled, navigating to Home screen`);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'tabStack' as any,
              state: {
                routes: [{name: 'Home' as any}],
                index: 0,
              },
            },
          ],
        });
      }

      setTimeout(() => {
        Alert.alert(
          'Payment Cancelled',
          'Your payment was cancelled. You can try booking again from the home screen.',
        );
      }, 500);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Close Payment',
      'Are you sure you want to close the payment page?',
      [
        {text: 'No', style: 'cancel'},
        {text: 'Yes', onPress: () => navigation.goBack()},
      ],
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <Pressable onPress={handleClose} style={{padding: 8}}>
          <MaterialIcons name="close" size={24} color={colors.primary} />
        </Pressable>

        <Text style={{fontSize: 16, fontWeight: '600', color: colors.primary}}>
          PayOS Payment
        </Text>

        <Pressable
          onPress={() => webViewRef.current?.reload()}
          style={{padding: 8}}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{uri: paymentUrl}}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        style={{flex: 1}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.background,
            }}>
            <ActivityIndicator size="large" color={colors.morentBlue} />
            <Text style={{marginTop: 16, color: colors.placeholder}}>
              Loading payment page...
            </Text>
          </View>
        )}
      />

      {/* Loading Overlay */}
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text style={{marginTop: 16, color: colors.placeholder}}>
            Loading...
          </Text>
        </View>
      )}
    </View>
  );
}

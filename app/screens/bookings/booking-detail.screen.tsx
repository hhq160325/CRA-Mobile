import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { bookingsService } from '../../../lib/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';

export default function BookingDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { user } = useAuth();
  const { id } = (route.params as any) || {};
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await bookingsService.getBookingById(id);

      if (mounted && res.data) {
        // Security check: Only allow user to view their own bookings
        if (res.data.userId !== user?.id) {
          console.log("BookingDetail: Access denied - booking belongs to different user");
          Alert.alert(
            "Access Denied",
            "You don't have permission to view this booking.",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack()
              }
            ]
          );
          setLoading(false);
          return;
        }
        setBooking(res.data);
      }
      setLoading(false);
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id, user?.id]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#00B050';
      case 'cancelled':
        return '#EF4444';
      default:
        return colors.placeholder;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'Upcoming';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text style={{ marginTop: 16, color: colors.placeholder }}>Loading booking...</Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="error-outline" size={64} color={colors.placeholder} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.placeholder }}>
            Booking not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Status Badge */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: getStatusColor(booking.status),
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20
          }}>
            <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
              {getStatusText(booking.status)}
            </Text>
          </View>
          <Text style={{ marginTop: 12, fontSize: 12, color: colors.placeholder }}>
            Booking ID: {booking.id?.substring(0, 8)}...
          </Text>
        </View>

        {/* Customer Info */}
        {booking.driverInfo && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="person" size={24} color={colors.morentBlue} />
              <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
                Customer Information
              </Text>
            </View>
            {booking.driverInfo.name && (
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>Name:</Text>
                <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                  {booking.driverInfo.name}
                </Text>
              </View>
            )}
            {booking.driverInfo.email && (
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>Email:</Text>
                <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                  {booking.driverInfo.email}
                </Text>
              </View>
            )}
            {booking.driverInfo.phone && (
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>Phone:</Text>
                <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                  {booking.driverInfo.phone}
                </Text>
              </View>
            )}
            {booking.driverInfo.licenseNumber && (
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>License:</Text>
                <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                  {booking.driverInfo.licenseNumber}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Car Info */}
        {booking.carImage && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
          }}>
            <Image
              source={{ uri: booking.carImage }}
              style={{
                width: '100%',
                height: 150,
                borderRadius: 8,
                backgroundColor: colors.background
              }}
              resizeMode="cover"
            />
            <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 12, color: colors.primary }}>
              {booking.carName || 'Car'}
            </Text>
          </View>
        )}

        {/* Pickup Info */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialIcons name="location-on" size={24} color={colors.morentBlue} />
            <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
              Pick-up
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.primary, marginBottom: 4 }}>
            {booking.pickupLocation || 'N/A'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.placeholder }}>
            {formatDate(booking.startDate)}
          </Text>
        </View>

        {/* Dropoff Info */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialIcons name="flag" size={24} color={colors.morentBlue} />
            <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
              Drop-off
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.primary, marginBottom: 4 }}>
            {booking.dropoffLocation || 'N/A'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.placeholder }}>
            {formatDate(booking.endDate)}
          </Text>
        </View>

        {/* Price Info */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialIcons name="payment" size={24} color={colors.morentBlue} />
            <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
              Payment
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 14, color: colors.placeholder }}>Total Price</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.morentBlue }}>
              {booking.totalPrice?.toLocaleString() || '0'} VND
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: colors.placeholder }}>Booking Date</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder }}>
              {formatDate(booking.bookingDate)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

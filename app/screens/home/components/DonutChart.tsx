import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import { bookingsService, carsService } from '../../../../lib/api';

interface ChartDataItem {
  carId: string;
  carName: string;
  bookingCount: number;
  color: string;
}

const chartColors = [
  '#1E3A8A', // Dark blue
  '#3B82F6', // Blue
  '#60A5FA', // Light blue
  '#93C5FD', // Lighter blue
  '#DBEAFE', // Very light blue
];

export default function DonutChart() {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopRentalCars();
  }, []);

  const loadTopRentalCars = async () => {
    try {
      console.log('📊 DonutChart: Loading top rental cars...');
      console.log('📊 DonutChart: API URL:', 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/Booking/GetAllBookings');

      // Get all bookings
      const bookingsResult = await bookingsService.getAllBookings();

      console.log('📊 DonutChart: Bookings API result:', {
        hasError: !!bookingsResult.error,
        hasData: !!bookingsResult.data,
        dataLength: bookingsResult.data?.length,
        errorMessage: bookingsResult.error?.message,
        sampleBooking: bookingsResult.data?.[0]
      });

      if (bookingsResult.error) {
        console.error('📊 DonutChart: Bookings API error:', bookingsResult.error);
        setLoading(false);
        return;
      }

      if (!bookingsResult.data || bookingsResult.data.length === 0) {
        console.log('📊 DonutChart: No bookings data available - empty array or null');
        setLoading(false);
        return;
      }

      console.log('📊 DonutChart: Found', bookingsResult.data.length, 'bookings');
      console.log('📊 DonutChart: Sample bookings:', bookingsResult.data.slice(0, 3).map(b => ({
        id: b.id,
        carId: b.carId,
        carName: b.carName,
        status: b.status
      })));

      // Count bookings per car - use both carId and carName as fallback
      const carBookingCounts: Record<string, { count: number; carName?: string }> = {};

      bookingsResult.data.forEach(booking => {
        let key = booking.carId;

        // If no carId, try to use carName as identifier
        if (!key && booking.carName) {
          key = `name_${booking.carName}`;
        }

        if (key) {
          if (!carBookingCounts[key]) {
            carBookingCounts[key] = { count: 0, carName: booking.carName };
          }
          carBookingCounts[key].count += 1;

          // Update carName if we have it
          if (booking.carName && !carBookingCounts[key].carName) {
            carBookingCounts[key].carName = booking.carName;
          }
        }
      });

      console.log('📊 DonutChart: Car booking counts:', carBookingCounts);

      // Get top 5 cars by booking count
      const topCars = Object.entries(carBookingCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([key, data]) => ({
          key,
          count: data.count,
          carName: data.carName,
          isCarId: !key.startsWith('name_')
        }));

      console.log('📊 DonutChart: Top cars:', topCars);

      // Create chart items
      const chartItems: ChartDataItem[] = [];

      for (let i = 0; i < topCars.length; i++) {
        const { key, count, carName, isCarId } = topCars[i];

        let finalCarName = carName || 'Unknown Car';

        // If we have a carId, try to fetch more details
        if (isCarId && key) {
          try {
            console.log('📊 DonutChart: Fetching car details for carId:', key);
            const carResult = await carsService.getCarById(key);

            if (carResult.data) {
              finalCarName = carResult.data.name || carName || 'Unknown Car';
              console.log('📊 DonutChart: Got car name from API:', finalCarName);
            } else {
              console.log('📊 DonutChart: No car data returned for:', key);
            }
          } catch (err) {
            console.log('📊 DonutChart: Error fetching car details for', key, err);
          }
        }

        chartItems.push({
          carId: key,
          carName: finalCarName,
          bookingCount: count,
          color: chartColors[i] || '#94A3B8',
        });
      }

      console.log('📊 DonutChart: Final chart data:', chartItems);

      if (chartItems.length === 0) {
        console.log('📊 DonutChart: No chart items created - no valid car data found');
      }

      setChartData(chartItems);
    } catch (err) {
      console.error('📊 DonutChart: Error loading top rental cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalBookings = chartData.reduce((sum, item) => sum + item.bookingCount, 0);

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: scale(40) }}>
        <ActivityIndicator size="small" color={colors.morentBlue} />
        <Text
          style={{
            marginTop: scale(8),
            color: colors.placeholder,
            fontSize: scale(12),
          }}>
          Loading statistics...
        </Text>
      </View>
    );
  }

  if (chartData.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: scale(40) }}>
        <Text style={{ color: colors.placeholder, fontSize: scale(14) }}>
          No data available
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: scale(150),
          height: scale(150),
          borderRadius: scale(75),
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: scale(16),
          borderWidth: scale(20),
          borderColor: '#3563E9',
          position: 'relative',
        }}>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: scale(24),
              fontWeight: '700',
              color: colors.primary,
            }}>
            {totalBookings.toLocaleString()}
          </Text>
          <Text
            style={{
              fontSize: scale(12),
              color: colors.placeholder,
              marginTop: scale(4),
            }}>
            Total Bookings
          </Text>
        </View>
      </View>

      <View style={{ width: '100%' }}>
        {chartData.map(item => (
          <View
            key={item.carId}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: scale(12),
            }}>
            <View
              style={{
                width: scale(12),
                height: scale(12),
                borderRadius: scale(2),
                backgroundColor: item.color,
                marginRight: scale(12),
              }}
            />
            <Text
              style={{
                fontSize: scale(12),
                color: colors.primary,
                fontWeight: '500',
                flex: 1,
              }}>
              {item.carName}
            </Text>
            <Text
              style={{
                fontSize: scale(12),
                color: colors.placeholder,
                fontWeight: '600',
              }}>
              {item.bookingCount.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

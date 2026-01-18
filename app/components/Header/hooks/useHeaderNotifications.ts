import { useState } from 'react';
import { useAuth } from '../../../../lib/auth-context';
import {
  notificationService,
  type Notification,
} from '../../../../lib/api/services/notification.service';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../../navigators/navigation-route';

export function useHeaderNotifications() {
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const loadNotifications = async () => {
    if (!user?.id) {
      console.log(" No user ID available for notifications");
      return;
    }

    console.log(" Loading notifications for user ID:", user.id);
    console.log(" User role:", user.role);
    setLoadingNotifications(true);
    try {
      const { data, error } = await notificationService.getNotifications(user.id, user.role);
      if (error) {
        console.log(
          ' Failed to load notifications (this is normal if no notifications exist)',
        );
        setNotifications([]);
        return;
      }
      if (data) {
        console.log(" Loaded notifications:", data.length);
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.log(
        ' Failed to load notifications (this is normal if no notifications exist)',
      );
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isViewed) {
      await notificationService.markAsRead(notification.id);
    }


    const content = notification.content.toLowerCase();
    if (content.includes('booking') && content.includes('bk')) {

      const bookingMatch = content.match(/bk\d+-\d+-\d+-\d+/i);
      if (bookingMatch) {
        const bookingNumber = bookingMatch[0].toUpperCase();
        console.log(" Extracted booking number:", bookingNumber);

        try {

          const { bookingsService } = await import('../../../../lib/api');
          const bookingResult = await bookingsService.getBookingByNumber(bookingNumber);

          if (bookingResult.data && bookingResult.data.id) {
            console.log(" Found booking ID:", bookingResult.data.id);
            navigation.navigate('BookingDetail' as any, {
              id: bookingResult.data.id,
            });
          } else {
            console.log(" Could not find booking ID for number:", bookingNumber);

            navigation.navigate('BookingDetail' as any, {
              bookingNumber: bookingNumber,
            });
          }
        } catch (error) {
          console.error(" Error fetching booking by number:", error);

          navigation.navigate('BookingDetail' as any, {
            bookingNumber: bookingNumber,
          });
        }
      }
    }

    loadNotifications();
  };

  return {
    notifications,
    loadingNotifications,
    loadNotifications,
    handleNotificationClick,
  };
}

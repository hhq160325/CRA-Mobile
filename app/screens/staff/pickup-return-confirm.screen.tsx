import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scheduleService } from '../../../lib/api/services/schedule.service';
import { useAuth } from '../../../lib/auth-context';
import { usePickupConfirm } from './hooks/usePickupConfirm';
import { useImagePicker } from './hooks/useImagePicker';
import BookingCard from './components/BookingCard';
import LocationInfoSection from './components/LocationInfoSection';
import NotesSection from './components/NotesSection';
import ImageGallerySection from './components/ImageGallerySection';
import { styles } from './styles/pickupConfirm.styles';

type PickupReturnConfirmRouteProp = RouteProp<
  { params: { bookingId: string } },
  'params'
>;

export default function PickupReturnConfirmScreen() {
  const route = useRoute<PickupReturnConfirmRouteProp>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { user } = useAuth();
  const { bookingId } = (route.params as any) || {};

  const {
    booking,
    loading,
    error,
    isAlreadyCheckedIn,
    isAlreadyCheckedOut,
    existingCheckInData,
    existingCheckOutData,
    initialDescription,
  } = usePickupConfirm(bookingId);
  const { selectedImages, showImagePickerOptions, removeImage } =
    useImagePicker(10);
  const [description, setDescription] = useState(initialDescription);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialDescription) {
      setDescription(initialDescription);
    }
  }, [initialDescription]);


  useEffect(() => {
    // Only auto-navigate to return screen if pickup is done but return is NOT done
    if (!loading && isAlreadyCheckedIn && !isAlreadyCheckedOut && existingCheckInData && existingCheckInData.images.length > 0) {
      // console.log(' Pickup completed, return not done - auto-navigating to return screen...');

      const timer = setTimeout(() => {
        navigation.navigate('VehicleReturn' as any, { bookingId });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading, isAlreadyCheckedIn, isAlreadyCheckedOut, existingCheckInData, bookingId, navigation]);

  useEffect(() => { }, [user]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const handleProceedToReturn = () => {
    navigation.navigate('VehicleReturn' as any, { bookingId });
  };

  const handleConfirmPickup = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Staff ID not found. Please log in again.');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert(
        'Images Required',
        'Please upload at least one photo of the vehicle condition.',
      );
      return;
    }

    Alert.alert(
      'Confirm Pickup',
      'Are you sure you want to confirm this pickup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSubmitting(true);

              // console.log(' Starting pickup confirmation...');
              // console.log(' Booking ID:', bookingId);
              // console.log(' Staff ID:', user.id);
              // console.log(' Images count:', selectedImages.length);

              const result = await scheduleService.checkIn(
                bookingId,
                selectedImages,
                user.id,
                description || 'Pickup confirmed',
              );

              // console.log(' Check-in result:', result);

              if (result.error) {
                // console.error(' Check-in error:', result.error);
                Alert.alert('Error', result.error.message);
                setSubmitting(false);
                return;
              }


              // console.log(' Pickup confirmed successfully, navigating to StaffScreen');
              setSubmitting(false);

              Alert.alert('Success', 'Pickup confirmed successfully!', [
                {
                  text: 'OK',
                  onPress: () => {

                    navigation.navigate('StaffScreen' as any);
                  },
                },
              ]);
            } catch (error) {
              // console.error(' Exception during pickup confirmation:', error);
              Alert.alert(
                'Error',
                `Failed to confirm pickup: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleReportUser = () => {
    // Navigate to report user screen or show report modal
    Alert.alert(
      'Report User',
      'This feature allows you to report issues with the customer or vehicle condition.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Report',
          onPress: () => {
            // TODO: Navigate to report creation screen
            // navigation.navigate('CreateReport', { bookingId, customerId: booking?.userId });
            console.log('Navigate to report creation for booking:', bookingId);
          },
        },
      ],
    );
  };

  // Show full return view if both pickup and return are done
  if (!loading && isAlreadyCheckedIn && isAlreadyCheckedOut && existingCheckInData && existingCheckOutData && booking) {
    const pickupDateTime = formatDateTime(booking.pickupTime);
    const dropoffDateTime = formatDateTime(booking.dropoffTime);

    return (
      <View style={styles.container}>
        <Header />

        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Back to Staff</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>

          {/* Completion Status Badge */}
          <View style={[styles.loadingContainer, { marginBottom: 20 }]}>
            <MaterialIcons name="check-circle" size={48} color="#10b981" />
            <Text style={[styles.loadingText, { color: '#10b981', marginTop: 8, fontSize: 18 }]}>
              Return Completed!
            </Text>
          </View>

          {/* Booking Card */}
          <BookingCard
            carImage={booking.carImage}
            carName={booking.carName}
            carLicensePlate={booking.carLicensePlate}
            bookingId={booking.id}
            bookingNumber={booking.bookingNumber}
            customerName={booking.customerName}
            amount={booking.amount}
            statusText="Completed"
            statusColor="#d1fae5"
          />

          {/* Location Information */}
          <LocationInfoSection
            title="Pickup Information"
            iconName="location-on"
            iconColor={colors.morentBlue}
            location={booking.pickupPlace}
            dateTime={pickupDateTime}
          />

          <LocationInfoSection
            title="Dropoff Information"
            iconName="location-off"
            iconColor="#ef4444"
            location={booking.dropoffPlace}
            dateTime={dropoffDateTime}
          />

          {/* Pickup Section */}
          <NotesSection
            title="Pickup Notes"
            value={existingCheckInData.description}
            onChangeText={() => { }} // Read-only
            placeholder=""
            editable={false}
          />

          <ImageGallerySection
            title={`Pickup Photos (${existingCheckInData.images.length})`}
            images={existingCheckInData.images}
            iconName="photo-camera"
            iconColor={colors.primary}
            onAddPhoto={undefined}
            onRemoveImage={undefined}
            isReadOnly={true}
          />

          {/* Return Section */}
          <NotesSection
            title="Return Notes"
            value={existingCheckOutData.description}
            onChangeText={() => { }} // Read-only
            placeholder=""
            editable={false}
          />

          <ImageGallerySection
            title={`Return Photos (${existingCheckOutData.images.length})`}
            images={existingCheckOutData.images}
            iconName="photo-camera"
            iconColor="#ef4444"
            onAddPhoto={undefined}
            onRemoveImage={undefined}
            isReadOnly={true}
          />

          <View style={styles.actionButtons}>
            <Pressable
              onPress={handleReportUser}
              style={[styles.confirmButton, { backgroundColor: '#ef4444' }]}>
              <MaterialIcons name="report-problem" size={20} color={colors.white} />
              <Text style={styles.confirmButtonText}>Report User</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!loading && isAlreadyCheckedIn && !isAlreadyCheckedOut && existingCheckInData && existingCheckInData.images.length > 0) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <MaterialIcons name="check-circle" size={64} color="#10b981" />
          <Text style={[styles.loadingText, { color: '#10b981', marginTop: 16 }]}>
            Pickup already completed!
          </Text>
          <Text style={[styles.loadingText, { fontSize: 14, marginTop: 8 }]}>
            Redirecting to return screen...
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButtonError}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const pickupDateTime = formatDateTime(booking.pickupTime);
  const dropoffDateTime = formatDateTime(booking.dropoffTime);

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Back to Staff</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <BookingCard
          carImage={booking.carImage}
          carName={booking.carName}
          carLicensePlate={booking.carLicensePlate}
          bookingId={booking.id}
          bookingNumber={booking.bookingNumber}
          customerName={booking.customerName}
          amount={booking.amount}
          statusText={
            booking.status === 'completed' ? 'Completed' : 'Confirmed'
          }
          statusColor="#d1fae5"
        />

        <LocationInfoSection
          title="Pickup Information"
          iconName="location-on"
          iconColor={colors.morentBlue}
          location={booking.pickupPlace}
          dateTime={pickupDateTime}
        />

        <LocationInfoSection
          title="Dropoff Information"
          iconName="location-off"
          iconColor="#ef4444"
          location={booking.dropoffPlace}
          dateTime={dropoffDateTime}
        />

        <NotesSection
          title={isAlreadyCheckedIn ? 'Pickup Notes' : 'Notes (Optional)'}
          value={description}
          onChangeText={setDescription}
          placeholder="Add any notes about the vehicle condition..."
          editable={!isAlreadyCheckedIn}
        />

        <ImageGallerySection
          title={
            isAlreadyCheckedIn
              ? 'Pickup Photos (Already Submitted)'
              : `Vehicle Photos (${selectedImages.length}/10)`
          }
          images={
            isAlreadyCheckedIn && existingCheckInData
              ? existingCheckInData.images
              : selectedImages
          }
          iconName="photo-camera"
          iconColor={colors.primary}
          onAddPhoto={!isAlreadyCheckedIn ? showImagePickerOptions : undefined}
          onRemoveImage={!isAlreadyCheckedIn ? removeImage : undefined}
          isReadOnly={isAlreadyCheckedIn}
        />



        <View style={styles.actionButtons}>
          {isAlreadyCheckedIn && isAlreadyCheckedOut ? (
            // Both pickup and return completed - show report button
            <Pressable
              onPress={handleReportUser}
              style={[styles.confirmButton, { backgroundColor: '#ef4444' }]}>
              <MaterialIcons
                name="report-problem"
                size={20}
                color={colors.white}
              />
              <Text style={styles.confirmButtonText}>Report User</Text>
            </Pressable>
          ) : isAlreadyCheckedIn && !isAlreadyCheckedOut ? (
            // Pickup completed, return not completed - proceed to return
            <Pressable
              onPress={handleProceedToReturn}
              style={styles.confirmButton}>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={colors.white}
              />
              <Text style={styles.confirmButtonText}>Proceed to Return</Text>
            </Pressable>
          ) : (
            // Pickup not completed yet
            <Pressable
              onPress={handleConfirmPickup}
              disabled={submitting || selectedImages.length === 0}
              style={[
                styles.confirmButton,
                (submitting || selectedImages.length === 0) &&
                styles.confirmButtonDisabled,
              ]}>
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={colors.white}
                  />
                  <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {colors} from '../../theme/colors';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {scheduleService} from '../../../lib/api/services/schedule.service';
import {useAuth} from '../../../lib/auth-context';
import {useVehicleReturn} from './hooks/useVehicleReturn';
import {useImagePicker} from './hooks/useImagePicker';
import BookingCard from './components/BookingCard';
import ImageGallerySection from './components/ImageGallerySection';
import LocationInfoSection from './components/LocationInfoSection';
import NotesSection from './components/NotesSection';
import ActionButton from './components/ActionButton';
import {vehicleReturnStyles as styles} from './styles/vehicleReturn.styles';

type VehicleReturnRouteProp = RouteProp<
  {params: {bookingId: string}},
  'params'
>;

export default function VehicleReturnScreen() {
  const route = useRoute<VehicleReturnRouteProp>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {user} = useAuth();
  const {bookingId} = (route.params as any) || {};

  const [submitting, setSubmitting] = useState(false);

  const {
    booking,
    loading,
    error,
    pickupImages,
    pickupDescription,
    isAlreadyCheckedOut,
    existingCheckOutData,
    initialDescription,
  } = useVehicleReturn(bookingId);

  const [description, setDescription] = useState(initialDescription);

  const {selectedImages, showImagePickerOptions, removeImage} =
    useImagePicker(5);

  React.useEffect(() => {
    if (initialDescription) {
      setDescription(initialDescription);
    }
  }, [initialDescription]);

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

  const handleConfirmReturn = async () => {
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
      'Confirm Return',
      'Are you sure you want to confirm this vehicle return?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSubmitting(true);

              const result = await scheduleService.checkOut(
                bookingId,
                selectedImages,
                user.id,
                description || 'Return confirmed',
              );

              if (result.error) {
                Alert.alert('Error', result.error.message);
                setSubmitting(false);
                return;
              }

              Alert.alert('Success', 'Vehicle return confirmed successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{name: 'staffStack' as any}],
                    });
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm return');
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

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

  const dropoffDateTime = formatDateTime(booking.dropoffTime);

  return (
    <View style={styles.container}>
      <Header />

      {/* Back Button */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Booking Card */}
        <BookingCard
          carImage={booking.carImage}
          carName={booking.carName}
          carLicensePlate={booking.carLicensePlate}
          bookingId={booking.id}
          customerName={booking.customerName}
          amount={booking.amount}
          statusText="Return"
          statusColor="#fef3c7"
        />

        {/* Pickup Photos Section */}
        {pickupImages.length > 0 && (
          <ImageGallerySection
            title="Pickup Photos"
            images={pickupImages}
            description={pickupDescription}
            iconName="photo-library"
            iconColor="#10b981"
            isReadOnly={true}
          />
        )}

        {/* Return Location */}
        <LocationInfoSection
          title="Return Information"
          iconName="location-off"
          iconColor="#ef4444"
          location={booking.dropoffPlace}
          dateTime={dropoffDateTime}
        />

        {/* Description Input */}
        <NotesSection
          title={
            isAlreadyCheckedOut ? 'Return Notes' : 'Return Notes (Optional)'
          }
          value={description}
          onChangeText={setDescription}
          placeholder="Add any notes about the vehicle condition on return..."
          editable={!isAlreadyCheckedOut}
        />

        {/* Return Photos Section */}
        <ImageGallerySection
          title={
            isAlreadyCheckedOut
              ? 'Return Photos (Already Submitted)'
              : `Return Photos (${selectedImages.length}/5)`
          }
          images={
            isAlreadyCheckedOut && existingCheckOutData
              ? existingCheckOutData.images
              : selectedImages
          }
          iconName="photo-camera"
          iconColor={colors.primary}
          onAddPhoto={!isAlreadyCheckedOut ? showImagePickerOptions : undefined}
          onRemoveImage={!isAlreadyCheckedOut ? removeImage : undefined}
          isReadOnly={isAlreadyCheckedOut}
        />

        {/* Action Button */}
        <ActionButton
          onPress={handleConfirmReturn}
          disabled={selectedImages.length === 0}
          loading={submitting}
          text="Confirm Return"
          isCompleted={isAlreadyCheckedOut}
        />
      </ScrollView>
    </View>
  );
}

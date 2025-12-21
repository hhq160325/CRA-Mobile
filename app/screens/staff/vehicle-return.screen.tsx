import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scheduleService } from '../../../lib/api/services/schedule.service';
import { reportService } from '../../../lib/api/services/report.service';
import { useAuth } from '../../../lib/auth-context';
import { useVehicleReturn } from './hooks/useVehicleReturn';
import { useImagePicker } from './hooks/useImagePicker';
import BookingCard from './components/BookingCard';
import ImageGallerySection from './components/ImageGallerySection';
import LocationInfoSection from './components/LocationInfoSection';
import NotesSection from './components/NotesSection';
import ActionButton from './components/ActionButton';
import AdditionalPaymentSection from './components/AdditionalPaymentSection';
import BookingExtensionSection from './components/BookingExtensionSection';
import GPSLocationCard from './components/GPSLocationCard';
import { vehicleReturnStyles as styles } from './styles/vehicleReturn.styles';
import { fetchBookingExtensionInfo } from './utils/staffHelpers';
import { bookingExtensionService } from '../../../lib/api/services/bookingExtension.service';

type VehicleReturnRouteProp = RouteProp<
  { params: { bookingId: string } },
  'params'
>;

export default function VehicleReturnScreen() {
  const route = useRoute<VehicleReturnRouteProp>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { user } = useAuth();
  const { bookingId } = (route.params as any) || {};

  // console.log(' VehicleReturnScreen: bookingId from route params:', bookingId);

  const [submitting, setSubmitting] = useState(false);
  const [showGPSCard, setShowGPSCard] = useState(false);
  const [returnCompleted, setReturnCompleted] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Report form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [deductedPoints, setDeductedPoints] = useState('0');

  const [extensionInfo, setExtensionInfo] = useState<{
    hasExtension: boolean;
    isPaymentCompleted: boolean;
    extensionDescription?: string;
  }>({ hasExtension: false, isPaymentCompleted: true });

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

  const { selectedImages, showImagePickerOptions, removeImage } =
    useImagePicker(10);

  React.useEffect(() => {
    if (initialDescription) {
      setDescription(initialDescription);
    }
  }, [initialDescription]);

  React.useEffect(() => {
    // Set returnCompleted to true if the return is already checked out
    if (isAlreadyCheckedOut) {
      setReturnCompleted(true);
    }
  }, [isAlreadyCheckedOut]);

  // Debug logging for report section visibility
  React.useEffect(() => {
    // console.log(' VehicleReturn: Report section visibility check:', {
    //   returnCompleted,
    //   isAlreadyCheckedOut,
    //   shouldShowReport: returnCompleted || isAlreadyCheckedOut,
    //   bookingId,
    //   userId: booking?.userId
    // });
  }, [returnCompleted, isAlreadyCheckedOut, booking?.userId]);

  React.useEffect(() => {
    checkExtensionPaymentStatus();
  }, [bookingId]);

  const checkExtensionPaymentStatus = async () => {
    try {
      // console.log(' VehicleReturn: Checking extension payment status for booking:', bookingId);


      const extensionResult = await fetchBookingExtensionInfo(bookingId);

      if (!extensionResult.hasExtension) {
        // console.log(' VehicleReturn: No extension found, allowing return');
        setExtensionInfo({ hasExtension: false, isPaymentCompleted: true });
        return;
      }


      const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';


      const bookingResult = await bookingExtensionService.getBookingById(bookingId);
      const invoiceId = bookingResult.data?.invoiceId;

      if (!invoiceId) {
        // console.log(' VehicleReturn: No invoiceId found, assuming payment not completed');
        setExtensionInfo({
          hasExtension: true,
          isPaymentCompleted: false,
          extensionDescription: extensionResult.extensionDescription
        });
        return;
      }

      const paymentUrl = `${baseUrl}/Invoice/${invoiceId}`;
      const response = await fetch(paymentUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
      });

      if (response.ok) {
        const paymentData = await response.json();
        const extensionPayment = paymentData.find((payment: any) =>
          payment.item === 'Booking Extension'
        );

        const isPaymentCompleted = extensionPayment?.status?.toLowerCase() === 'success';

        // console.log(' VehicleReturn: Extension payment status:', {
        //   hasExtension: true,
        //   isPaymentCompleted,
        //   paymentStatus: extensionPayment?.status
        // });

        setExtensionInfo({
          hasExtension: true,
          isPaymentCompleted,
          extensionDescription: extensionResult.extensionDescription
        });
      } else {
        // console.log(' VehicleReturn: Failed to check payment status, assuming not completed');
        setExtensionInfo({
          hasExtension: true,
          isPaymentCompleted: false,
          extensionDescription: extensionResult.extensionDescription
        });
      }
    } catch (error) {
      // console.error(' VehicleReturn: Error checking extension payment status:', error);
      setExtensionInfo({ hasExtension: false, isPaymentCompleted: true });
    }
  };

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

    // Check extension payment validation
    if (extensionInfo.hasExtension && !extensionInfo.isPaymentCompleted) {
      Alert.alert(
        'Extension Payment Required',
        'This booking has an extension that requires payment. Please complete the extension payment before confirming the return.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Return',
      'Are you sure you want to confirm this vehicle return?',
      [
        { text: 'Cancel', style: 'cancel' },
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

              // console.log('Vehicle return successful');
              setSubmitting(false);
              setReturnCompleted(true);

              Alert.alert(
                'Success',
                'Vehicle return confirmed successfully! You can now report any user issues if needed.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to confirm return');
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  // Report form functionality
  const predefinedTitles = [
    'Traffic Violation',
    'Reckless Driving',
    'Speeding',
    'Running Red Light',
    'Improper Parking',
    'Vehicle Damage',
    'Late Return',
    'Other Violation'
  ];

  const offenseLevels = [
    {
      level: 'Minor Offense',
      points: 10,
      content: 'Minor offense (10 points deducted)',
      color: colors.orange,
    },
    {
      level: 'Major Offense',
      points: 20,
      content: 'Major offense (20 points deducted)',
      color: colors.destructive,
    },
    {
      level: 'Negative Behavior',
      points: 55,
      content: 'Negative behavior (55 points deducted)',
      color: colors.red,
    },
  ];

  const handleOffenseLevelSelect = (offense: typeof offenseLevels[0]) => {
    setDeductedPoints(offense.points.toString());
    setReportContent(offense.content);
  };

  const handleSubmitReport = async () => {
    // Validation
    if (!reportTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a report title.');
      return;
    }

    if (!reportContent.trim()) {
      Alert.alert('Validation Error', 'Please enter report content or select an offense level.');
      return;
    }

    const points = parseInt(deductedPoints);
    if (isNaN(points) || points < 0) {
      Alert.alert('Validation Error', 'Please enter a valid number of deducted points (0 or greater).');
      return;
    }

    if (points > 100) {
      Alert.alert('Validation Error', 'Deducted points cannot exceed 100.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }

    setReportSubmitting(true);

    try {
      // console.log(' Creating user report:', {
      //   title: reportTitle.trim(),
      //   reporterId: user.id,
      //   reportedUserId: booking?.userId,
      //   deductedPoints: points,
      //   bookingId: bookingId
      // });

      const result = await reportService.createUserReport({
        title: reportTitle.trim(),
        content: reportContent.trim(),
        deductedPoints: points,
        reporterId: user.id,
        reportedUserId: booking?.userId || '',
      });

      if (result.error) {
        // console.error(' User report creation failed:', result.error);
        Alert.alert(
          'Report Failed',
          `Failed to submit user report: ${result.error.message}`,
          [{ text: 'OK' }]
        );
        return;
      }

      // console.log(' User report created successfully:', result.data);

      // Get report details for success message
      const reportId = result.data?.reportNo || result.data?.id || 'N/A';
      const reportPoints = points || 0;

      // Debug logging for success message
      // console.log(' Report success details:', {
      //   reportNo: result.data?.reportNo,
      //   id: result.data?.id,
      //   finalReportId: reportId,
      //   deductedPoints: reportPoints,
      //   rawResultData: result.data
      // });

      Alert.alert(
        'Report Submitted',
        `User report has been submitted successfully.\n\nReport ID: ${reportId}\nDeducted Points: ${reportPoints}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and hide report section
              setShowReportForm(false);
              setReportTitle('');
              setReportContent('');
              setDeductedPoints('0');
            }
          }
        ]
      );

    } catch (error) {
      // console.error(' Unexpected error creating user report:', error);
      Alert.alert(
        'Unexpected Error',
        'An unexpected error occurred while submitting the report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSkipReport = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'staffStack' as any }],
    });
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Booking Card */}
          <BookingCard
            carImage={booking.carImage}
            carName={booking.carName}
            carLicensePlate={booking.carLicensePlate}
            bookingId={booking.id}
            bookingNumber={booking.bookingNumber}
            customerName={booking.customerName}
            amount={booking.amount}
            statusText={returnCompleted ? "Completed" : "Return"}
            statusColor={returnCompleted ? "#d1fae5" : "#fef3c7"}
          />

          {/* GPS Button */}
          <View style={styles.gpsButtonContainer}>
            <Pressable
              style={styles.gpsButton}
              onPress={() => {
                // console.log('🔍 VehicleReturn: Opening GPS card for CUSTOMER');
                // console.log('🔍 VehicleReturn: Full booking object:', booking);
                // console.log('🔍 VehicleReturn: booking.userId:', booking?.userId);
                // console.log('🔍 VehicleReturn: booking.customerName:', booking?.customerName);
                // console.log('🔍 VehicleReturn: All booking keys:', booking ? Object.keys(booking) : 'booking is null');
                setShowGPSCard(true);
              }}
            >
              <MaterialIcons name="location-on" size={20} color="white" />
              <Text style={styles.gpsButtonText}>View Customer GPS</Text>
              <MaterialIcons name="chevron-right" size={20} color="white" />
            </Pressable>
          </View>

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
            editable={!isAlreadyCheckedOut && !returnCompleted}
          />

          {/* Return Photos Section */}
          <ImageGallerySection
            title={
              isAlreadyCheckedOut || returnCompleted
                ? 'Return Photos (Submitted)'
                : `Return Photos (${selectedImages.length}/10)`
            }
            images={
              isAlreadyCheckedOut && existingCheckOutData
                ? existingCheckOutData.images
                : selectedImages
            }
            iconName="photo-camera"
            iconColor={colors.primary}
            onAddPhoto={!isAlreadyCheckedOut && !returnCompleted ? showImagePickerOptions : undefined}
            onRemoveImage={!isAlreadyCheckedOut && !returnCompleted ? removeImage : undefined}
            isReadOnly={isAlreadyCheckedOut || returnCompleted}
          />

          {/* Booking Extension Section */}
          <BookingExtensionSection
            bookingId={bookingId}
            allowPayment={!returnCompleted}
            onPaymentStatusChange={(isCompleted) => {
              setExtensionInfo(prev => ({
                ...prev,
                isPaymentCompleted: isCompleted
              }));
            }}
          />

          {/* Additional Payment Section */}
          {!isAlreadyCheckedOut && !returnCompleted && (
            <AdditionalPaymentSection bookingId={bookingId} />
          )}

          {/* Action Button - Only show if return not completed */}
          {!returnCompleted && (
            <ActionButton
              onPress={handleConfirmReturn}
              disabled={
                selectedImages.length === 0 ||
                (extensionInfo.hasExtension && !extensionInfo.isPaymentCompleted)
              }
              loading={submitting}
              text={
                extensionInfo.hasExtension && !extensionInfo.isPaymentCompleted
                  ? "Extension Payment Required"
                  : "Confirm Return"
              }
              isCompleted={isAlreadyCheckedOut}
            />
          )}

          {/* Report User Section - Show after return is completed OR if already checked out */}
          {(returnCompleted || isAlreadyCheckedOut) && (
            <View style={styles.reportSection}>
              <View style={styles.reportHeader}>
                <MaterialIcons name="report-problem" size={scale(24)} color={colors.destructive} />
                <Text style={styles.reportTitle}>Report User Issues</Text>
                <Text style={styles.reportSubtitle}>
                  Report any violations or issues with this user
                </Text>
              </View>

              {!showReportForm ? (
                <View style={styles.reportActions}>
                  <Pressable
                    style={styles.reportActionButton}
                    onPress={() => setShowReportForm(true)}>
                    <MaterialIcons name="report-problem" size={scale(18)} color="white" />
                    <Text style={styles.reportActionButtonText}>Report User</Text>
                  </Pressable>

                  <Pressable
                    style={styles.skipActionButton}
                    onPress={handleSkipReport}>
                    <Text style={styles.skipActionButtonText}>Skip & Return to Dashboard</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.reportForm}>
                  {/* Booking Info */}
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingInfoTitle}>Booking Information</Text>
                    <Text style={styles.bookingInfoText}>User: {booking?.customerName || 'Unknown User'}</Text>
                    <Text style={styles.bookingInfoText}>Car: {booking?.carName || 'Unknown Car'}</Text>
                    <Text style={styles.bookingInfoText}>Booking: {booking?.bookingNumber || (booking?.id ? booking.id.substring(0, 8) + "..." : bookingId)}</Text>
                  </View>

                  {/* Title Selection */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Report Title *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={reportTitle}
                      onChangeText={setReportTitle}
                      placeholder="Enter report title"
                      placeholderTextColor={colors.placeholder}
                      maxLength={100}
                    />

                    <Text style={styles.suggestionsLabel}>Quick Select:</Text>
                    <View style={styles.tagsContainer}>
                      {predefinedTitles.map((title) => (
                        <Pressable
                          key={title}
                          style={[
                            styles.tag,
                            reportTitle === title && styles.tagSelected
                          ]}
                          onPress={() => setReportTitle(title)}>
                          <Text style={[
                            styles.tagText,
                            reportTitle === title && styles.tagTextSelected
                          ]}>
                            {title}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Offense Levels */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Offense Level</Text>
                    <View style={styles.offenseLevelsContainer}>
                      {offenseLevels.map((offense) => (
                        <Pressable
                          key={offense.level}
                          style={[
                            styles.offenseLevel,
                            reportContent === offense.content && styles.offenseLevelSelected
                          ]}
                          onPress={() => handleOffenseLevelSelect(offense)}>
                          <View style={styles.offenseLevelHeader}>
                            <Text style={[
                              styles.offenseLevelTitle,
                              reportContent === offense.content && styles.offenseLevelTitleSelected
                            ]}>
                              {offense.level}
                            </Text>
                            <View style={[styles.pointsBadge, { backgroundColor: offense.color }]}>
                              <Text style={styles.pointsText}>{offense.points}</Text>
                            </View>
                          </View>
                          <Text style={[
                            styles.offenseLevelDescription,
                            reportContent === offense.content && styles.offenseLevelDescriptionSelected
                          ]}>
                            {offense.content}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Content */}
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Report Details *</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={reportContent}
                      onChangeText={setReportContent}
                      placeholder="Describe the violation or issue in detail..."
                      placeholderTextColor={colors.placeholder}
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                    <Text style={styles.characterCount}>
                      {reportContent.length}/500 characters
                    </Text>
                  </View>

                  {/* Form Actions */}
                  <View style={styles.formActions}>
                    <Pressable
                      style={styles.cancelFormButton}
                      onPress={() => {
                        setShowReportForm(false);
                        setReportTitle('');
                        setReportContent('');
                        setDeductedPoints('0');
                      }}>
                      <Text style={styles.cancelFormButtonText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.submitFormButton,
                        reportSubmitting && styles.submitFormButtonDisabled
                      ]}
                      onPress={handleSubmitReport}
                      disabled={reportSubmitting}>
                      {reportSubmitting ? (
                        <ActivityIndicator color={colors.white} size="small" />
                      ) : (
                        <>
                          <MaterialIcons name="send" size={scale(16)} color={colors.white} />
                          <Text style={styles.submitFormButtonText}>Submit Report</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* GPS Location Card Modal */}
        <GPSLocationCard
          userId={booking.userId}
          visible={showGPSCard}
          onClose={() => {
            // console.log('🔍 VehicleReturn: Closing GPS card');
            // console.log('🔍 VehicleReturn: Customer userId (correct):', booking.userId);
            // console.log('🔍 VehicleReturn: Staff userId (wrong for GPS):', user?.id);
            setShowGPSCard(false);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

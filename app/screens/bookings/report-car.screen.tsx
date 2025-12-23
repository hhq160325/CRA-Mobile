import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Pressable,
    StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';
import { reportService } from '../../../lib/api';

type ReportCarRouteProp = RouteProp<NavigatorParamList, 'ReportCar'>;
type ReportCarNavigationProp = StackNavigationProp<NavigatorParamList, 'ReportCar'>;

const REPORT_CATEGORIES = [
    { id: 'damage', title: 'Vehicle Damage', icon: 'build' },
    { id: 'cleanliness', title: 'Cleanliness Issues', icon: 'cleaning-services' },
    { id: 'mechanical', title: 'Mechanical Problems', icon: 'settings' },
    { id: 'smell', title: 'Bad Odor', icon: 'air' },
    { id: 'missing', title: 'Missing Items', icon: 'inventory' },
    { id: 'other', title: 'Other Issues', icon: 'report-problem' },
];

export default function ReportCarScreen() {
    const route = useRoute<ReportCarRouteProp>();
    const navigation = useNavigation<ReportCarNavigationProp>();
    const { user } = useAuth();

    const { carId, carName, bookingId, bookingNumber, licensePlate } = route.params || {};

    console.log(' ReportCarScreen: Screen loaded with params:', {
        carId,
        carName,
        bookingId,
        bookingNumber,
        licensePlate,
        hasUser: !!user,
    });

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize title with same format as Messages screen
    React.useEffect(() => {
        if (carName && bookingNumber && licensePlate) {
            const formattedTitle = `- Report about ${carName}\n- Booking: ${bookingNumber}\n- License: ${licensePlate}`;
            setTitle(formattedTitle);
        }
    }, [carName, bookingNumber, licensePlate]);

    const handleCategorySelect = (categoryId: string, categoryTitle: string) => {
        setSelectedCategory(categoryId);

        // Create the base subject info (same as Messages screen)
        const baseTitle = carName && bookingNumber && licensePlate
            ? `- Report about ${carName}\n- Booking: ${bookingNumber}\n- License: ${licensePlate}`
            : '';

        // Append category to the base title
        const fullTitle = baseTitle
            ? `${baseTitle}\n- Issue: ${categoryTitle}`
            : categoryTitle;

        setTitle(fullTitle);
    };

    const validateForm = (): boolean => {
        if (!selectedCategory) {
            Alert.alert('Validation Error', 'Please select a report category');
            return false;
        }

        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter a report title');
            return false;
        }

        if (title.trim().length < 5) {
            Alert.alert('Validation Error', 'Title must be at least 5 characters');
            return false;
        }

        if (!content.trim()) {
            Alert.alert('Validation Error', 'Please describe the issue');
            return false;
        }

        if (content.trim().length < 10) {
            Alert.alert('Validation Error', 'Description must be at least 10 characters');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated. Please sign in again.');
            return;
        }

        if (!carId) {
            Alert.alert('Error', 'Car information is missing.');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('=== Submitting Car Report ===');
            console.log('Report data:', {
                title: title.trim(),
                carId,
                userId: user.id,
                contentLength: content.trim().length,
            });

            const result = await reportService.createReport({
                title: title.trim(),
                content: content.trim(),
                carId,
                userId: user.id,
            });

            if (result.error) {
                console.error('Report submission error:', result.error);
                Alert.alert(
                    'Submission Failed',
                    result.error.message || 'Failed to submit report. Please try again.',
                );
            } else if (result.data) {
                console.log(' Report submitted successfully:', {
                    reportNo: result.data.reportNo,
                    reportId: result.data.id,
                    status: result.data.status,
                });

                Alert.alert(
                    'Report Submitted',
                    `Your report (${result.data.reportNo}) has been submitted successfully. We will review it and take appropriate action.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ],
                );
            }
        } catch (error: any) {
            console.error('Report submission exception:', error);
            Alert.alert('Error', error?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <MaterialIcons name="report-problem" size={48} color="#ef4444" />
                    <Text style={styles.headerTitle}>Report Car Issue</Text>
                    <Text style={styles.headerSubtitle}>
                        {carName || 'Vehicle Report'}
                    </Text>
                    {bookingNumber && (
                        <Text style={styles.bookingInfo}>Booking: {bookingNumber}</Text>
                    )}
                    {licensePlate && (
                        <Text style={styles.licensePlateInfo}>License: {licensePlate}</Text>
                    )}
                </View>

                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Issue Category *</Text>
                    <View style={styles.categoryGrid}>
                        {REPORT_CATEGORIES.map((category) => (
                            <Pressable
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    selectedCategory === category.id && styles.categoryCardSelected,
                                ]}
                                onPress={() => handleCategorySelect(category.id, category.title)}>
                                <MaterialIcons
                                    name={category.icon as any}
                                    size={28}
                                    color={
                                        selectedCategory === category.id
                                            ? '#ef4444'
                                            : '#6b7280'
                                    }
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.categoryTextSelected,
                                    ]}>
                                    {category.title}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Title Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Report Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Brief description of the issue"
                        placeholderTextColor={colors.placeholder}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                    <Text style={styles.charCount}>{title.length}/100</Text>
                </View>

                {/* Content Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detailed Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Please provide detailed information about the issue..."
                        placeholderTextColor={colors.placeholder}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{content.length}/500</Text>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <MaterialIcons name="info" size={20} color="#ef4444" />
                    <Text style={styles.infoText}>
                        Your report will be reviewed by our team. We may contact you for additional
                        information if needed.
                    </Text>
                </View>

                {/* Submit Button */}
                <Pressable
                    style={[
                        styles.submitButton,
                        (isSubmitting || !selectedCategory || !title.trim() || !content.trim()) &&
                        styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={
                        isSubmitting || !selectedCategory || !title.trim() || !content.trim()
                    }>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <MaterialIcons name="send" size={20} color={colors.white} />
                            <Text style={styles.submitButtonText}>Submit Report</Text>
                        </>
                    )}
                </Pressable>

                {/* Cancel Button */}
                <Pressable
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    disabled={isSubmitting}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: scale(16),
        paddingBottom: verticalScale(32),
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: verticalScale(24),
        paddingVertical: verticalScale(16),
    },
    headerTitle: {
        fontSize: scale(22),
        fontWeight: '700',
        color: '#1f2937',
        marginTop: verticalScale(12),
    },
    headerSubtitle: {
        fontSize: scale(16),
        color: '#6b7280',
        marginTop: verticalScale(4),
    },
    bookingInfo: {
        fontSize: scale(12),
        color: '#ef4444',
        marginTop: verticalScale(4),
        fontWeight: '600',
    },
    licensePlateInfo: {
        fontSize: scale(12),
        color: '#ef4444',
        marginTop: verticalScale(2),
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    section: {
        marginBottom: verticalScale(20),
    },
    sectionTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: verticalScale(8),
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(12),
    },
    categoryCard: {
        width: '47%',
        backgroundColor: colors.white,
        borderRadius: scale(12),
        padding: scale(16),
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    categoryCardSelected: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    categoryText: {
        fontSize: scale(12),
        color: '#6b7280',
        marginTop: verticalScale(8),
        textAlign: 'center',
    },
    categoryTextSelected: {
        color: '#ef4444',
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.white,
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: scale(14),
        color: '#1f2937',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    textArea: {
        minHeight: verticalScale(120),
        paddingTop: scale(12),
    },
    charCount: {
        fontSize: scale(11),
        color: '#9ca3af',
        textAlign: 'right',
        marginTop: verticalScale(4),
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fef2f2',
        borderRadius: scale(8),
        padding: scale(12),
        marginBottom: verticalScale(20),
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
    },
    infoText: {
        flex: 1,
        fontSize: scale(12),
        color: '#dc2626',
        marginLeft: scale(8),
        lineHeight: scale(16),
    },
    submitButton: {
        backgroundColor: '#ef4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        gap: scale(8),
        marginBottom: verticalScale(12),
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: scale(16),
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(14),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: scale(16),
        fontWeight: '600',
    },
});
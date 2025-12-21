'use client';

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import { useAuth } from '../../../lib/auth-context';
import { reportService } from '../../../lib/api/services/report.service';
import { userReportStyles as styles } from './styles';

interface UserReportRouteParams {
    bookingId: string;
    userId: string;
    userName: string;
    carName: string;
    bookingNumber: string;
}

export default function UserReportScreen() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const route = useRoute();
    const { user } = useAuth();
    const params = route.params as UserReportRouteParams;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [deductedPoints, setDeductedPoints] = useState('0');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter a report title.');
            return;
        }

        if (!content.trim()) {
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

        setSubmitting(true);

        try {
            // console.log('🚨 Creating user report:', {
            //     title: title.trim(),
            //     reporterId: user.id,
            //     reportedUserId: params.userId,
            //     deductedPoints: points,
            //     bookingId: params.bookingId
            // });

            const result = await reportService.createUserReport({
                title: title.trim(),
                content: content.trim(),
                deductedPoints: points,
                reporterId: user.id,
                reportedUserId: params.userId,
            });

            if (result.error) {
                // console.error('❌ User report creation failed:', result.error);
                // Alert.alert(
                //     'Report Failed',
                //     `Failed to submit user report: ${result.error.message}`,
                //     [{ text: 'OK' }]
                // );
                return;
            }

            // console.log(' User report created successfully:', result.data);

            Alert.alert(
                'Report Submitted',
                `User report has been submitted successfully.\n\nReport ID: ${result.data?.reportNo || 'N/A'}\nDeducted Points: ${points}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back to staff dashboard or previous screen
                            navigation.goBack();
                        }
                    }
                ]
            );

        } catch (error) {
            // console.error('Unexpected error creating user report:', error);
            Alert.alert(
                'Unexpected Error',
                'An unexpected error occurred while submitting the report. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setSubmitting(false);
        }
    };

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
        setContent(offense.content);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <View style={styles.container}>
                <Header />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">

                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <MaterialIcons name="report-problem" size={scale(32)} color={colors.destructive} />
                        <Text style={styles.headerTitle}>Report User</Text>
                        <Text style={styles.headerSubtitle}>
                            Submit a report for user violations or issues
                        </Text>
                    </View>

                    {/* Booking Info */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>Booking Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Booking ID:</Text>
                            <Text style={styles.infoValue}>{params.bookingNumber}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>User:</Text>
                            <Text style={styles.infoValue}>{params.userName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Car:</Text>
                            <Text style={styles.infoValue}>{params.carName}</Text>
                        </View>
                    </View>

                    {/* Report Form */}
                    <View style={styles.formSection}>
                        {/* Title Selection */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Report Title *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter report title"
                                placeholderTextColor={colors.placeholder}
                                maxLength={100}
                            />

                            {/* Predefined Titles */}
                            <Text style={styles.suggestionsLabel}>Quick Select:</Text>
                            <View style={styles.tagsContainer}>
                                {predefinedTitles.map((predefinedTitle) => (
                                    <Pressable
                                        key={predefinedTitle}
                                        style={[
                                            styles.tag,
                                            title === predefinedTitle && styles.tagSelected
                                        ]}
                                        onPress={() => setTitle(predefinedTitle)}>
                                        <Text style={[
                                            styles.tagText,
                                            title === predefinedTitle && styles.tagTextSelected
                                        ]}>
                                            {predefinedTitle}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Content */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Report Details *</Text>

                            {/* Offense Level Quick Select */}
                            <Text style={styles.suggestionsLabel}>Offense Level:</Text>
                            <View style={styles.offenseLevelsContainer}>
                                {offenseLevels.map((offense) => (
                                    <Pressable
                                        key={offense.level}
                                        style={[
                                            styles.offenseLevel,
                                            content === offense.content && styles.offenseLevelSelected
                                        ]}
                                        onPress={() => handleOffenseLevelSelect(offense)}>
                                        <View style={styles.offenseLevelHeader}>
                                            <Text style={[
                                                styles.offenseLevelTitle,
                                                content === offense.content && styles.offenseLevelTitleSelected
                                            ]}>
                                                {offense.level}
                                            </Text>
                                            <View style={[styles.pointsBadge, { backgroundColor: offense.color }]}>
                                                <Text style={styles.pointsText}>{offense.points}</Text>
                                            </View>
                                        </View>
                                        <Text style={[
                                            styles.offenseLevelDescription,
                                            content === offense.content && styles.offenseLevelDescriptionSelected
                                        ]}>
                                            {offense.content}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={content}
                                onChangeText={setContent}
                                placeholder="Describe the violation or issue in detail..."
                                placeholderTextColor={colors.placeholder}
                                multiline={true}
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.characterCount}>
                                {content.length}/500 characters
                            </Text>
                        </View>

                        {/* Deducted Points */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Deducted Points</Text>

                            {/* Points Quick Select */}
                            <Text style={styles.suggestionsLabel}>Quick Select:</Text>
                            <View style={styles.pointsContainer}>
                                {[10, 20, 55].map((points) => (
                                    <Pressable
                                        key={points}
                                        style={[
                                            styles.pointsOption,
                                            deductedPoints === points.toString() && styles.pointsOptionSelected
                                        ]}
                                        onPress={() => setDeductedPoints(points.toString())}>
                                        <Text style={[
                                            styles.pointsOptionText,
                                            deductedPoints === points.toString() && styles.pointsOptionTextSelected
                                        ]}>
                                            {points}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <TextInput
                                style={styles.textInput}
                                value={deductedPoints}
                                onChangeText={setDeductedPoints}
                                placeholder="0"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <Text style={styles.fieldHint}>
                                Enter the number of points to deduct from user's account (0-100)
                            </Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.cancelButton]}
                            onPress={() => navigation.goBack()}
                            disabled={submitting}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.submitButton,
                                submitting && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={submitting}>
                            {submitting ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <>
                                    <MaterialIcons name="send" size={scale(18)} color={colors.white} />
                                    <Text style={styles.submitButtonText}>Submit Report</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
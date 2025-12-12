import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useAuth } from '../../../lib/auth-context';
import { inquiryService, bookingsService } from '../../../lib/api';
import { apiClient } from '../../../lib/api/client';
import { API_ENDPOINTS, API_CONFIG } from '../../../lib/api/config';
import { styles } from './messages.styles';

export default function MessagesScreen() {
    const route = useRoute<RouteProp<{ params: { bookingId: string; bookingNumber?: string } }, 'params'>>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { bookingId, bookingNumber } = (route.params as any) || {};

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingOwner, setFetchingOwner] = useState(true);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [ownerUsername, setOwnerUsername] = useState<string>('');
    const [carName, setCarName] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchCarOwner();
    }, [bookingId]);

    useEffect(() => {
        if (user?.id) {
            fetchChatHistory();
        }
    }, [user?.id]);

    const fetchChatHistory = async () => {
        if (!user?.id) return;

        setLoadingHistory(true);
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/Inquiry/${user.id}`,
                {
                    method: 'GET',
                    headers: {
                        accept: '*/*',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                const sorted = data.sort(
                    (a: any, b: any) =>
                        new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                );

                // Merge with existing optimistic messages to avoid losing them during refresh
                setChatHistory(prevHistory => {
                    // Get any existing optimistic messages
                    const optimisticMessages = prevHistory.filter(msg => msg.id.startsWith('temp-'));

                    // Remove optimistic messages that have been confirmed by server
                    const filteredOptimisticMessages = optimisticMessages.filter(optimistic => {
                        const hasRealVersion = sorted.some(real =>
                            real.title === optimistic.title &&
                            real.content === optimistic.content &&
                            real.senderId === optimistic.senderId &&
                            Math.abs(new Date(real.createDate).getTime() - new Date(optimistic.createDate).getTime()) < 30000 // Within 30 seconds
                        );
                        if (hasRealVersion) {
                            console.log('Removing optimistic message, found real version:', optimistic.title);
                        }
                        return !hasRealVersion;
                    });

                    // Combine real messages with remaining optimistic ones
                    const allMessages = [...filteredOptimisticMessages, ...sorted];

                    // Sort again to maintain chronological order (newest first)
                    return allMessages.sort(
                        (a: any, b: any) =>
                            new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                    );
                });
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const validateBookingId = () => {
        if (!bookingId && !bookingNumber) {
            Alert.alert('Error', 'Booking information is required');
            navigation.goBack();
            return false;
        }
        return true;
    };

    const extractCarOwnerInfo = (carData: any) => {
        const owner = carData.owner;
        if (!owner || !owner.id) {
            throw new Error('Car owner information not available');
        }

        return {
            ownerId: owner.id,
            ownerUsername: owner.username || 'Car Owner',
            carName: `${carData.manufacturer} ${carData.model}`,
        };
    };

    const fetchCarOwner = async () => {
        if (!validateBookingId()) return;

        setFetchingOwner(true);
        try {
            let bookingData = null;
            let carData = null;

            // Try to use bookingNumber first for complete data
            if (bookingNumber) {
                console.log('Fetching booking details using bookingNumber:', bookingNumber);
                const bookingRes = await bookingsService.getBookingByNumber(bookingNumber);

                if (bookingRes.data && bookingRes.data.car) {
                    bookingData = bookingRes.data;
                    const carId = bookingRes.data.car.id;

                    // Fetch complete car details including owner information
                    console.log('Fetching complete car details for carId:', carId);
                    const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                        method: 'GET',
                    });

                    if (carRes.data) {
                        carData = carRes.data;
                        console.log('Successfully fetched complete car data with owner info');
                    } else {
                        console.log('Failed to fetch complete car details, using basic car info');
                        carData = bookingRes.data.car;
                    }
                }
            }

            // Fallback to original method if bookingNumber approach failed
            if (!carData) {
                console.log('Falling back to bookingId approach');
                const bookingRes = await bookingsService.getBookingById(bookingId);
                if (bookingRes.error || !bookingRes.data) {
                    Alert.alert('Error', 'Failed to load booking details');
                    navigation.goBack();
                    return;
                }

                const carId = bookingRes.data.carId;
                if (!carId) {
                    Alert.alert('Error', 'Car information not found');
                    navigation.goBack();
                    return;
                }

                const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                    method: 'GET',
                });

                if (carRes.error || !carRes.data) {
                    Alert.alert('Error', 'Failed to load car details');
                    navigation.goBack();
                    return;
                }

                carData = carRes.data;
            }

            // Validate that we have car data
            if (!carData) {
                Alert.alert('Error', 'Car information not found');
                navigation.goBack();
                return;
            }

            // Extract owner information from car data
            try {
                const { ownerId: fetchedOwnerId, ownerUsername: fetchedOwnerUsername, carName: fetchedCarName } = extractCarOwnerInfo(carData);

                setOwnerId(fetchedOwnerId);
                setOwnerUsername(fetchedOwnerUsername);
                setCarName(fetchedCarName);
                setTitle(`Inquiry about ${fetchedCarName}`);
            } catch (ownerError) {
                console.error('Error extracting owner info:', ownerError);
                Alert.alert('Error', 'Failed to load car owner information');
                navigation.goBack();
                return;
            }
        } catch (error) {
            console.error('Error fetching car owner:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load car owner information';
            Alert.alert('Error', errorMessage);
            navigation.goBack();
        } finally {
            setFetchingOwner(false);
        }
    };

    const validateMessageForm = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a message title');
            return false;
        }

        if (!content.trim()) {
            Alert.alert('Required', 'Please enter your message');
            return false;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return false;
        }

        if (!ownerId) {
            Alert.alert('Error', 'Car owner information not available');
            return false;
        }

        return true;
    };

    const handleSendMessage = async () => {
        if (!validateMessageForm()) return;

        setLoading(true);
        try {
            const result = await inquiryService.createInquiry({
                title: title.trim(),
                content: content.trim(),
                senderId: user!.id,
                receiverId: ownerId!,
            });

            if (result.error) {
                Alert.alert('Error', 'Failed to send message. Please try again.');
                // Remove the optimistic message on error
                setChatHistory(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
                return;
            }

            // Add optimistic message to chat history immediately
            const optimisticMessage = {
                id: `temp-${Date.now()}`,
                title: title.trim(),
                content: content.trim(),
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
                status: 'Open',
                type: 'Question',
                senderId: user!.id,
                receiverId: ownerId!,
            };

            // Add to chat history immediately for better UX
            setChatHistory(prev => [optimisticMessage, ...prev]);

            // Clear the message content immediately
            setContent('');

            // Show success message
            Alert.alert('Success', 'Your message has been sent to the car owner!');

            // Refresh chat history multiple times to ensure new message appears
            setTimeout(async () => {
                console.log('First refresh after sending message...');
                await fetchChatHistory();
            }, 1000);

            setTimeout(async () => {
                console.log('Second refresh after sending message...');
                await fetchChatHistory();
            }, 3000);

            setTimeout(async () => {
                console.log('Third refresh after sending message...');
                await fetchChatHistory();
            }, 5000);

        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'An unexpected error occurred');
            // Remove the optimistic message on error
            setChatHistory(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderMessageItem = (msg: any, index: number) => {
        const isSentByMe = msg.senderId === user?.id;

        return (
            <View
                key={msg.id}
                style={[
                    styles.messageItem,
                    isSentByMe ? styles.messageItemSent : styles.messageItemReceived,
                    index < chatHistory.length - 1 && styles.messageItemSpacing,
                ]}>
                <View style={styles.messageHeader}>
                    <Text
                        style={[
                            styles.messageSender,
                            isSentByMe ? styles.messageSenderSent : styles.messageSenderReceived,
                        ]}>
                        {isSentByMe ? 'You' : ownerUsername}
                    </Text>
                    <Text style={styles.messageDate}>
                        {formatMessageDate(msg.createDate)}
                    </Text>
                </View>
                {msg.title && (
                    <Text style={styles.messageTitle}>{msg.title}</Text>
                )}
                <Text style={styles.messageContent}>{msg.content}</Text>
                <View style={styles.messageFooter}>
                    <View
                        style={[
                            styles.statusBadge,
                            msg.status === 'Open' ? styles.statusBadgeOpen : styles.statusBadgeClosed,
                        ]}>
                        <Text
                            style={[
                                styles.statusText,
                                msg.status === 'Open' ? styles.statusTextOpen : styles.statusTextClosed,
                            ]}>
                            {msg.status}
                        </Text>
                    </View>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{msg.type}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderChatHistory = () => {
        if (chatHistory.length === 0) return null;

        return (
            <View style={styles.chatHistoryCard}>
                <View style={styles.chatHistoryHeader}>
                    <MaterialIcons name="history" size={20} color={colors.morentBlue} />
                    <Text style={styles.chatHistoryTitle}>Chat History</Text>
                </View>
                {chatHistory.map(renderMessageItem)}
            </View>
        );
    };

    const renderLoadingState = () => (
        <View style={styles.container}>
            <Header />
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.morentBlue} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </View>
    );

    if (fetchingOwner) {
        return renderLoadingState();
    }

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <Header />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled">
                    {renderChatHistory()}

                    <View style={styles.headerCard}>
                        <MaterialIcons name="message" size={32} color={colors.morentBlue} />
                        <View style={styles.headerContent}>
                            <Text style={styles.headerTitle}>Send Message</Text>
                            <Text style={styles.headerSubtitle}>
                                To: {ownerUsername} • {carName}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Subject</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter message subject"
                            placeholderTextColor={colors.placeholder}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Message</Text>
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            placeholder="Type your message here..."
                            placeholderTextColor={colors.placeholder}
                            multiline
                            numberOfLines={8}
                            style={[styles.input, styles.textArea]}
                        />
                    </View>

                    <View style={styles.infoBox}>
                        <MaterialIcons
                            name="info"
                            size={20}
                            color={colors.morentBlue}
                            style={styles.infoIcon}
                        />
                        <Text style={styles.infoText}>
                            Your message will be sent to the car owner. They will be able to
                            respond to your inquiry.
                        </Text>
                    </View>

                    <Pressable
                        onPress={handleSendMessage}
                        disabled={loading}
                        style={[
                            styles.sendButton,
                            loading ? styles.sendButtonDisabled : styles.sendButtonActive,
                        ]}>
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="send"
                                    size={20}
                                    color={colors.white}
                                    style={styles.sendButtonIcon}
                                />
                                <Text style={styles.sendButtonText}>Send Message</Text>
                            </>
                        )}
                    </Pressable>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

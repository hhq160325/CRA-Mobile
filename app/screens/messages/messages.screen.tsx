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

export default function MessagesScreen() {
    const route = useRoute<RouteProp<{ params: { bookingId: string } }, 'params'>>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { bookingId } = (route.params as any) || {};

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
                // Sort by date, newest first
                const sorted = data.sort(
                    (a: any, b: any) =>
                        new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                );
                setChatHistory(sorted);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchCarOwner = async () => {
        if (!bookingId) {
            Alert.alert('Error', 'Booking ID is missing');
            navigation.goBack();
            return;
        }

        setFetchingOwner(true);
        try {
            // Step 1: Get booking details to extract carId
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

            // Step 2: Get car details by ID directly from API (includes owner object)
            const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                method: 'GET',
            });

            if (carRes.error || !carRes.data) {
                Alert.alert('Error', 'Failed to load car details');
                navigation.goBack();
                return;
            }

            // Step 3: Extract owner information from raw API response
            const carData = carRes.data;
            const owner = carData.owner;

            if (!owner || !owner.id) {
                Alert.alert('Error', 'Car owner information not available');
                navigation.goBack();
                return;
            }

            const carName = `${carData.manufacturer} ${carData.model}`;

            setOwnerId(owner.id);
            setOwnerUsername(owner.username || 'Car Owner');
            setCarName(carName);
            setTitle(`Inquiry about ${carName}`);
        } catch (error) {
            console.error('Error fetching car owner:', error);
            Alert.alert('Error', 'Failed to load car owner information');
            navigation.goBack();
        } finally {
            setFetchingOwner(false);
        }
    };

    const handleSendMessage = async () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a message title');
            return;
        }

        if (!content.trim()) {
            Alert.alert('Required', 'Please enter your message');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        if (!ownerId) {
            Alert.alert('Error', 'Car owner information not available');
            return;
        }

        setLoading(true);
        try {
            const result = await inquiryService.createInquiry({
                title: title.trim(),
                content: content.trim(),
                senderId: user.id,
                receiverId: ownerId,
            });

            if (result.error) {
                Alert.alert('Error', 'Failed to send message. Please try again.');
                return;
            }

            // Refresh chat history
            await fetchChatHistory();

            // Clear form
            setContent('');

            Alert.alert('Success', 'Your message has been sent to the car owner!');
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingOwner) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>
                        Loading...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={{ flex: 1 }}>
                <Header />
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 16 }}
                    keyboardShouldPersistTaps="handled">
                    {/* Chat History */}
                    {chatHistory.length > 0 && (
                        <View
                            style={{
                                backgroundColor: colors.white,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 16,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                }}>
                                <MaterialIcons
                                    name="history"
                                    size={20}
                                    color={colors.morentBlue}
                                />
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: '700',
                                        color: colors.primary,
                                        marginLeft: 8,
                                    }}>
                                    Chat History
                                </Text>
                            </View>
                            {chatHistory.map((msg, index) => {
                                const isSentByMe = msg.senderId === user?.id;
                                const date = new Date(msg.createDate);
                                const formattedDate = date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <View
                                        key={msg.id}
                                        style={{
                                            marginBottom: index < chatHistory.length - 1 ? 12 : 0,
                                            padding: 12,
                                            backgroundColor: isSentByMe
                                                ? '#E3F2FD'
                                                : '#F5F5F5',
                                            borderRadius: 8,
                                            borderLeftWidth: 3,
                                            borderLeftColor: isSentByMe
                                                ? colors.morentBlue
                                                : colors.placeholder,
                                        }}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: 4,
                                            }}>
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                    color: isSentByMe
                                                        ? colors.morentBlue
                                                        : colors.primary,
                                                }}>
                                                {isSentByMe ? 'You' : ownerUsername}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 10,
                                                    color: colors.placeholder,
                                                }}>
                                                {formattedDate}
                                            </Text>
                                        </View>
                                        {msg.title && (
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: '600',
                                                    color: colors.primary,
                                                    marginBottom: 4,
                                                }}>
                                                {msg.title}
                                            </Text>
                                        )}
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: colors.primary,
                                            }}>
                                            {msg.content}
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginTop: 6,
                                            }}>
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        msg.status === 'Open'
                                                            ? '#FFF3E0'
                                                            : '#E8F5E9',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                    marginRight: 8,
                                                }}>
                                                <Text
                                                    style={{
                                                        fontSize: 10,
                                                        color:
                                                            msg.status === 'Open'
                                                                ? '#F57C00'
                                                                : '#2E7D32',
                                                        fontWeight: '600',
                                                    }}>
                                                    {msg.status}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    backgroundColor: '#F5F5F5',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                }}>
                                                <Text
                                                    style={{
                                                        fontSize: 10,
                                                        color: colors.placeholder,
                                                    }}>
                                                    {msg.type}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Header */}
                    <View
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                        <MaterialIcons
                            name="message"
                            size={32}
                            color={colors.morentBlue}
                        />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: colors.primary,
                                }}>
                                Send Message
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.placeholder }}>
                                To: {ownerUsername} • {carName}
                            </Text>
                        </View>
                    </View>

                    {/* Title Input */}
                    <View
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                        }}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: colors.primary,
                                marginBottom: 8,
                            }}>
                            Subject
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter message subject"
                            placeholderTextColor={colors.placeholder}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 8,
                                padding: 12,
                                fontSize: 14,
                                color: colors.primary,
                            }}
                        />
                    </View>

                    {/* Content Input */}
                    <View
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                        }}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: colors.primary,
                                marginBottom: 8,
                            }}>
                            Message
                        </Text>
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            placeholder="Type your message here..."
                            placeholderTextColor={colors.placeholder}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 8,
                                padding: 12,
                                fontSize: 14,
                                color: colors.primary,
                                minHeight: 150,
                            }}
                        />
                    </View>

                    {/* Info Box */}
                    <View
                        style={{
                            backgroundColor: '#E3F2FD',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 16,
                            flexDirection: 'row',
                        }}>
                        <MaterialIcons
                            name="info"
                            size={20}
                            color={colors.morentBlue}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={{ fontSize: 12, color: colors.primary, flex: 1 }}>
                            Your message will be sent to the car owner. They will be able to
                            respond to your inquiry.
                        </Text>
                    </View>

                    {/* Send Button */}
                    <Pressable
                        onPress={handleSendMessage}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? colors.placeholder : colors.morentBlue,
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            shadowColor: colors.morentBlue,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 6,
                        }}>
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="send"
                                    size={20}
                                    color={colors.white}
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    style={{
                                        color: colors.white,
                                        fontSize: 16,
                                        fontWeight: '700',
                                    }}>
                                    Send Message
                                </Text>
                            </>
                        )}
                    </Pressable>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

import React, { useState, useEffect, useRef } from 'react';
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
    Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useAuth } from '../../../lib/auth-context';
import { apiClient } from '../../../lib/api/client';
import { API_ENDPOINTS, API_CONFIG } from '../../../lib/api/config';
import { inquiryService } from '../../../lib/api';

interface Message {
    id: string;
    title: string | null;
    content: string;
    createDate: string;
    updateDate: string;
    status: string;
    type: string;
    senderId: string;
    receiverId: string;
    parentInquiryId: string | null;
    imageUrls: string[];
}

export default function ChatScreen() {
    const route = useRoute<RouteProp<{ params: { carId: string } }, 'params'>>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { carId } = (route.params as any) || {};
    const scrollViewRef = useRef<ScrollView>(null);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [ownerUsername, setOwnerUsername] = useState<string>('');
    const [carName, setCarName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchCarOwner();
    }, [carId]);

    useEffect(() => {
        if (user?.id && ownerId) {
            fetchMessages();
            // Auto-refresh every 10 seconds
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [user?.id, ownerId]);

    const fetchCarOwner = async () => {
        if (!carId) {
            Alert.alert('Error', 'Car ID is required');
            navigation.goBack();
            return;
        }

        setFetchingData(true);
        try {
            const carRes = await apiClient<any>(API_ENDPOINTS.CAR_DETAILS(carId), {
                method: 'GET',
            });

            if (carRes.error || !carRes.data) {
                Alert.alert('Error', 'Failed to load car details');
                navigation.goBack();
                return;
            }

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
        } catch (error) {
            console.error('Error fetching car owner:', error);
            Alert.alert('Error', 'Failed to load car owner information');
            navigation.goBack();
        } finally {
            setFetchingData(false);
        }
    };

    const fetchMessages = async () => {
        if (!user?.id || !ownerId) return;

        try {
            const url = `${API_CONFIG.BASE_URL}/Inquiry/chatLog?senderId=${user.id}&receiverId=${ownerId}`;
            console.log('Fetching chat messages from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    accept: '*/*',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Chat messages received:', data.length, 'messages');

                // Log first message to check structure
                if (data.length > 0) {
                    console.log('First message sample:', JSON.stringify(data[0], null, 2));
                }

                // Sort by date, oldest first for chat view
                const sorted = data.sort(
                    (a: Message, b: Message) =>
                        new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
                );
                setMessages(sorted);
                // Scroll to bottom after loading messages
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } else {
                console.error('Failed to fetch messages, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() && !selectedImage) {
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
            // If there's an image, send with FormData
            if (selectedImage) {
                const formData = new FormData();
                formData.append('Title', `Chat about ${carName}`);
                formData.append('Content', message.trim() || 'Sent an image');
                formData.append('SenderId', user.id);
                formData.append('ReceiverId', ownerId);

                // Add image file
                const filename = selectedImage.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('Medias', {
                    uri: selectedImage,
                    name: filename,
                    type,
                } as any);

                // Get auth token
                let token: string | null = null;
                try {
                    if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                        token = localStorage.getItem('token');
                    }
                } catch (e) {
                    console.error('Failed to get token:', e);
                }

                const headers: Record<string, string> = {
                    accept: '*/*',
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(
                    `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CREATE_INQUIRY}`,
                    {
                        method: 'POST',
                        headers,
                        body: formData,
                    },
                );

                if (!response.ok) {
                    Alert.alert('Error', 'Failed to send message with image.');
                    return;
                }
            } else {
                // Send text-only message
                const result = await inquiryService.createInquiry({
                    title: `Chat about ${carName}`,
                    content: message.trim(),
                    senderId: user.id,
                    receiverId: ownerId,
                });

                if (result.error) {
                    Alert.alert('Error', 'Failed to send message. Please try again.');
                    return;
                }
            }

            // Clear input and image
            setMessage('');
            setSelectedImage(null);

            // Wait a moment for the API to process, then refresh messages
            setTimeout(async () => {
                await fetchMessages();
            }, 500);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <View style={{ flex: 1 }}>
                <Header />

                {/* Chat Header */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#9C27B0',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                        }}>
                        <Text style={{ fontSize: 20, color: colors.white }}>
                            {ownerUsername.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: colors.primary,
                            }}>
                            {ownerUsername}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.placeholder }}>
                            {carName}
                        </Text>
                    </View>
                </View>

                {/* Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1, backgroundColor: '#F5F5F5' }}
                    contentContainerStyle={{ padding: 16 }}
                    onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd({ animated: true })
                    }>
                    {messages.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 40,
                            }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: colors.placeholder,
                                    textAlign: 'center',
                                }}>
                                No messages yet
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: colors.placeholder,
                                    textAlign: 'center',
                                    marginTop: 8,
                                }}>
                                Start a conversation with {ownerUsername}
                            </Text>
                        </View>
                    ) : (
                        messages.map((msg, index) => {
                            const isSentByMe = msg.senderId === user?.id;
                            const date = new Date(msg.createDate);
                            const formattedTime = date.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <View
                                    key={msg.id}
                                    style={{
                                        marginBottom: 12,
                                        alignItems: isSentByMe ? 'flex-end' : 'flex-start',
                                    }}>
                                    <View
                                        style={{
                                            maxWidth: '75%',
                                            backgroundColor: isSentByMe
                                                ? '#9C27B0'
                                                : colors.white,
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 20,
                                            borderBottomRightRadius: isSentByMe ? 4 : 20,
                                            borderBottomLeftRadius: isSentByMe ? 20 : 4,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 2,
                                        }}>
                                        {msg.imageUrls && msg.imageUrls.length > 0 ? (
                                            <View style={{ marginBottom: 8 }}>
                                                {msg.imageUrls.map((imgUrl, idx) => {
                                                    console.log('Rendering image:', imgUrl);
                                                    return (
                                                        <Image
                                                            key={idx}
                                                            source={{ uri: imgUrl }}
                                                            style={{
                                                                width: 200,
                                                                height: 150,
                                                                borderRadius: 12,
                                                                marginBottom: 4,
                                                            }}
                                                            resizeMode="cover"
                                                            onError={(e) =>
                                                                console.error(
                                                                    'Image load error:',
                                                                    e.nativeEvent.error,
                                                                )
                                                            }
                                                        />
                                                    );
                                                })}
                                            </View>
                                        ) : null}
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                color: isSentByMe ? colors.white : colors.primary,
                                                lineHeight: 20,
                                            }}>
                                            {msg.content}
                                        </Text>
                                    </View>
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            color: colors.placeholder,
                                            marginTop: 4,
                                            marginHorizontal: 8,
                                        }}>
                                        {formattedTime}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </ScrollView>

                {/* Message Input */}
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}>
                    {/* Image Preview */}
                    {selectedImage && (
                        <View
                            style={{
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                            }}>
                            <View style={{ position: 'relative' }}>
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                    }}
                                    resizeMode="cover"
                                />
                                <Pressable
                                    onPress={() => setSelectedImage(null)}
                                    style={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: colors.primary,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <MaterialIcons name="close" size={16} color={colors.white} />
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Input Row */}
                    <View
                        style={{
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                        <Pressable
                            onPress={pickImage}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#F5F5F5',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <MaterialIcons name="image" size={24} color="#9C27B0" />
                        </Pressable>
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.placeholder}
                            multiline
                            maxLength={500}
                            style={{
                                flex: 1,
                                backgroundColor: '#F5F5F5',
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                fontSize: 15,
                                color: colors.primary,
                                maxHeight: 100,
                            }}
                        />
                        <Pressable
                            onPress={handleSendMessage}
                            disabled={loading || (!message.trim() && !selectedImage)}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor:
                                    loading || (!message.trim() && !selectedImage)
                                        ? colors.placeholder
                                        : '#9C27B0',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <MaterialIcons name="send" size={20} color={colors.white} />
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

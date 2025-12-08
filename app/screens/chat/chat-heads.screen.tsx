import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useAuth } from '../../../lib/auth-context';
import { API_CONFIG } from '../../../lib/api/config';
import type { NavigatorParamList } from '../../navigators/navigation-route';

interface ChatHead {
    userId: string;
    username: string;
    carName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    carId: string;
}

export default function ChatHeadsScreen() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { user } = useAuth();
    const [chatHeads, setChatHeads] = useState<ChatHead[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchChatHeads();
        }
    }, [user?.id]);

    const fetchChatHeads = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/Inquiry/${user.id}`, {
                method: 'GET',
                headers: {
                    accept: '*/*',
                },
            });

            if (response.ok) {
                const data = await response.json();

                // Group messages by conversation partner
                const conversationsMap = new Map<string, any[]>();

                data.forEach((msg: any) => {
                    const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
                    if (!conversationsMap.has(partnerId)) {
                        conversationsMap.set(partnerId, []);
                    }
                    conversationsMap.get(partnerId)!.push(msg);
                });

                // Create chat heads from conversations
                const heads: ChatHead[] = [];
                conversationsMap.forEach((messages, partnerId) => {
                    // Sort messages by date, newest first
                    const sortedMessages = messages.sort(
                        (a, b) =>
                            new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                    );

                    const lastMsg = sortedMessages[0];

                    // Extract username and car name from title or use defaults
                    let username = 'User';
                    let carName = '';

                    if (lastMsg.title) {
                        const titleMatch = lastMsg.title.match(/Chat about (.+)/);
                        if (titleMatch) {
                            carName = titleMatch[1];
                        }
                    }

                    // Count unread (for now, just count messages from partner)
                    const unreadCount = sortedMessages.filter(
                        (m: any) => m.senderId === partnerId && m.status === 'Open',
                    ).length;

                    heads.push({
                        userId: partnerId,
                        username: username,
                        carName: carName || 'Car Inquiry',
                        lastMessage: lastMsg.content,
                        lastMessageTime: lastMsg.createDate,
                        unreadCount: unreadCount,
                        carId: '', // We'll need to fetch this from the conversation
                    });
                });

                // Sort by last message time
                heads.sort(
                    (a, b) =>
                        new Date(b.lastMessageTime).getTime() -
                        new Date(a.lastMessageTime).getTime(),
                );

                setChatHeads(heads);
            }
        } catch (error) {
            console.error('Error fetching chat heads:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChatHeads();
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>
                        Loading chats...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header />

            {/* Header */}
            <View
                style={{
                    backgroundColor: colors.white,
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }}>
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: '700',
                        color: colors.primary,
                    }}>
                    Chats
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                {chatHeads.length === 0 ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: 60,
                        }}>
                        <Text style={{ fontSize: 64, marginBottom: 16 }}>💬</Text>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: colors.primary,
                                marginBottom: 8,
                            }}>
                            No conversations yet
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: colors.placeholder,
                                textAlign: 'center',
                                paddingHorizontal: 40,
                            }}>
                            Start chatting with car owners from the car details page
                        </Text>
                    </View>
                ) : (
                    chatHeads.map((chat, index) => (
                        <Pressable
                            key={chat.userId}
                            onPress={() => {
                                // Navigate to chat screen - we need carId
                                // For now, we'll need to pass userId and fetch car info
                                console.log('Open chat with:', chat.userId);
                            }}
                            style={{
                                backgroundColor: colors.white,
                                paddingVertical: 16,
                                paddingHorizontal: 20,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            {/* Avatar */}
                            <View
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: '#9C27B0',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                }}>
                                <Text style={{ fontSize: 24, color: colors.white }}>
                                    {chat.username.charAt(0).toUpperCase()}
                                </Text>
                                {chat.unreadCount > 0 && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
                                            backgroundColor: '#FF3B30',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 2,
                                            borderColor: colors.white,
                                        }}>
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                fontWeight: '700',
                                                color: colors.white,
                                            }}>
                                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Content */}
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 4,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: '600',
                                            color: colors.primary,
                                            flex: 1,
                                        }}
                                        numberOfLines={1}>
                                        {chat.username}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: colors.placeholder,
                                            marginLeft: 8,
                                        }}>
                                        {formatTime(chat.lastMessageTime)}
                                    </Text>
                                </View>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: '#9C27B0',
                                        marginBottom: 4,
                                    }}
                                    numberOfLines={1}>
                                    {chat.carName}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color:
                                            chat.unreadCount > 0
                                                ? colors.primary
                                                : colors.placeholder,
                                        fontWeight: chat.unreadCount > 0 ? '600' : '400',
                                    }}
                                    numberOfLines={1}>
                                    {chat.lastMessage}
                                </Text>
                            </View>

                            {/* Arrow */}
                            <MaterialIcons
                                name="chevron-right"
                                size={24}
                                color={colors.placeholder}
                            />
                        </Pressable>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

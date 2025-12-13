import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/auth-context';
import { API_CONFIG } from '../../../../lib/api/config';
import type { ChatHead, Message } from '../types/chatTypes';

export function useChatHeads() {
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
                const conversationsMap = new Map<string, Message[]>();

                data.forEach((msg: Message) => {
                    const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
                    if (!conversationsMap.has(partnerId)) {
                        conversationsMap.set(partnerId, []);
                    }
                    conversationsMap.get(partnerId)!.push(msg);
                });

                // Process conversations into chat heads
                const heads: ChatHead[] = [];
                conversationsMap.forEach((messages, partnerId) => {
                    // Sort messages by date (newest first)
                    const sortedMessages = messages.sort(
                        (a, b) =>
                            new Date(b.createDate).getTime() - new Date(a.createDate).getTime(),
                    );

                    const lastMsg = sortedMessages[0];

                    // Extract car name from title
                    let username = 'User';
                    let carName = '';

                    if (lastMsg.title) {
                        const titleMatch = lastMsg.title.match(/Chat about (.+)/);
                        if (titleMatch) {
                            carName = titleMatch[1];
                        }
                    }

                    // Count unread messages
                    const unreadCount = sortedMessages.filter(
                        (m: Message) => m.senderId === partnerId && m.status === 'Open',
                    ).length;

                    heads.push({
                        userId: partnerId,
                        username: username,
                        carName: carName || 'Car Inquiry',
                        lastMessage: lastMsg.content,
                        lastMessageTime: lastMsg.createDate,
                        unreadCount: unreadCount,
                        carId: '',
                    });
                });

                // Sort by most recent message
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

    return {
        chatHeads,
        loading,
        refreshing,
        onRefresh,
        fetchChatHeads
    };
}
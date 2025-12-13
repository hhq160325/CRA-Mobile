import React, { forwardRef } from 'react';
import { ScrollView, RefreshControl, View, Text, Image } from 'react-native';
import { colors } from '../../../theme/colors';
import type { Message } from '../types/chatTypes';

interface MessagesListProps {
    messages: Message[];
    refreshing: boolean;
    onRefresh: () => void;
    ownerUsername: string;
    userId?: string;
}

const MessagesList = forwardRef<ScrollView, MessagesListProps>(
    ({ messages, refreshing, onRefresh, ownerUsername, userId }, ref) => {
        return (
            <ScrollView
                ref={ref}
                style={{ flex: 1, backgroundColor: '#F5F5F5' }}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#9C27B0']}
                        tintColor="#9C27B0"
                    />
                }
                onContentSizeChange={() =>
                    ref && 'current' in ref && ref.current?.scrollToEnd({ animated: true })
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
                    messages.map((msg) => {
                        const isSentByMe = msg.senderId === userId;
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
        );
    }
);

MessagesList.displayName = 'MessagesList';

export default MessagesList;
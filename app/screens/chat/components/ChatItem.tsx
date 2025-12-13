import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { formatTime } from '../utils/timeUtils';
import type { ChatHead } from '../types/chatTypes';

interface ChatItemProps {
    chat: ChatHead;
    onPress: (chat: ChatHead) => void;
}

export default function ChatItem({ chat, onPress }: ChatItemProps) {
    return (
        <Pressable
            onPress={() => onPress(chat)}
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
    );
}
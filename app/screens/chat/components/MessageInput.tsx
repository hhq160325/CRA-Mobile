import React from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';

interface MessageInputProps {
    message: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    loading: boolean;
}

export default function MessageInput({ message, onChangeText, onSend, loading }: MessageInputProps) {
    return (
        <View
            style={{
                backgroundColor: colors.white,
                borderTopWidth: 1,
                borderTopColor: colors.border,
            }}>
            <View
                style={{
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                }}>
                <TextInput
                    value={message}
                    onChangeText={onChangeText}
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
                    onPress={onSend}
                    disabled={loading || !message.trim()}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor:
                            loading || !message.trim()
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
    );
}
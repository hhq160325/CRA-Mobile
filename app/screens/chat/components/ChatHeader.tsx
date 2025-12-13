import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../theme/colors';

export default function ChatHeader() {
    return (
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
    );
}
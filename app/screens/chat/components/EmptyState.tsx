import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../theme/colors';

export default function EmptyState() {
    return (
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
    );
}
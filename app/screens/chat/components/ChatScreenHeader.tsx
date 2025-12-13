import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../theme/colors';

interface ChatScreenHeaderProps {
    ownerUsername: string;
    carName: string;
    autoRefreshing: boolean;
}

export default function ChatScreenHeader({ ownerUsername, carName, autoRefreshing }: ChatScreenHeaderProps) {
    return (
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: colors.placeholder }}>
                        {carName}
                    </Text>
                    {autoRefreshing && (
                        <View style={{
                            marginLeft: 8,
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#4CAF50'
                        }} />
                    )}
                </View>
            </View>
        </View>
    );
}
import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { getStatusColor, getStatusText } from '../utils/bookingHelpers';

interface StatusBadgeProps {
    status: string;
    bookingId?: string;
    onMessagesPress?: () => void;
}

export default function StatusBadge({ status, bookingId, onMessagesPress }: StatusBadgeProps) {
    const handleMessagesPress = () => {
        if (onMessagesPress) {
            onMessagesPress();
        } else {
            Alert.alert('Messages', 'Chat feature coming soon!');
        }
    };

    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
        }}>
            {/* Status Badge */}
            <View style={{
                flex: 1,
                backgroundColor: getStatusColor(status),
                paddingVertical: 12,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                    {getStatusText(status)}
                </Text>
            </View>

            {/* Messages Button */}
            <Pressable
                onPress={handleMessagesPress}
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.morentBlue,
                    paddingVertical: 12,
                    borderRadius: 20,
                    shadowColor: colors.morentBlue,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                <MaterialIcons name="message" size={20} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>
                    Messages
                </Text>
            </Pressable>
        </View>
    );
}

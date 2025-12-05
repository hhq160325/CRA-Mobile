import React from 'react';
import { Pressable, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';

interface FeedbackButtonProps {
    onPress: () => void;
}

export default function FeedbackButton({ onPress }: FeedbackButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                backgroundColor: colors.morentBlue,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <MaterialIcons name="rate-review" size={24} color={colors.white} />
            <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.white,
                marginLeft: 8
            }}>
                Give Feedback
            </Text>
        </Pressable>
    );
}

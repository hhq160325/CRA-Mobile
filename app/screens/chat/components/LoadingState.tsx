import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import Header from '../../../components/Header/Header';

export default function LoadingState() {
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
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import Header from '../../../components/Header/Header';
import { styles } from '../messages.styles';

export default function MessageLoadingState() {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.morentBlue} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </View>
    );
}
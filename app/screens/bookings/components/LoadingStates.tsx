import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import Header from '../../../components/Header/Header';
import { styles } from '../styles/bookingForm.styles';

interface LoadingStatesProps {
    carLoading: boolean;
    car: any;
    t: any;
}

export default function LoadingStates({ carLoading, car, t }: LoadingStatesProps) {
    if (carLoading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (!car) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <Text>{t('carNotFound')}</Text>
                </View>
            </View>
        );
    }

    return null;
}
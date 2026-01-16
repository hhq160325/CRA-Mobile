import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

interface CarWalletCardProps {
    balance: number | null;
}

export default function CarWalletCard({ balance }: CarWalletCardProps) {

    if (balance === null || balance === undefined) {
        return null;
    }

    const formattedBalance = balance.toLocaleString('vi-VN');
    const isLowBalance = balance < 50000;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <MaterialIcons name="account-balance-wallet" size={24} color={colors.morentBlue} />
                <Text style={styles.title}>Car Wallet Balance</Text>
            </View>

            <View style={styles.balanceContainer}>
                <Text style={[styles.balance, isLowBalance && styles.lowBalance]}>
                    {formattedBalance} VND
                </Text>
                {isLowBalance && (
                    <View style={styles.warningContainer}>
                        <MaterialIcons name="warning" size={16} color="#f59e0b" />
                        <Text style={styles.warningText}>Low balance</Text>
                    </View>
                )}
            </View>

            <Text style={styles.description}>
                This is the available balance in the car's wallet for rental operations.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    title: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
        marginLeft: scale(8),
    },
    balanceContainer: {
        marginBottom: verticalScale(8),
    },
    balance: {
        fontSize: scale(24),
        fontWeight: '700',
        color: colors.morentBlue,
        marginBottom: verticalScale(4),
    },
    lowBalance: {
        color: '#f59e0b',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
    warningText: {
        fontSize: scale(12),
        color: '#f59e0b',
        marginLeft: scale(4),
        fontWeight: '500',
    },
    description: {
        fontSize: scale(12),
        color: colors.placeholder,
        lineHeight: scale(16),
    },
});

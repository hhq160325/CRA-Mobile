import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../theme/colors';
import { formatCurrency } from '../utils/paymentUtils';
import { styles } from '../../styles/additionalPaymentSection.styles';
import type { AdditionalFee } from '../types/additionalPaymentTypes';

interface FeeItemProps {
    fee: AdditionalFee;
    isSelected: boolean;
    overtimeHours: number;
    onToggle: (feeId: string) => void;
    onAdjustHours: (increment: boolean) => void;
}

export default function FeeItem({
    fee,
    isSelected,
    overtimeHours,
    onToggle,
    onAdjustHours
}: FeeItemProps) {
    const renderOvertimeSelector = () => (
        <View style={styles.hoursSelector}>
            <Text style={styles.hoursLabel}>Hours:</Text>
            <Pressable
                style={styles.hoursButton}
                onPress={() => onAdjustHours(false)}>
                <MaterialIcons name="remove" size={18} color={colors.morentBlue} />
            </Pressable>
            <Text style={styles.hoursValue}>{overtimeHours}</Text>
            <Pressable
                style={styles.hoursButton}
                onPress={() => onAdjustHours(true)}>
                <MaterialIcons name="add" size={18} color={colors.morentBlue} />
            </Pressable>
        </View>
    );

    return (
        <Pressable
            style={[styles.feeItem, isSelected && styles.feeItemSelected]}
            onPress={() => onToggle(fee.id)}>
            <View style={styles.feeHeader}>
                <View style={styles.feeIconContainer}>
                    <MaterialIcons
                        name={fee.icon as any}
                        size={22}
                        color={isSelected ? colors.morentBlue : '#6b7280'}
                    />
                </View>
                <View style={styles.feeInfo}>
                    <Text style={styles.feeName}>{fee.name}</Text>
                    <Text style={styles.feeAmount}>
                        {formatCurrency(fee.amount)}
                        {fee.id === 'overtime' && '/hour'}
                    </Text>
                </View>
                <MaterialIcons
                    name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={isSelected ? colors.morentBlue : '#d1d5db'}
                />
            </View>
            <Text style={styles.feeDescription}>{fee.description}</Text>

            {fee.id === 'overtime' && isSelected && renderOvertimeSelector()}
        </Pressable>
    );
}
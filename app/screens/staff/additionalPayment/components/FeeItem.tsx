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
    const renderOvertimeSelector = () => {
        const canDecrease = overtimeHours > (fee.minQuantity || 1);
        const canIncrease = overtimeHours < (fee.maxQuantity || 24);
        const unitLabel = fee.unit ? `${fee.unit}${overtimeHours > 1 ? 's' : ''}` : 'Hours';

        return (
            <View style={styles.hoursSelector}>
                <Text style={styles.hoursLabel}>{unitLabel}:</Text>
                <Pressable
                    style={[styles.hoursButton, !canDecrease && styles.hoursButtonDisabled]}
                    onPress={() => canDecrease && onAdjustHours(false)}
                    disabled={!canDecrease}>
                    <MaterialIcons
                        name="remove"
                        size={18}
                        color={canDecrease ? colors.morentBlue : '#d1d5db'}
                    />
                </Pressable>
                <Text style={styles.hoursValue}>{overtimeHours}</Text>
                <Pressable
                    style={[styles.hoursButton, !canIncrease && styles.hoursButtonDisabled]}
                    onPress={() => canIncrease && onAdjustHours(true)}
                    disabled={!canIncrease}>
                    <MaterialIcons
                        name="add"
                        size={18}
                        color={canIncrease ? colors.morentBlue : '#d1d5db'}
                    />
                </Pressable>
            </View>
        );
    };

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
                        {fee.unit && `/${fee.unit}`}
                    </Text>
                </View>
                <MaterialIcons
                    name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={isSelected ? colors.morentBlue : '#d1d5db'}
                />
            </View>
            <Text style={styles.feeDescription}>{fee.description}</Text>

            {fee.isEditable && isSelected && renderOvertimeSelector()}
        </Pressable>
    );
}
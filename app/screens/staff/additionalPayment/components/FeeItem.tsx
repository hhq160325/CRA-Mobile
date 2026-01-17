import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../theme/colors';
import { formatCurrency } from '../utils/paymentUtils';
import { styles } from '../../styles/additionalPaymentSection.styles';
import type { AdditionalFee } from '../types/additionalPaymentTypes';

interface FeeItemProps {
    fee: AdditionalFee;
    isSelected: boolean;
    overtimeHours: number;
    customAmount?: number;
    onToggle: (feeId: string) => void;
    onAdjustHours: (increment: boolean) => void;
    onSetCustomAmount?: (feeId: string, amount: number) => void;
}

export default function FeeItem({
    fee,
    isSelected,
    overtimeHours,
    customAmount,
    onToggle,
    onAdjustHours,
    onSetCustomAmount
}: FeeItemProps) {
    const [inputAmount, setInputAmount] = useState(customAmount?.toString() || '');

    // Update input when customAmount changes (from travel logs auto-population)
    useEffect(() => {
        if (customAmount !== undefined) {
            setInputAmount(customAmount.toString());
        }
    }, [customAmount]);
    const renderCustomAmountInput = () => {
        const handleAmountChange = (text: string) => {
            setInputAmount(text);
            const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numericValue) && numericValue >= (fee.minAmount || 0) && numericValue <= (fee.maxAmount || 10000000)) {
                onSetCustomAmount?.(fee.id, numericValue);
            }
        };

        return (
            <View style={styles.customAmountContainer}>
                <Text style={styles.customAmountLabel}>Amount (VND):</Text>
                <TextInput
                    style={[
                        styles.customAmountInput,
                        fee.id === 'total_charges' && customAmount && customAmount > 0 && styles.customAmountInputDisabled
                    ]}
                    value={inputAmount}
                    onChangeText={handleAmountChange}
                    placeholder={fee.placeholder || 'Enter amount'}
                    keyboardType="numeric"
                    maxLength={10}
                    editable={!(fee.id === 'total_charges' && customAmount && customAmount > 0)}
                />
            </View>
        );
    };

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
                        {fee.isAmountEditable && customAmount !== undefined
                            ? formatCurrency(customAmount)
                            : formatCurrency(fee.amount)
                        }
                        {fee.unit && !fee.isAmountEditable && `/${fee.unit}`}
                    </Text>
                </View>
                <MaterialIcons
                    name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={isSelected ? colors.morentBlue : '#d1d5db'}
                />
            </View>
            <Text style={styles.feeDescription}>{fee.description}</Text>

            {fee.isAmountEditable && isSelected && renderCustomAmountInput()}
            {fee.isEditable && !fee.isAmountEditable && isSelected && renderOvertimeSelector()}
        </Pressable>
    );
}
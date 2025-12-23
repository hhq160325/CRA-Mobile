import React from 'react';
import { View, Text, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../../../theme/colors';
import { DriverLicenseOCRResult } from '../../../../lib/api/services/ocr.service';

interface OCRInfoCardProps {
    ocrResult: DriverLicenseOCRResult;
    onEdit?: () => void;
    onClear?: () => void;
}

export default function OCRInfoCard({ ocrResult, onEdit, onClear }: OCRInfoCardProps) {
    const getConfidenceColor = (probability: number) => {
        if (probability >= 95) return colors.green;
        if (probability >= 85) return colors.orange;
        return colors.red;
    };

    const avgConfidence = (
        ocrResult.idProbability +
        ocrResult.nameProbability +
        ocrResult.dateOfBirthProbability +
        ocrResult.dateOfIssueProbability +
        ocrResult.dateOfExpiryProbability +
        ocrResult.classProbability
    ) / 6;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📄 Extracted License Information</Text>
                <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence: </Text>
                    <Text style={[
                        styles.confidenceValue,
                        { color: getConfidenceColor(avgConfidence) }
                    ]}>
                        {avgConfidence.toFixed(1)}%
                    </Text>
                </View>
            </View>

            <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>License ID</Text>
                        <Text style={styles.infoValue}>{ocrResult.licenseId}</Text>
                        <Text style={[styles.confidence, { color: getConfidenceColor(ocrResult.idProbability) }]}>
                            {ocrResult.idProbability}%
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Class</Text>
                        <Text style={styles.infoValue}>{ocrResult.class}</Text>
                        <Text style={[styles.confidence, { color: getConfidenceColor(ocrResult.classProbability) }]}>
                            {ocrResult.classProbability}%
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItemFull}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{ocrResult.nameOnLicense}</Text>
                        <Text style={[styles.confidence, { color: getConfidenceColor(ocrResult.nameProbability) }]}>
                            {ocrResult.nameProbability}%
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>{ocrResult.dateOfBirth}</Text>
                        <Text style={[styles.confidence, { color: getConfidenceColor(ocrResult.dateOfBirthProbability) }]}>
                            {ocrResult.dateOfBirthProbability}%
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Issue Date</Text>
                        <Text style={styles.infoValue}>{ocrResult.dateOfIssue}</Text>
                        <Text style={[styles.confidence, { color: getConfidenceColor(ocrResult.dateOfIssueProbability) }]}>
                            {ocrResult.dateOfIssueProbability}%
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItemFull}>
                        <Text style={styles.infoLabel}>Expiry Date</Text>
                        <Text style={styles.infoValue}>{ocrResult.dateOfExpiry}</Text>
                        <Text style={[styles.confidence, { color: getConfidenceColor(ocrResult.dateOfExpiryProbability) }]}>
                            {ocrResult.dateOfExpiryProbability}%
                        </Text>
                    </View>
                </View>
            </View>

            {avgConfidence < 85 && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                        ⚠️ Some information may not be accurate due to low confidence scores
                    </Text>
                </View>
            )}

            <View style={styles.actionButtons}>
                {onEdit && (
                    <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                        <Text style={styles.editButtonText}>Edit Information</Text>
                    </TouchableOpacity>
                )}

                {onClear && (
                    <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                        <Text style={styles.clearButtonText}>Clear OCR Data</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = {
    container: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color: colors.primary,
    },
    confidenceContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    confidenceLabel: {
        fontSize: 12,
        color: colors.placeholder,
    },
    confidenceValue: {
        fontSize: 12,
        fontWeight: '600' as TextStyle['fontWeight'],
    },
    infoGrid: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row' as const,
        marginBottom: 12,
        gap: 12,
    },
    infoItem: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    infoItemFull: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.placeholder,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500' as TextStyle['fontWeight'],
        color: colors.primary,
        marginBottom: 4,
    },
    confidence: {
        fontSize: 10,
        fontWeight: '600' as TextStyle['fontWeight'],
    },
    warningContainer: {
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.orange,
    },
    warningText: {
        fontSize: 12,
        color: '#E65100',
        lineHeight: 16,
    },
    actionButtons: {
        flexDirection: 'row' as const,
        gap: 8,
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.morentBlue,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center' as const,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '500' as TextStyle['fontWeight'],
        color: '#fff',
    },
    clearButton: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center' as const,
        borderWidth: 1,
        borderColor: colors.border,
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '500' as TextStyle['fontWeight'],
        color: colors.placeholder,
    },
};
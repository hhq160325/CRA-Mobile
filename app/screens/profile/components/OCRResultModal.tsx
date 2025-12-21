import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextStyle,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { DriverLicenseOCRResult } from '../../../../lib/api/services/ocr.service';

interface OCRResultModalProps {
    visible: boolean;
    isProcessing: boolean;
    ocrResult: DriverLicenseOCRResult | null;
    onClose: () => void;
    onAccept: () => void;
    onRetry: () => void;
}

export default function OCRResultModal({
    visible,
    isProcessing,
    ocrResult,
    onClose,
    onAccept,
    onRetry,
}: OCRResultModalProps) {
    const getConfidenceColor = (probability: number) => {
        if (probability >= 95) return colors.green;
        if (probability >= 85) return colors.orange;
        return colors.red;
    };

    const getConfidenceText = (probability: number) => {
        if (probability >= 95) return 'High';
        if (probability >= 85) return 'Medium';
        return 'Low';
    };

    const renderProcessingState = () => (
        <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.morentBlue} />
            <Text style={styles.processingTitle}>Extracting License Information</Text>
            <Text style={styles.processingSubtitle}>
                Please wait while we analyze your driver's license...
            </Text>
        </View>
    );

    const renderOCRResults = () => {
        if (!ocrResult) return null;

        const avgConfidence = (
            ocrResult.idProbability +
            ocrResult.nameProbability +
            ocrResult.dateOfBirthProbability +
            ocrResult.dateOfIssueProbability +
            ocrResult.dateOfExpiryProbability +
            ocrResult.classProbability
        ) / 6;

        return (
            <ScrollView style={styles.resultsContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>License Information Extracted</Text>
                    <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceLabel}>Overall Confidence: </Text>
                        <Text style={[
                            styles.confidenceValue,
                            { color: getConfidenceColor(avgConfidence) }
                        ]}>
                            {avgConfidence.toFixed(1)}% ({getConfidenceText(avgConfidence)})
                        </Text>
                    </View>
                </View>

                <View style={styles.fieldsContainer}>
                    <OCRField
                        label="License ID"
                        value={ocrResult.licenseId}
                        confidence={ocrResult.idProbability}
                    />

                    <OCRField
                        label="Full Name"
                        value={ocrResult.nameOnLicense}
                        confidence={ocrResult.nameProbability}
                    />

                    <OCRField
                        label="License Class"
                        value={ocrResult.class}
                        confidence={ocrResult.classProbability}
                    />

                    <OCRField
                        label="Date of Birth"
                        value={ocrResult.dateOfBirth}
                        confidence={ocrResult.dateOfBirthProbability}
                    />

                    <OCRField
                        label="Issue Date"
                        value={ocrResult.dateOfIssue}
                        confidence={ocrResult.dateOfIssueProbability}
                    />

                    <OCRField
                        label="Expiry Date"
                        value={ocrResult.dateOfExpiry}
                        confidence={ocrResult.dateOfExpiryProbability}
                    />
                </View>

                {avgConfidence < 85 && (
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningTitle}>⚠️ Low Confidence Detected</Text>
                        <Text style={styles.warningText}>
                            Some information may not be accurate. Please review carefully or retake the photo.
                        </Text>
                    </View>
                )}
            </ScrollView>
        );
    };

    const OCRField = ({ label, value, confidence }: {
        label: string;
        value: string;
        confidence: number;
    }) => (
        <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <View style={styles.confidenceBadge}>
                    <Text style={[
                        styles.confidenceBadgeText,
                        { color: getConfidenceColor(confidence) }
                    ]}>
                        {confidence}%
                    </Text>
                </View>
            </View>
            <Text style={styles.fieldValue}>{value || 'N/A'}</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {isProcessing ? renderProcessingState() : renderOCRResults()}

                {!isProcessing && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.retryButton]}
                            onPress={onRetry}
                        >
                            <Text style={styles.retryButtonText}>Retake Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={onAccept}
                        >
                            <Text style={styles.acceptButtonText}>Accept & Continue</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!isProcessing && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Modal>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    processingContainer: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        padding: 20,
    },
    processingTitle: {
        fontSize: 20,
        fontWeight: '600' as TextStyle['fontWeight'],
        color: colors.primary,
        marginTop: 20,
        marginBottom: 8,
    },
    processingSubtitle: {
        fontSize: 16,
        color: colors.placeholder,
        textAlign: 'center' as const,
        lineHeight: 22,
    },
    resultsContainer: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold' as TextStyle['fontWeight'],
        color: colors.primary,
        marginBottom: 12,
    },
    confidenceContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    confidenceLabel: {
        fontSize: 16,
        color: colors.placeholder,
    },
    confidenceValue: {
        fontSize: 16,
        fontWeight: '600' as TextStyle['fontWeight'],
    },
    fieldsContainer: {
        marginBottom: 20,
    },
    fieldContainer: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    fieldHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '500' as TextStyle['fontWeight'],
        color: colors.placeholder,
    },
    confidenceBadge: {
        backgroundColor: colors.white,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    confidenceBadgeText: {
        fontSize: 12,
        fontWeight: '600' as TextStyle['fontWeight'],
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '500' as TextStyle['fontWeight'],
        color: colors.primary,
    },
    warningContainer: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.orange,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color: '#E65100',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#E65100',
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row' as const,
        padding: 20,
        paddingTop: 0,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center' as const,
    },
    retryButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color: colors.primary,
    },
    acceptButton: {
        backgroundColor: colors.morentBlue,
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: '600' as TextStyle['fontWeight'],
        color: '#fff',
    },
    closeButton: {
        alignItems: 'center' as const,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    closeButtonText: {
        fontSize: 16,
        color: colors.placeholder,
    },
};
import React from 'react';
import { View, Text } from 'react-native';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    styles: any;
}

export default function ProgressIndicator({ currentStep, totalSteps, styles }: ProgressIndicatorProps) {
    const renderStep = (stepNumber: number) => {
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        let stepStyle = styles.progressStep;
        let textStyle = styles.progressStepText;

        if (isActive) {
            stepStyle = [styles.progressStep, styles.progressStepActive];
        } else if (isCompleted) {
            stepStyle = [styles.progressStep, styles.progressStepCompleted];
        } else {
            stepStyle = [styles.progressStep, styles.progressStepInactive];
            textStyle = [styles.progressStepText, styles.progressStepTextInactive];
        }

        return (
            <View key={stepNumber} style={stepStyle}>
                <Text style={textStyle}>
                    {isCompleted ? '✓' : stepNumber}
                </Text>
            </View>
        );
    };

    const renderLine = (lineNumber: number) => {
        const isActive = lineNumber < currentStep;

        return (
            <View
                key={`line-${lineNumber}`}
                style={[
                    styles.progressLine,
                    isActive && styles.progressLineActive
                ]}
            />
        );
    };

    return (
        <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const elements = [renderStep(stepNumber)];

                // Add line after each step except the last one
                if (stepNumber < totalSteps) {
                    elements.push(renderLine(stepNumber));
                }

                return elements;
            }).flat()}
        </View>
    );
}
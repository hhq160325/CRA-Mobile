import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

interface ReportCarButtonProps {
    onPress: () => void;
}

export default function ReportCarButton({ onPress }: ReportCarButtonProps) {
    const handlePress = () => {
        console.log('🔍 ReportCarButton: Button pressed');
        onPress();
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={handlePress}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="report-problem" size={24} color={colors.white} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.buttonText}>Report Car Issue</Text>
                    <Text style={styles.buttonSubtext}>
                        Report any problems with this vehicle
                    </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.white} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: scale(16),
        marginVertical: verticalScale(8),
    },
    button: {
        backgroundColor: '#ef4444',
        borderRadius: scale(12),
        padding: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    textContainer: {
        flex: 1,
    },
    buttonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.white,
        marginBottom: verticalScale(2),
    },
    buttonSubtext: {
        fontSize: scale(12),
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
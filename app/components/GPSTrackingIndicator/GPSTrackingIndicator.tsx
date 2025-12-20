import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { useGPSTrackingContext } from '../../../lib/providers/GPSTrackingProvider';
import { gpsIndicatorStyles as styles } from './GPSTrackingIndicator.styles';

interface GPSTrackingIndicatorProps {
    onPress?: () => void;
}

export default function GPSTrackingIndicator({ onPress }: GPSTrackingIndicatorProps) {
    const { isTracking, trackingError, lastLocationSent } = useGPSTrackingContext();

    if (trackingError) {
        return (
            <Pressable style={[styles.container, styles.containerError]} onPress={onPress}>
                <MaterialIcons name="location-off" size={16} color="#ef4444" />
                <Text style={styles.errorText}>GPS Error</Text>
            </Pressable>
        );
    }

    if (!isTracking) {
        return (
            <Pressable style={[styles.container, styles.containerInactive]} onPress={onPress}>
                <MaterialIcons name="location-disabled" size={16} color="#6b7280" />
                <Text style={styles.inactiveText}>GPS Off</Text>
            </Pressable>
        );
    }

    const getLastUpdateText = () => {
        if (!lastLocationSent) return 'Starting...';

        const now = new Date();
        const diffMs = now.getTime() - lastLocationSent.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        return `${Math.floor(diffMinutes / 60)}h ago`;
    };

    return (
        <Pressable style={[styles.container, styles.containerActive]} onPress={onPress}>
            <View style={styles.pulsingDot} />
            <MaterialIcons name="location-on" size={16} color="#10b981" />
            <Text style={styles.activeText}>GPS Active</Text>
            <Text style={styles.lastUpdateText}>{getLastUpdateText()}</Text>
        </Pressable>
    );
}
import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { styles } from '../messages.styles';

interface MessageHeaderProps {
    ownerUsername: string;
    carName: string;
}

export default function MessageHeader({ ownerUsername, carName }: MessageHeaderProps) {
    return (
        <View style={styles.headerCard}>
            <MaterialIcons name="message" size={32} color={colors.morentBlue} />
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Send Message</Text>
                <Text style={styles.headerSubtitle}>
                    To: {ownerUsername} • {carName}
                </Text>
            </View>
        </View>
    );
}
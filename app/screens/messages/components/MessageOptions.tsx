import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { styles } from '../messages.styles';

interface MessageOptionsProps {
    onOptionSelect: (option: 'custom' | 'rent_more', value: string) => void;
}

export default function MessageOptions({ onOptionSelect }: MessageOptionsProps) {
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [showRentMoreModal, setShowRentMoreModal] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    const handleCustomMessageSubmit = () => {
        if (customMessage.trim()) {
            onOptionSelect('custom', customMessage.trim());
            setCustomMessage('');
            setShowCustomModal(false);
        }
    };

    const handleRentMoreSelect = (days: number) => {
        onOptionSelect('rent_more', `Request to extend rental for ${days} more day${days > 1 ? 's' : ''}`);
        setShowRentMoreModal(false);
    };

    return (
        <>
            <View style={styles.optionsCard}>
                <Text style={styles.optionsTitle}>Quick Message Options</Text>
                <Text style={styles.optionsSubtitle}>Choose a message type or create your own</Text>

                <View style={styles.optionsContainer}>
                    {/* Custom Message Option */}
                    <Pressable
                        style={styles.optionButton}
                        onPress={() => setShowCustomModal(true)}>
                        <MaterialIcons name="edit" size={20} color={colors.morentBlue} />
                        <Text style={styles.optionButtonText}>Custom Message</Text>
                        <MaterialIcons name="chevron-right" size={20} color={colors.placeholder} />
                    </Pressable>

                    {/* Rent More Option */}
                    <Pressable
                        style={styles.optionButton}
                        onPress={() => setShowRentMoreModal(true)}>
                        <MaterialIcons name="schedule" size={20} color={colors.morentBlue} />
                        <Text style={styles.optionButtonText}>Rent More Days</Text>
                        <MaterialIcons name="chevron-right" size={20} color={colors.placeholder} />
                    </Pressable>
                </View>
            </View>

            {/* Custom Message Modal */}
            <Modal
                visible={showCustomModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCustomModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Custom Message</Text>
                        <Text style={styles.modalSubtitle}>Enter your custom message</Text>

                        <TextInput
                            value={customMessage}
                            onChangeText={setCustomMessage}
                            placeholder="Type your message here..."
                            placeholderTextColor={colors.placeholder}
                            style={styles.modalInput}
                            multiline={true}
                            numberOfLines={3}
                            autoFocus={true}
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={() => {
                                    setCustomMessage('');
                                    setShowCustomModal(false);
                                }}>
                                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={handleCustomMessageSubmit}>
                                <Text style={styles.modalButtonTextPrimary}>Use Message</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Rent More Modal */}
            <Modal
                visible={showRentMoreModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRentMoreModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Extend Rental Period</Text>
                        <Text style={styles.modalSubtitle}>How many more days would you like to rent?</Text>

                        <View style={styles.daysContainer}>
                            {[1, 2, 3, 4, 5].map((days) => (
                                <Pressable
                                    key={days}
                                    style={styles.dayButton}
                                    onPress={() => handleRentMoreSelect(days)}>
                                    <Text style={styles.dayButtonText}>{days}</Text>
                                    <Text style={styles.dayButtonLabel}>
                                        {days === 1 ? 'Day' : 'Days'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable
                            style={[styles.modalButton, styles.modalButtonSecondary, { alignSelf: 'center', marginTop: 16 }]}
                            onPress={() => setShowRentMoreModal(false)}>
                            <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

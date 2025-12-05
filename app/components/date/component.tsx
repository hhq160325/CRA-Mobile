import React, { useState } from 'react'
import { View, Text, Modal, Pressable, StyleSheet, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors } from '../../theme/colors'
import { scale, verticalScale } from '../../theme/scale'

interface DateComponentProps {
    visible: boolean
    setVisible: (visible: boolean) => void
    onDateSelect?: (date: Date) => void
    initialDate?: Date
    minimumDate?: Date
    maximumDate?: Date
}

export default function DateComponent({
    visible,
    setVisible,
    onDateSelect,
    initialDate = new Date(),
    minimumDate,
    maximumDate,
}: DateComponentProps) {
    const [selectedDate, setSelectedDate] = useState(initialDate)

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setVisible(false)
        }

        if (date) {
            setSelectedDate(date)
            onDateSelect?.(date)
        }
    }

    const handleConfirm = () => {
        onDateSelect?.(selectedDate)
        setVisible(false)
    }

    if (Platform.OS === 'android') {
        return visible ? (
            <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
            />
        ) : null
    }

    // iOS Modal
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <Pressable
                style={styles.overlay}
                onPress={() => setVisible(false)}
            >
                <Pressable
                    style={styles.container}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.header}>
                        <Pressable onPress={() => setVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Text style={styles.title}>Select Date</Text>
                        <Pressable onPress={handleConfirm}>
                            <Text style={styles.doneText}>Done</Text>
                        </Pressable>
                    </View>

                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        textColor={colors.primary}
                        themeVariant="light"
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.white,
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        paddingBottom: verticalScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
    },
    cancelText: {
        fontSize: scale(16),
        color: colors.placeholder,
    },
    doneText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.morentBlue,
    },
})

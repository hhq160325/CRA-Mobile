import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './CustomDateTimePicker.styles';

interface CustomDateTimePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date, time: string) => void;
    initialDate?: Date;
    initialTime?: string;
    minimumDate?: Date;
    title: string;
    isPickup?: boolean;
}

export default function CustomDateTimePicker({
    visible,
    onClose,
    onConfirm,
    initialDate = new Date(),
    initialTime = '06:00',
    minimumDate = new Date(),
    title,
    isPickup = true
}: CustomDateTimePickerProps) {
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isTimeInPast = (hour: string, minute: string): boolean => {
        const now = new Date();
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

        const isToday = selectedDate.toDateString() === now.toDateString();
        if (!isToday) return false;

        return selectedDateTime < now;
    };

    const timeOptions = [];
    for (let hour = 6; hour <= 23; hour++) {
        timeOptions.push(`${String(hour).padStart(2, '0')}:00`);
        if (hour < 23) {
            timeOptions.push(`${String(hour).padStart(2, '0')}:30`);
        }
    }

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.emptyDayCell} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isSelected = selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;
            const isPast = date < minimumDate && date.toDateString() !== minimumDate.toDateString();

            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 10);
            maxDate.setHours(23, 59, 59, 999);
            const isBeyond10Days = isPickup && date > maxDate;

            const isDisabled = isPast || isBeyond10Days;

            days.push(
                <Pressable
                    key={day}
                    disabled={isDisabled}
                    onPress={() => setSelectedDate(date)}
                    style={styles.dayCell}
                >
                    <View style={[styles.dayCircle, isSelected ? styles.dayCircleSelected : styles.dayCircleUnselected]}>
                        <Text style={[
                            styles.dayText,
                            isDisabled ? styles.dayTextDisabled : isSelected ? styles.dayTextSelected : styles.dayTextUnselected
                        ]}>
                            {day}
                        </Text>
                    </View>
                </Pressable>
            );
        }

        return days;
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleConfirm = () => {
        const [hours, minutes] = selectedTime.split(':');
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const now = new Date();
        if (selectedDateTime < now) {
            alert('Cannot select a time in the past. Please choose a future date and time.');
            return;
        }

        if (isPickup) {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 10);
            maxDate.setHours(23, 59, 59, 999);

            if (selectedDateTime > maxDate) {
                alert('Pickup date must be within 10 days from today. Please choose an earlier date.');
                return;
            }
        }

        onConfirm(selectedDate, selectedTime);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>{title}</Text>
                            <Pressable onPress={onClose}>
                                <MaterialIcons name="close" size={24} color={colors.primary} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.scrollView}>
                            <View style={styles.monthNavigation}>
                                <Pressable onPress={handlePrevMonth} style={styles.monthNavigationButton}>
                                    <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
                                </Pressable>
                                <Text style={styles.monthText}>
                                    {monthNames[currentMonth]} {currentYear}
                                </Text>
                                <Pressable onPress={handleNextMonth} style={styles.monthNavigationButton}>
                                    <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
                                </Pressable>
                            </View>

                            <View style={styles.dayNamesContainer}>
                                {dayNames.map((day, index) => (
                                    <View key={index} style={styles.dayNameCell}>
                                        <Text style={styles.dayNameText}>{day}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.calendarGrid}>
                                {renderCalendar()}
                            </View>

                            <View style={styles.timeSection}>
                                <Text style={styles.timeSectionTitle}>Time Picker</Text>

                                <View style={styles.timePickerContainer}>
                                    <View style={styles.timeColumn}>
                                        <ScrollView
                                            showsVerticalScrollIndicator={true}
                                            snapToInterval={50}
                                            decelerationRate="fast"
                                            nestedScrollEnabled={true}
                                            contentContainerStyle={styles.timeScrollContent}
                                        >
                                            {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                                                const hourStr = String(hour).padStart(2, '0');
                                                const isSelected = selectedTime.split(':')[0] === hourStr;
                                                const minute = selectedTime.split(':')[1];
                                                const isPast = isTimeInPast(hourStr, minute);
                                                return (
                                                    <Pressable
                                                        key={hour}
                                                        disabled={isPast}
                                                        onPress={() => {
                                                            const minute = selectedTime.split(':')[1];
                                                            setSelectedTime(`${hourStr}:${minute}`);
                                                        }}
                                                        style={[
                                                            styles.timeItem,
                                                            isSelected ? styles.timeItemSelected : styles.timeItemUnselected,
                                                            { opacity: isPast ? 0.3 : 1 }
                                                        ]}
                                                    >
                                                        <Text style={[
                                                            styles.timeText,
                                                            isPast ? styles.timeTextDisabled : isSelected ? styles.timeTextSelected : styles.timeTextUnselected
                                                        ]}>
                                                            {hourStr}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    <Text style={styles.timeSeparator}>:</Text>

                                    <View style={styles.timeColumn}>
                                        <ScrollView
                                            showsVerticalScrollIndicator={true}
                                            snapToInterval={50}
                                            decelerationRate="fast"
                                            nestedScrollEnabled={true}
                                            contentContainerStyle={styles.timeScrollContent}
                                        >
                                            {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                                                const minuteStr = String(minute).padStart(2, '0');
                                                const isSelected = selectedTime.split(':')[1] === minuteStr;
                                                const hour = selectedTime.split(':')[0];
                                                const isPast = isTimeInPast(hour, minuteStr);
                                                return (
                                                    <Pressable
                                                        key={minute}
                                                        disabled={isPast}
                                                        onPress={() => {
                                                            const hour = selectedTime.split(':')[0];
                                                            setSelectedTime(`${hour}:${minuteStr}`);
                                                        }}
                                                        style={[
                                                            styles.timeItem,
                                                            isSelected ? styles.timeItemSelected : styles.timeItemUnselected,
                                                            { opacity: isPast ? 0.3 : 1 }
                                                        ]}
                                                    >
                                                        <Text style={[
                                                            styles.timeText,
                                                            isPast ? styles.timeTextDisabled : isSelected ? styles.timeTextSelected : styles.timeTextUnselected
                                                        ]}>
                                                            {minuteStr}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                </View>

                                <View style={styles.selectedTimeDisplay}>
                                    <Text style={styles.selectedTimeLabel}>Selected time</Text>
                                    <Text style={styles.selectedTimeValue}>{selectedTime}</Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <Pressable onPress={handleConfirm} style={styles.confirmButton}>
                                <Text style={styles.confirmButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

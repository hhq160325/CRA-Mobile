import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface CustomDateTimePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date, time: string) => void;
    initialDate?: Date;
    initialTime?: string;
    minimumDate?: Date;
    title: string;
    isPickup?: boolean; // true for pickup (10-day limit), false for dropoff (unlimited)
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

    const monthNames = ['JaJanuary', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper function to check if a time is in the past
    const isTimeInPast = (hour: string, minute: string): boolean => {
        const now = new Date();
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

        // Only check if selected date is today
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
            days.push(<View key={`empty-${i}`} style={{ width: '14.28%', padding: 8 }} />);
        }


        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isSelected = selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;
            const isPast = date < minimumDate && date.toDateString() !== minimumDate.toDateString();

            // Calculate maximum date (10 days from now) - only for pickup
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 10);
            maxDate.setHours(23, 59, 59, 999); // End of the 10th day
            const isBeyond10Days = isPickup && date > maxDate; // Only apply limit for pickup

            const isDisabled = isPast || isBeyond10Days;

            days.push(
                <Pressable
                    key={day}
                    disabled={isDisabled}
                    onPress={() => setSelectedDate(date)}
                    style={{
                        width: '14.28%',
                        padding: 8,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isSelected ? colors.morentBlue : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text style={{
                            fontSize: 14,
                            color: isDisabled ? '#ccc' : isSelected ? colors.white : colors.primary,
                            fontWeight: isSelected ? '600' : '400'
                        }}>
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
        // Validate that selected time is not in the past
        const [hours, minutes] = selectedTime.split(':');
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const now = new Date();
        if (selectedDateTime < now) {
            alert('Cannot select a time in the past. Please choose a future date and time.');
            return;
        }

        // Validate that selected date is within 10 days (only for pickup)
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
            <Pressable
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                onPress={onClose}
            >
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: colors.white,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxHeight: '90%'
                    }}>
                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border
                        }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>
                                {title}
                            </Text>
                            <Pressable onPress={onClose}>
                                <MaterialIcons name="close" size={24} color={colors.primary} />
                            </Pressable>
                        </View>

                        <ScrollView style={{ maxHeight: 600 }}>
                            {/* Month Navigation */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                paddingVertical: 12
                            }}>
                                <Pressable onPress={handlePrevMonth} style={{ padding: 8 }}>
                                    <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
                                </Pressable>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.primary }}>
                                    {monthNames[currentMonth]} {currentYear}
                                </Text>
                                <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
                                    <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
                                </Pressable>
                            </View>

                            {/* Day Names */}
                            <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8 }}>
                                {dayNames.map((day, index) => (
                                    <View key={index} style={{ width: '14.28%', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12, color: colors.placeholder, fontWeight: '600' }}>
                                            {day}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Calendar Grid */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
                                {renderCalendar()}
                            </View>

                            {/* Time Selection - Wheel Picker Style */}
                            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: 12 }}>
                                    Time Picker
                                </Text>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: colors.background,
                                    borderRadius: 12,
                                    padding: 16,
                                    height: 200,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}>
                                    {/* Hour Picker */}
                                    <View style={{ flex: 1 }}>
                                        <ScrollView
                                            showsVerticalScrollIndicator={true}
                                            snapToInterval={50}
                                            decelerationRate="fast"
                                            nestedScrollEnabled={true}
                                            contentContainerStyle={{ paddingVertical: 75 }}
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
                                                        style={{
                                                            height: 50,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backgroundColor: isSelected ? '#4A5568' : 'transparent',
                                                            borderRadius: 8,
                                                            marginVertical: 2,
                                                            opacity: isPast ? 0.3 : 1
                                                        }}
                                                    >
                                                        <Text style={{
                                                            fontSize: isSelected ? 32 : 24,
                                                            color: isPast ? '#D1D5DB' : isSelected ? colors.white : '#9CA3AF',
                                                            fontWeight: isSelected ? '700' : '400'
                                                        }}>
                                                            {hourStr}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Separator */}
                                    <Text style={{ fontSize: 32, color: colors.primary, fontWeight: '600', marginHorizontal: 8 }}>:</Text>

                                    {/* Minute Picker */}
                                    <View style={{ flex: 1 }}>
                                        <ScrollView
                                            showsVerticalScrollIndicator={true}
                                            snapToInterval={50}
                                            decelerationRate="fast"
                                            nestedScrollEnabled={true}
                                            contentContainerStyle={{ paddingVertical: 75 }}
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
                                                        style={{
                                                            height: 50,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backgroundColor: isSelected ? '#4A5568' : 'transparent',
                                                            borderRadius: 8,
                                                            marginVertical: 2,
                                                            opacity: isPast ? 0.3 : 1
                                                        }}
                                                    >
                                                        <Text style={{
                                                            fontSize: isSelected ? 32 : 24,
                                                            color: isPast ? '#D1D5DB' : isSelected ? colors.white : '#9CA3AF',
                                                            fontWeight: isSelected ? '700' : '400'
                                                        }}>
                                                            {minuteStr}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                </View>

                                {/* Selected Time Display */}
                                <View style={{
                                    marginTop: 16,
                                    padding: 12,
                                    backgroundColor: colors.background,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}>
                                    <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 4 }}>
                                        Selected time
                                    </Text>
                                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.morentBlue }}>
                                        {selectedTime}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Confirm Button */}
                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                            <Pressable
                                onPress={handleConfirm}
                                style={{
                                    backgroundColor: colors.morentBlue,
                                    paddingVertical: 14,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

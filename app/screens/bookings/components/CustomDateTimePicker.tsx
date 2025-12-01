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
}

export default function CustomDateTimePicker({
    visible,
    onClose,
    onConfirm,
    initialDate = new Date(),
    initialTime = '06:00',
    minimumDate = new Date(),
    title
}: CustomDateTimePickerProps) {
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Generate time options (06:00 - 23:00)
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

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={{ width: '14.28%', padding: 8 }} />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isSelected = selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;
            const isPast = date < minimumDate && date.toDateString() !== minimumDate.toDateString();

            days.push(
                <Pressable
                    key={day}
                    disabled={isPast}
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
                            color: isPast ? '#ccc' : isSelected ? colors.white : colors.primary,
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

                            {/* Time Selection */}
                            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 16 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: 12 }}>
                                    Chọn giờ
                                </Text>
                                <Pressable
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderRadius: 8,
                                        padding: 12,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>
                                        {selectedTime}
                                    </Text>
                                    <MaterialIcons name="access-time" size={20} color={colors.placeholder} />
                                </Pressable>

                                {/* Time Options Grid */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
                                    {timeOptions.map((time) => (
                                        <Pressable
                                            key={time}
                                            onPress={() => setSelectedTime(time)}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                                borderRadius: 6,
                                                backgroundColor: selectedTime === time ? colors.morentBlue : colors.background,
                                                borderWidth: 1,
                                                borderColor: selectedTime === time ? colors.morentBlue : colors.border
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 13,
                                                color: selectedTime === time ? colors.white : colors.primary,
                                                fontWeight: selectedTime === time ? '600' : '400'
                                            }}>
                                                {time}
                                            </Text>
                                        </Pressable>
                                    ))}
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
                                    Xác nhận
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

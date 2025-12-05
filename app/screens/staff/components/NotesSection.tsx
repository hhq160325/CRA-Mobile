import React from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale, verticalScale } from "../../../theme/scale"

interface NotesSectionProps {
    title: string
    value: string
    onChangeText: (text: string) => void
    placeholder: string
    editable?: boolean
}

export default function NotesSection({
    title,
    value,
    onChangeText,
    placeholder,
    editable = true
}: NotesSectionProps) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name="description" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                <TextInput
                    style={[styles.textInput, !editable && styles.textInputReadOnly]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    numberOfLines={3}
                    editable={editable}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        marginHorizontal: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        gap: scale(8),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontWeight: "600",
        color: colors.primary,
    },
    sectionContent: {
        padding: scale(16),
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: scale(14),
        color: colors.primary,
        minHeight: verticalScale(80),
        textAlignVertical: "top",
    },
    textInputReadOnly: {
        backgroundColor: "#f3f4f6",
        color: "#6b7280",
    },
})

import React from "react"
import { View, TextInput, Pressable } from "react-native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

interface SearchBarProps {
    searchQuery: string
    onSearchChange: (text: string) => void
    onFilterPress: () => void
    hasActiveFilters: boolean
}

export default function SearchBar({ searchQuery, onSearchChange, onFilterPress, hasActiveFilters }: SearchBarProps) {
    return (
        <View style={{ padding: scale(16), paddingTop: scale(12), backgroundColor: colors.white }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.background,
                    borderRadius: 10,
                    paddingHorizontal: scale(16),
                    paddingVertical: scale(14),
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                <MaterialIcons name="search" size={scale(22)} color={colors.placeholder} />
                <TextInput
                    placeholder="Search something here"
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    style={{ flex: 1, marginLeft: scale(12), fontSize: scale(14), color: colors.primary }}
                />
                <Pressable
                    onPress={onFilterPress}
                    style={{
                        padding: scale(8),
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: hasActiveFilters ? colors.morentBlue : colors.border,
                        backgroundColor: hasActiveFilters ? colors.morentBlue : colors.white,
                    }}
                >
                    <MaterialIcons name="tune" size={scale(20)} color={hasActiveFilters ? colors.white : colors.primary} />
                </Pressable>
            </View>
        </View>
    )
}

import React, { useState } from 'react'
import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native'
import { styles } from './component.styles'

interface TabData {
    id: string | number
    label: string
    value?: string | number
}

interface TabSwitcherProps {
    title?: string
    data: TabData[]
    onPress: (item: TabData) => void
    tabContainerStyle?: ViewStyle
    tabStyle?: ViewStyle | ViewStyle[]
    tabTextStyle?: TextStyle
}

export default function TabSwitcher({
    title,
    data,
    onPress,
    tabContainerStyle,
    tabStyle,
    tabTextStyle,
}: TabSwitcherProps) {
    const [selectedId, setSelectedId] = useState<string | number | null>(null)

    const handlePress = (item: TabData) => {
        setSelectedId(item.id)
        onPress(item)
    }

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={[styles.tabContainer, tabContainerStyle]}>
                {data.map((item) => {
                    const isSelected = selectedId === item.id
                    const tabStyles = Array.isArray(tabStyle) ? tabStyle : [tabStyle]

                    return (
                        <Pressable
                            key={item.id}
                            onPress={() => handlePress(item)}
                            style={[
                                styles.tab,
                                ...tabStyles,
                                isSelected && styles.selectedTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    tabTextStyle,
                                    isSelected && styles.selectedTabText,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>
        </View>
    )
}

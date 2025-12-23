import { StyleSheet } from "react-native"
import { colors } from "../../../../theme/colors"

export const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: colors.placeholder,
        marginBottom: 16,
    },
    contentCard: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 12,
    },
})

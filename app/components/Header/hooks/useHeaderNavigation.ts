import { useNavigation } from "@react-navigation/native"
import { Alert } from "react-native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../../navigators/navigation-route"
import { useAuth } from "../../../../lib/auth-context"

export function useHeaderNavigation() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "You want to continue logging out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Next",
                    onPress: async () => {
                        await logout(true)
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "auth" as any }],
                        })
                    }
                }
            ]
        )
    }

    const handleMenuNavigation = async (screen: string) => {
        const isStaff = user?.role === "staff" || user?.roleId === 1002

        console.log("Header navigation:", { screen, isStaff, userRole: user?.role, roleId: user?.roleId })

        try {

            if (screen === "PaymentHistory") {
                console.log("Navigating to PaymentHistory")
                navigation.navigate("PaymentHistory" as any)
                return
            }


            console.log(`Navigating to ${screen}`)
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: "auth" as any,
                        state: {
                            routes: [
                                {
                                    name: (isStaff ? "staffStack" : "tabStack") as any,
                                    state: {
                                        routes: [{ name: screen as any }],
                                        index: 0,
                                    },
                                },
                            ],
                            index: 0,
                        },
                    },
                ],
            })
        } catch (error) {
            console.error("Navigation error:", error)
            console.log("Fallback: Resetting to auth with default stack")
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: "auth" as any,
                        state: {
                            routes: [{ name: (isStaff ? "staffStack" : "tabStack") as any }],
                            index: 0,
                        },
                    },
                ],
            })
        }
    }

    return {
        handleLogout,
        handleMenuNavigation,
    }
}

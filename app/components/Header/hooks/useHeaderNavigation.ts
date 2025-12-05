import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../../navigators/navigation-route"
import { useAuth } from "../../../../lib/auth-context"

export function useHeaderNavigation() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        // Reset navigation stack completely to prevent going back to authenticated screens
        navigation.reset({
            index: 0,
            routes: [{ name: "authStack" as any }],
        })
    }

    const handleMenuNavigation = async (screen: string) => {
        const isStaff = user?.role === "staff" || user?.roleId === 1002

        console.log("Header navigation:", { screen, isStaff, userRole: user?.role, roleId: user?.roleId })

        try {
            if (screen === "Profile") {
                console.log("Navigating to Profile")
                navigation.navigate("Profile" as any)
            } else if (screen === "Bookings") {
                console.log("Navigating to Bookings")
                // Navigate within the current stack (MainStack/tabStack)
                navigation.navigate("Bookings" as any)
            } else if (screen === "PaymentHistory") {
                console.log("Navigating to PaymentHistory")
                navigation.navigate("PaymentHistory" as any)
            } else if (screen === "Home") {
                console.log("Navigating to Home")
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: (isStaff ? "staffStack" : "tabStack") as any,
                            state: {
                                routes: [{ name: "Home" }],
                            },
                        },
                    ],
                })
            }
        } catch (error) {
            console.error("Navigation error:", error)
            console.log("Resetting to", isStaff ? "staffStack" : "tabStack")
            navigation.reset({
                index: 0,
                routes: [{ name: (isStaff ? "staffStack" : "tabStack") as any }],
            })
        }
    }

    return {
        handleLogout,
        handleMenuNavigation,
    }
}

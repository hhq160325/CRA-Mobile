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
            "Log out of your account?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        // COMPREHENSIVE FIX: Clear all cache on logout
                        try {
                            const { apiCache } = require('../../../../lib/api/cache');
                            console.log('🧹 Logout - clearing all cache to prevent data persistence');
                            await apiCache.clearAll();
                            console.log('✅ Cache cleared for logout');
                        } catch (error) {
                            console.warn('Failed to clear cache during logout:', error);
                        }

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

        console.log("🔍 Header navigation triggered:", { screen, isStaff, userRole: user?.role, roleId: user?.roleId })

        // COMPREHENSIVE FIX: Clear all cache on any navigation action
        // This ensures fresh data when returning to any screen, especially staff screen
        try {
            const { apiCache } = require('../../../../lib/api/cache');
            console.log(`🧹 MORENT Logo/Menu navigation to ${screen} - clearing all cache to ensure fresh data`);
            await apiCache.clearAll();
            console.log(`✅ Cache cleared successfully for MORENT navigation to ${screen}`);
        } catch (error) {
            console.error('❌ Failed to clear cache during MORENT navigation:', error);
        }

        try {
            // Special handling for PaymentHistory
            if (screen === "PaymentHistory") {
                console.log("📊 Navigating to PaymentHistory")
                navigation.navigate("PaymentHistory" as any)
                return
            }

            // Navigate to the requested screen
            console.log(`🚀 Navigating to ${screen} with navigation.reset`)
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
            console.log(`✅ Navigation to ${screen} completed`)
        } catch (error) {
            console.error("❌ Navigation error:", error)
            console.log("🔄 Fallback: Resetting to auth with default stack")
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

import React, { useRef, useState } from "react"
import { View, Text, ActivityIndicator, Pressable, Alert } from "react-native"
import { WebView } from "react-native-webview"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

type PayOSWebViewRouteProp = RouteProp<{ params: { paymentUrl: string; bookingId?: string } }, "params">

export default function PayOSWebViewScreen() {
    const route = useRoute<PayOSWebViewRouteProp>()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const { paymentUrl, bookingId } = (route.params as any) || {}

    const [loading, setLoading] = useState(true)
    const [canGoBack, setCanGoBack] = useState(false)
    const webViewRef = useRef<WebView>(null)

    const handleNavigationStateChange = (navState: any) => {
        setCanGoBack(navState.canGoBack)

        // Check if payment is completed
        const url = navState.url
        console.log("WebView URL changed:", url)

        // PayOS success/cancel URLs
        if (url.includes('success') || url.includes('completed')) {
            Alert.alert(
                "Payment Successful",
                "Your payment has been completed successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            if (bookingId && bookingId !== "pending") {
                                navigation.navigate("BookingDetail" as any, { id: bookingId })
                            } else {
                                // Navigate to main tab stack
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: "tabStack" as any }],
                                })
                            }
                        }
                    }
                ]
            )
        } else if (url.includes('cancel') || url.includes('failed')) {
            // Auto close WebView and return to home
            navigation.reset({
                index: 0,
                routes: [{ name: "tabStack" as any }],
            })

            // Show alert after navigation
            setTimeout(() => {
                Alert.alert(
                    "Payment Cancelled",
                    "Your payment was cancelled. You can try booking again from the home screen."
                )
            }, 500)
        }
    }

    const handleClose = () => {
        Alert.alert(
            "Close Payment",
            "Are you sure you want to close the payment page?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => navigation.goBack() }
            ]
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.white,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
            }}>
                <Pressable onPress={handleClose} style={{ padding: 8 }}>
                    <MaterialIcons name="close" size={24} color={colors.primary} />
                </Pressable>

                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                    PayOS Payment
                </Text>

                <Pressable
                    onPress={() => webViewRef.current?.reload()}
                    style={{ padding: 8 }}
                >
                    <MaterialIcons name="refresh" size={24} color={colors.primary} />
                </Pressable>
            </View>

            {/* WebView */}
            <WebView
                ref={webViewRef}
                source={{ uri: paymentUrl }}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onNavigationStateChange={handleNavigationStateChange}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: colors.background
                    }}>
                        <ActivityIndicator size="large" color={colors.morentBlue} />
                        <Text style={{ marginTop: 16, color: colors.placeholder }}>
                            Loading payment page...
                        </Text>
                    </View>
                )}
            />

            {/* Loading Overlay */}
            {loading && (
                <View style={{
                    position: "absolute",
                    top: 60,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.9)"
                }}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>
                        Loading...
                    </Text>
                </View>
            )}
        </View>
    )
}

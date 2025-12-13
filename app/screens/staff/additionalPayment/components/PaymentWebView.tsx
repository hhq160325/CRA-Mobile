import React from 'react';
import { View, Text, Modal, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../../../theme/colors';
import {
    isPaymentRedirectUrl,
    isPayOSUrl,
    handlePaymentResult,
} from '../utils/paymentUtils';
import { styles } from '../../styles/additionalPaymentSection.styles';
import type { PaymentResponse } from '../types/additionalPaymentTypes';

interface PaymentWebViewProps {
    visible: boolean;
    paymentResponse: PaymentResponse | null;
    onClose: () => void;
    onReset: () => void;
    onNavigateToReturn?: () => void;
}

export default function PaymentWebView({
    visible,
    paymentResponse,
    onClose,
    onReset,
    onNavigateToReturn
}: PaymentWebViewProps) {
    const handleNavigationStateChange = (navState: any) => {
        console.log('WebView navigation:', navState.url);

        if (isPaymentRedirectUrl(navState.url)) {
            console.log(' Payment redirect detected:', navState.url);

            onClose();
            onReset();

            handlePaymentResult(navState.url, onNavigateToReturn);

            return false;
        }
    };

    const handleShouldStartLoadWithRequest = (request: any) => {
        console.log('WebView should start load:', request.url);


        if (isPayOSUrl(request.url) || request.url === paymentResponse?.payOSLink) {
            return true;
        }


        if (isPaymentRedirectUrl(request.url)) {
            console.log(' PayOS redirect detected in shouldStart:', request.url);
            return true;
        }


        console.log(' Blocking external navigation:', request.url);
        return false;
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error: ', nativeEvent);
        Alert.alert('Error', 'Failed to load payment page');
    };

    const renderLoading = () => (
        <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.webViewLoadingText}>Loading payment page...</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}>
            {paymentResponse?.payOSLink && (
                <WebView
                    source={{ uri: paymentResponse.payOSLink }}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                    renderLoading={renderLoading}
                    onNavigationStateChange={handleNavigationStateChange}
                    onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                    onError={handleError}
                />
            )}
        </Modal>
    );
}
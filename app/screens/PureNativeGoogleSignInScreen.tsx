import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { usePureNativeGoogleSignIn } from '../hooks/usePureNativeGoogleSignIn';

export const PureNativeGoogleSignInScreen: React.FC = () => {
    const {
        user,
        isLoading,
        isSignedIn,
        isConfigured,
        error,
        signIn,
        signOut,
        revokeAccess,
        refreshUser,
        clearError,
        debugInfo,
        configStatus,
    } = usePureNativeGoogleSignIn();

    const handleSignIn = async () => {
        if (!isConfigured) {
            Alert.alert('error', 'Pure Native Google Sign-In not provide');
            return;
        }

        await signIn();

        if (error) {
            Alert.alert('Login Fail', error);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Confirm',
            'Are you want o logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'signOut',
                    style: 'destructive',
                    onPress: signOut,
                },
            ]
        );
    };

    const handleRevokeAccess = () => {
        Alert.alert(
            'Confirm',
            'Are you sure you want to revoke access?',
            [
                { text: 'cancel', style: 'cancel' },
                {
                    text: 'Recall',
                    style: 'destructive',
                    onPress: revokeAccess,
                },
            ]
        );
    };

    const showDebugInfo = () => {
        if (debugInfo) {
            Alert.alert(
                'Pure Native Debug Info',
                JSON.stringify(debugInfo, null, 2),
                [{ text: 'OK' }]
            );
        }
    };

    const showConfigStatus = () => {
        if (configStatus) {
            const statusText = [
                `Type: ${configStatus.type}`,
                `Method: ${configStatus.authMethod}`,
                `Web Client ID: ${configStatus.webClientId}`,
                `iOS Client ID: ${configStatus.iosClientId}`,
                `Configured: ${configStatus.isConfigured ? 'Yes' : 'No'}`,
                '',
                'Requirements:',
                ...configStatus.requirements
            ].join('\n');

            Alert.alert('Pure Native Config', statusText, [{ text: 'OK' }]);
        }
    };

    if (isLoading && !isConfigured) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Initializing Pure Native...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!isConfigured) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.errorTitle}>Pure Native Config Error</Text>
                    <Text style={styles.errorText}>{error || 'Cannot configure Pure Native'}</Text>

                    <View style={styles.requirementsBox}>
                        <Text style={styles.requirementsTitle}> Pure Native Requirements:</Text>
                        <Text style={styles.requirementText}>Android Client ID (Google Cloud Console)</Text>
                        <Text style={styles.requirementText}>SHA-1: A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF</Text>
                        <Text style={styles.requirementText}>Package: com.carapp.app</Text>
                        <Text style={styles.requirementText}>EAS Build APK</Text>
                        <Text style={styles.requirementText}>Real Android device</Text>
                        <Text style={styles.requirementText}>NO Web Client ID</Text>
                        <Text style={styles.requirementText}>NO iOS Client ID</Text>
                        <Text style={styles.requirementText}>NO Expo Go</Text>
                        <Text style={styles.requirementText}>NO expo-auth-session</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}> CarApp</Text>
                    <Text style={styles.subtitle}>PURE Native Google Sign-In</Text>
                    <Text style={styles.buildInfo}>
                        NO Web Client ID •  Android Client ID + SHA-1 ONLY
                    </Text>
                </View>

                {/* Status Section */}
                <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Status:</Text>
                        <Text style={[styles.statusValue, { color: isSignedIn ? '#4CAF50' : '#999' }]}>
                            {isSignedIn ? ' Signed In' : ' Not Signed In'}
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Config:</Text>
                        <Text style={[styles.statusValue, { color: isConfigured ? '#4CAF50' : '#F44336' }]}>
                            {isConfigured ? ' Pure Native Ready' : ' Not Configured'}
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Backend Auth:</Text>
                        <Text style={[styles.statusValue, { color: debugInfo?.backendAuthenticated ? '#4CAF50' : '#FF9800' }]}>
                            {debugInfo?.backendAuthenticated ? ' Authenticated' : ' Not Authenticated'}
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Method:</Text>
                        <Text style={[styles.statusValue, { color: '#2196F3' }]}>
                            Pure Native + Mobile API
                        </Text>
                    </View>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Web Client ID:</Text>
                        <Text style={[styles.statusValue, { color: '#F44336' }]}>
                            NOT USED
                        </Text>
                    </View>
                </View>

                {/* Error Display */}
                {error && (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorCardTitle}>⚠️ Pure Native Error</Text>
                        <Text style={styles.errorCardText}>{error}</Text>
                        <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
                            <Text style={styles.clearErrorText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* User Info or Login Section */}
                {!isSignedIn ? (
                    <View style={styles.loginSection}>
                        <Text style={styles.sectionTitle}>Pure Native Google Sign-In</Text>
                        <Text style={styles.pureDescription}>
                            PURE Native Implementation{'\n'}
                            NO Web Client ID needed{'\n'}
                            Android Client ID + SHA-1 ONLY{'\n'}
                            EAS Build APK on Real Device
                        </Text>

                        <View style={styles.loginButtonContainer}>
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#4285F4" />
                                    <Text style={styles.loadingText}>Loging...</Text>
                                </View>
                            ) : (
                                <GoogleSigninButton
                                    style={styles.googleButton}
                                    size={GoogleSigninButton.Size.Wide}
                                    color={GoogleSigninButton.Color.Dark}
                                    onPress={handleSignIn}
                                    disabled={!isConfigured}
                                />
                            )}
                        </View>

                        <View style={styles.pureInfoBox}>
                            <Text style={styles.pureInfoTitle}> Pure Native Config:</Text>
                            <Text style={styles.pureInfoText}>• Type: PURE Native (No Web)</Text>
                            <Text style={styles.pureInfoText}>• Build: EAS APK</Text>
                            <Text style={styles.pureInfoText}>• Package: com.carapp.app</Text>
                            <Text style={styles.pureInfoText}>• SHA-1: A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF</Text>
                            <Text style={styles.pureInfoText}>• Client ID: Android ONLY</Text>
                            <Text style={styles.pureInfoText}>• Device: Real Android</Text>
                            <Text style={styles.pureInfoText}>• Web Client ID:  NOT USED</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.profileSection}>
                        <Text style={styles.welcomeText}>Pure Native Success! </Text>

                        {user?.photo && (
                            <Image
                                source={{ uri: user.photo }}
                                style={styles.avatar}
                            />
                        )}

                        <View style={styles.userCard}>
                            <View style={styles.userRow}>
                                <Text style={styles.userLabel}> Name:</Text>
                                <Text style={styles.userValue}>{user?.name}</Text>
                            </View>
                            <View style={styles.userRow}>
                                <Text style={styles.userLabel}> Email:</Text>
                                <Text style={styles.userValue}>{user?.email}</Text>
                            </View>
                            <View style={styles.userRow}>
                                <Text style={styles.userLabel}> ID:</Text>
                                <Text style={styles.userValue} numberOfLines={1}>{user?.id}</Text>
                            </View>
                            {user?.familyName && (
                                <View style={styles.userRow}>
                                    <Text style={styles.userLabel}> Family:</Text>
                                    <Text style={styles.userValue}>{user.familyName}</Text>
                                </View>
                            )}
                            {user?.givenName && (
                                <View style={styles.userRow}>
                                    <Text style={styles.userLabel}> Given:</Text>
                                    <Text style={styles.userValue}>{user.givenName}</Text>
                                </View>
                            )}
                            <View style={styles.userRow}>
                                <Text style={styles.userLabel}> Auth:</Text>
                                <Text style={styles.userValue}>Pure Native</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.refreshButton]}
                                onPress={refreshUser}
                                disabled={isLoading}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isLoading ? ' Refreshing...' : ' Refresh User'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.signOutButton]}
                                onPress={handleSignOut}
                                disabled={isLoading}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isLoading ? ' Signing out...' : ' Sign Out'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.revokeButton]}
                                onPress={handleRevokeAccess}
                                disabled={isLoading}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isLoading ? ' Revoking...' : ' Revoke Access'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Debug Buttons */}
                <View style={styles.debugSection}>
                    <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
                        <Text style={styles.debugButtonText}> Debug Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.configButton} onPress={showConfigStatus}>
                        <Text style={styles.configButtonText}> Pure Config</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        PURE Native Google Sign-In{'\n'}
                        NO Web Client ID •  Android Client ID + SHA-1{'\n'}
                        EAS Build APK • Real Device Only
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: '600',
    },
    buildInfo: {
        fontSize: 12,
        color: '#2196F3',
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 16,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorCard: {
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    errorCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C62828',
        marginBottom: 8,
    },
    errorCardText: {
        fontSize: 14,
        color: '#C62828',
        marginBottom: 12,
    },
    clearErrorButton: {
        alignSelf: 'flex-end',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F44336',
        borderRadius: 6,
    },
    clearErrorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    loginSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    pureDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    loginButtonContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    googleButton: {
        width: 192,
        height: 48,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    pureInfoBox: {
        backgroundColor: '#E8F5E8',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
    },
    pureInfoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 8,
    },
    pureInfoText: {
        fontSize: 12,
        color: '#388E3C',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
    profileSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 16,
        textAlign: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#4CAF50',
    },
    userCard: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    userRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    userLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        width: 80,
    },
    userValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    actionButtons: {
        width: '100%',
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    refreshButton: {
        backgroundColor: '#4CAF50',
    },
    signOutButton: {
        backgroundColor: '#FF9800',
    },
    revokeButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    debugSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    debugButton: {
        backgroundColor: '#9C27B0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 0.48,
        alignItems: 'center',
    },
    debugButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    configButton: {
        backgroundColor: '#607D8B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 0.48,
        alignItems: 'center',
    },
    configButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        marginTop: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F44336',
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    requirementsBox: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        alignItems: 'flex-start',
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    requirementText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
});

export default PureNativeGoogleSignInScreen;
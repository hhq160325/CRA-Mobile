'use client';

import { useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../../lib/auth-context';
import { API_CONFIG, API_ENDPOINTS } from '../../../lib/api/config';
import { goBack } from '../../navigators/navigation-utilities';
import { scale } from '../../theme/scale';
import { colors } from '../../theme/colors';

const GoogleLoginWebView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const { refreshUser } = useAuth();
  const [loginProcessed, setLoginProcessed] = useState(false);

  const googleLoginUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`;

  const handleSuccess = () => {
    if (loginProcessed) return;
    setLoginProcessed(true);

    console.log(' Google login successful, closing WebView');
    refreshUser();

    setTimeout(() => {
      goBack();
    }, 500);
  };

  const handleCancel = () => {
    console.log(' Google login cancelled');
    goBack();
  };

  const handleNavigationStateChange = (navState: any) => {
    const url = navState.url;
    console.log('WebView navigation:', url);

    if (
      url.includes('/callback') ||
      url.includes('jwtToken') ||
      url.includes('token=')
    ) {
      console.log(' Callback detected in WebView');

      try {
        const parsedUrl = new URL(
          url.replace('carapp://', 'https://dummy.com/'),
        );
        const params = parsedUrl.searchParams;

        let jwtToken = params.get('jwtToken') || params.get('token');
        let username = params.get('username');
        let email = params.get('email');
        let refreshToken = params.get('refreshToken');

        if (!jwtToken && parsedUrl.hash) {
          const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
          jwtToken = hashParams.get('jwtToken') || hashParams.get('token');
          username = hashParams.get('username');
          email = hashParams.get('email');
          refreshToken = hashParams.get('refreshToken');
        }

        if (jwtToken) {
          console.log(' Token found in URL, saving...');

          if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
            localStorage.setItem('token', jwtToken);

            if (refreshToken && refreshToken !== 'null') {
              localStorage.setItem('refreshToken', refreshToken);
            }

            try {
              const tokenParts = jwtToken.split('.');
              if (tokenParts.length === 3) {
                const payload = tokenParts[1];
                const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map(
                      c =>
                        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
                    )
                    .join(''),
                );
                const decodedToken = JSON.parse(jsonPayload);

                const roleFromToken =
                  decodedToken[
                  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
                  ];
                const isCarOwner =
                  decodedToken.IsCarOwner === 'True' ||
                  decodedToken.IsCarOwner === true;

                let role: 'customer' | 'staff' | 'car-owner' = 'customer';
                if (roleFromToken === '1002' || roleFromToken === 1002) {
                  role = 'staff';
                } else if (isCarOwner) {
                  role = 'car-owner';
                }

                const user = {
                  id: decodedToken.sub || '',
                  name: username || decodedToken.name || '',
                  email: email || decodedToken.email || '',
                  role: role,
                  roleId: parseInt(roleFromToken) || 1,
                  createdAt: new Date().toISOString(),
                  isGoogle: true,
                };

                localStorage.setItem('user', JSON.stringify(user));
                console.log(' Saved user to localStorage:', user.email);
              }
            } catch (e) {
              console.error('Failed to decode JWT:', e);
            }
          }

          handleSuccess();
        }
      } catch (error) {
        console.error('Error parsing callback URL:', error);
      }
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      if (data.type === 'LOGIN_SUCCESS' && data.token) {
        console.log(' Login success message received from injected JS');

        if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
          localStorage.setItem('token', data.token);

          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }

          const user = {
            id: '',
            name: data.username || '',
            email: data.email || '',
            role: 'customer' as const,
            roleId: 1,
            createdAt: new Date().toISOString(),
            isGoogle: true,
          };

          localStorage.setItem('user', JSON.stringify(user));
          console.log(' Saved user from message');
        }

        handleSuccess();
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      console.log('Injected JS loaded');
      
      // Check URL for token immediately
      function checkUrlForToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('jwtToken') || urlParams.get('token');
        
        if (token) {
          console.log('Token found in URL');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOGIN_SUCCESS',
            token: token,
            username: urlParams.get('username'),
            email: urlParams.get('email'),
            refreshToken: urlParams.get('refreshToken')
          }));
          return true;
        }
        
        // Check hash params
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashToken = hashParams.get('jwtToken') || hashParams.get('token');
          
          if (hashToken) {
            console.log('Token found in hash');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LOGIN_SUCCESS',
              token: hashToken,
              username: hashParams.get('username'),
              email: hashParams.get('email'),
              refreshToken: hashParams.get('refreshToken')
            }));
            return true;
          }
        }
        
        return false;
      }
      
      // Check immediately
      checkUrlForToken();
      
      // Check on URL changes
      let lastUrl = window.location.href;
      setInterval(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          checkUrlForToken();
        }
      }, 500);
      
      true; // Required for iOS
    })();
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sign in with Google</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary || '#3B82F6'} />
          <Text style={styles.loadingText}>Loading Google Sign-In...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: googleLoginUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    padding: scale(8),
  },
  cancelText: {
    fontSize: scale(16),
    color: '#3B82F6',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scale(14),
    color: '#666',
  },
  webview: {
    flex: 1,
  },
});

export default GoogleLoginWebView;

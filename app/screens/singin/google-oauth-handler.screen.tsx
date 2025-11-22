"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import { WebView } from "react-native-webview"
import { useAuth } from "../../../lib/auth-context"
import { API_CONFIG, API_ENDPOINTS } from "../../../lib/api/config"
import { goBack } from "../../navigators/navigation-utilities"
import { scale } from "../../theme/scale"

const GoogleOAuthHandler = () => {
    const [status, setStatus] = useState("Connecting to Google...")
    const { refreshUser } = useAuth()
    const [processed, setProcessed] = useState(false)

    const googleLoginUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`

    // HTML content that will handle the OAuth flow
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Sign-In</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 400px;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 1rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .success { color: #10b981; }
        .error { color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 10px; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div id="icon" class="icon">🔐</div>
        <h2 id="title">Signing in with Google...</h2>
        <div id="spinner" class="spinner"></div>
        <p id="message">Please wait</p>
        <div id="error" class="error" style="display: none;"></div>
    </div>
    
    <script>
        (function() {
            console.log('OAuth handler loaded');
            
            let step = 1;
            
            function updateStatus(icon, title, message, showSpinner = true) {
                document.getElementById('icon').textContent = icon;
                document.getElementById('title').textContent = title;
                document.getElementById('message').textContent = message;
                document.getElementById('spinner').style.display = showSpinner ? 'block' : 'none';
            }
            
            function showError(message) {
                document.getElementById('error').textContent = '❌ ' + message;
                document.getElementById('error').style.display = 'block';
                document.getElementById('spinner').style.display = 'none';
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ERROR',
                    message: message
                }));
            }
            
            function processGoogleResponse(data) {
                console.log('Processing Google response:', data);
                updateStatus('✅', 'Login Successful!', 'Processing your account...');
                
                if (!data.jwtToken) {
                    showError('No authentication token received');
                    return;
                }
                
                try {
                    // Decode JWT to get role
                    const tokenParts = data.jwtToken.split('.');
                    if (tokenParts.length !== 3) {
                        throw new Error('Invalid token format');
                    }
                    
                    const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    console.log('Decoded token:', payload);
                    
                    const roleFromToken = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                    const isCarOwner = payload.IsCarOwner === 'True' || payload.IsCarOwner === true;
                    
                    let role = 'customer';
                    if (roleFromToken === '1002' || roleFromToken === 1002) {
                        role = 'staff';
                    } else if (isCarOwner) {
                        role = 'car-owner';
                    }
                    
                    // Create user object
                    const user = {
                        id: payload.sub || '',
                        name: data.username || payload.name || '',
                        email: data.email || payload.email || '',
                        role: role,
                        roleId: parseInt(roleFromToken) || 1,
                        createdAt: new Date().toISOString(),
                        isGoogle: true
                    };
                    
                    console.log('Created user object:', user);
                    
                    // Send to React Native
                    updateStatus('✅', 'Success!', 'Welcome, ' + user.name);
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'LOGIN_SUCCESS',
                        token: data.jwtToken,
                        refreshToken: data.refreshToken,
                        user: user
                    }));
                    
                    setTimeout(() => {
                        updateStatus('✅', 'Redirecting...', 'Taking you to the app', false);
                    }, 1000);
                    
                } catch (error) {
                    console.error('Error processing response:', error);
                    showError('Failed to process login: ' + error.message);
                }
            }
            
            // Step 1: Redirect to Google OAuth
            updateStatus('🔐', 'Connecting to Google...', 'Redirecting to Google Sign-In');
            
            setTimeout(() => {
                console.log('Redirecting to:', '${googleLoginUrl}');
                
                // Create an iframe to handle the OAuth flow
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100vh';
                iframe.style.border = 'none';
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.zIndex = '1000';
                
                // Listen for messages from iframe
                window.addEventListener('message', function(event) {
                    console.log('Received message:', event.data);
                    
                    if (event.data && typeof event.data === 'object') {
                        if (event.data.jwtToken) {
                            processGoogleResponse(event.data);
                        }
                    }
                });
                
                // Monitor iframe for JSON response
                iframe.onload = function() {
                    console.log('Iframe loaded');
                    
                    try {
                        // Try to read iframe content
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const bodyText = iframeDoc.body.textContent || iframeDoc.body.innerText;
                        
                        console.log('Iframe content:', bodyText);
                        
                        // Check if it's JSON
                        if (bodyText.trim().startsWith('{')) {
                            try {
                                const data = JSON.parse(bodyText);
                                console.log('Parsed JSON from iframe:', data);
                                
                                // Hide iframe and show success
                                iframe.style.display = 'none';
                                processGoogleResponse(data);
                            } catch (e) {
                                console.error('Failed to parse JSON:', e);
                            }
                        }
                    } catch (e) {
                        console.log('Cannot access iframe content (CORS):', e.message);
                        // This is expected for cross-origin iframes
                    }
                };
                
                iframe.src = '${googleLoginUrl}';
                document.body.appendChild(iframe);
                
                // Hide the status container when iframe loads
                setTimeout(() => {
                    document.querySelector('.container').style.display = 'none';
                }, 500);
                
            }, 1000);
            
        })();
    </script>
</body>
</html>
  `

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data)
            console.log("Message from WebView:", data)

            if (data.type === "LOGIN_SUCCESS") {
                if (processed) return
                setProcessed(true)

                console.log("✅ Login successful!")
                setStatus("Login successful!")

                // Save to localStorage
                if (typeof localStorage !== "undefined" && localStorage?.setItem) {
                    localStorage.setItem("token", data.token)

                    if (data.refreshToken && data.refreshToken !== "null") {
                        localStorage.setItem("refreshToken", data.refreshToken)
                    }

                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user))
                    }

                    console.log("✅ Saved to localStorage")
                }

                // Refresh user and close
                setTimeout(() => {
                    refreshUser()
                    goBack()
                }, 1500)
            } else if (data.type === "ERROR") {
                setStatus("Error: " + data.message)
                setTimeout(() => goBack(), 3000)
            }
        } catch (error) {
            console.error("Error handling message:", error)
        }
    }

    return (
        <View style={styles.container}>
            <WebView
                source={{ html: htmlContent }}
                onMessage={handleMessage}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                mixedContentMode="always"
                originWhitelist={['*']}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    webview: {
        flex: 1,
    },
})

export default GoogleOAuthHandler

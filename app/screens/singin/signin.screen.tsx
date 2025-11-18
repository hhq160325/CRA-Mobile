"use client"

import { useState } from "react"
import { Image, ScrollView, Text, View, Alert } from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign"
import assets from "../../assets"
import Button from "../../components/button/component"
import CheckBoxComponent from "../../components/checkbox/component"
import InputComponent from "../../components/input/component"
import { scale } from "../../theme/scale"
import { createStyles } from "./signin.styles"
import { useSignin } from "./signin.hook"
import { useAuth } from "../../../lib/auth-context"
import { navigate } from "../../navigators/navigation-utilities"
import { renderMarginBottom } from "../../utils/ui-utils"

const SignInScreen = () => {
  const styles = createStyles()
  const { isSecure, setIsSecure } = useSignin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    setIsLoading(true)
    // eslint-disable-next-line no-console
    console.log("mobile sign in attempt", email, password)
    try {
      const success = await login(email, password)
      // eslint-disable-next-line no-console
      console.log("mobile login result success", success)
      if (success) {
        // Small delay to ensure auth context is updated
        await new Promise(resolve => setTimeout(resolve, 150))

        // Get current user from auth context
        const { authService } = require("../../../lib/api")
        const currentUser = authService.getCurrentUser()

        // eslint-disable-next-line no-console
        console.log("Current user after login:", currentUser)
        // eslint-disable-next-line no-console
        console.log("User role:", currentUser?.role)

        // After successful login, redirect based on role
        try {
          const { navigationRef } = require("../../navigators/navigation-utilities")
          if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
            // If user is staff, redirect to staff screen
            if (currentUser?.role === "staff") {
              // eslint-disable-next-line no-console
              console.log("Redirecting to StaffScreen for staff user")
              navigationRef.reset({
                index: 0,
                routes: [
                  {
                    name: "StaffScreen",
                  },
                ],
              })
            } else {
              // For customer and car-owner, go to main tab stack
              // eslint-disable-next-line no-console
              console.log("Redirecting to tabStack for non-staff user")
              navigationRef.reset({
                index: 0,
                routes: [
                  {
                    name: "tabStack",
                  },
                ],
              })
            }
          } else {
            // eslint-disable-next-line no-console
            console.log("Navigation not ready yet")
          }
        } catch (e) {
          // fallback: no-op
          // eslint-disable-next-line no-console
          console.log("reset after login failed", e)
        }
      } else {
        // visible feedback on failure
        Alert.alert("Login failed", "Invalid credentials")
      }
    } catch (err: any) {
      // network or unexpected error
      // eslint-disable-next-line no-console
      console.log("login exception", err)
      Alert.alert("Login error", err?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement Google Sign-In
      // You'll need to:
      // 1. Install: expo install expo-auth-session expo-crypto
      // 2. Set up Google OAuth credentials in Google Cloud Console
      // 3. Configure app.json with Google client IDs
      // 4. Implement the OAuth flow

      Alert.alert(
        "Google Sign-In",
        "Google Sign-In will be implemented here. This requires:\n\n" +
        "1. Google OAuth credentials\n" +
        "2. expo-auth-session package\n" +
        "3. Backend API endpoint for Google authentication"
      )

      // Example implementation structure:
      // const response = await googleAuthRequest()
      // if (response?.type === 'success') {
      //   const { authentication } = response
      //   // Send token to your backend
      //   const result = await apiClient('/auth/google', {
      //     method: 'POST',
      //     body: JSON.stringify({ token: authentication.accessToken })
      //   })
      //   // Handle successful login
      // }
    } catch (err: any) {
      console.log("Google login error", err)
      Alert.alert("Google Sign-In Error", err?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }
  const { logo_black } = assets
  return (
    <ScrollView style={styles.container}>
      <View style={styles.flexRow}>
        <Image source={logo_black} style={styles.carLogo} />
        <Text style={styles.titleStyle}>MORENT</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>Welcome Back</Text>
        <Text style={styles.textStyle}>Ready to hit the road.</Text>
      </View>
      <View style={styles.inputContainer}>
        <InputComponent onChangeText={(e) => setEmail(e)} placeholder={"Email/Phone Number"} />

        <InputComponent
          isSecure
          secureTextEntry={isSecure}
          onChangeText={(e) => setPassword(e)}
          placeholder={"Password"}
          onSecurePress={() => setIsSecure(!isSecure)}
        />
      </View>
      <View style={[styles.colG2]}>
        <View style={styles.flexRow}>
          <CheckBoxComponent
            onPress={(e) => {
              console.log("item", e)
            }}
            isChecked={false}
          />
          <Text style={styles.textRemember}>Remember Me</Text>
        </View>
        <Text style={styles.forgotPasswordText}>Forgot Password</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          text={isLoading ? "Signing in..." : "Login"}
          textStyles={styles.buttonText}
          onPress={handleLogin}
          buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
        />
        <Button
          onPress={() => navigate("SignUpScreen")}
          text="Sign Up"
          textStyles={styles.outlineButtonSignUpText}
          buttonStyles={styles.outlineButton}
        />
      </View>
      <View style={styles.borderContainer}>
        <View style={styles.orBorder} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.orBorder} />
      </View>
      <View style={[styles.buttonContainer, styles.mt14]}>
        <Button
          text="Sign in with Google"
          textStyles={styles.outlineButtonText}
          buttonStyles={styles.iconButtonStyle}
          component={<AntDesign name="google" size={scale(20)} />}
          onPress={handleGoogleLogin}
        />
      </View>
      <View style={styles.haveAccountContainer}>
        <Text style={styles.dontHaveText}>
          Don't have an account ? {"\t"}
          <Text onPress={() => navigate("SignUpScreen")} style={styles.signUpLinkText}>
            Sign Up
          </Text>
        </Text>
      </View>
      {renderMarginBottom(26)}
    </ScrollView>
  )
}

export default SignInScreen

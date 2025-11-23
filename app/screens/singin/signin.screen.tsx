"use client"

import { useState, useEffect } from "react"
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
import { validateEmail, validatePassword } from "./signin.validation"

const SignInScreen = () => {
  const styles = createStyles()
  const { isSecure, setIsSecure } = useSignin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [showGoogleHint, setShowGoogleHint] = useState(false)
  const { login, loginWithGoogle, user, refreshUser } = useAuth()

  // Watch for user changes after login and navigate accordingly
  useEffect(() => {
    console.log("=== Navigation useEffect triggered ===")
    console.log("justLoggedIn:", justLoggedIn)
    console.log("user:", user ? `${user.name} (${user.role})` : "null")

    if (justLoggedIn && user) {
      console.log("=== User logged in, navigating based on role ===")
      console.log("User:", JSON.stringify(user, null, 2))
      console.log("Role:", user.role)
      console.log("RoleId:", user.roleId)

      const { navigationRef } = require("../../navigators/navigation-utilities")
      console.log("navigationRef exists:", !!navigationRef)
      console.log("navigationRef.isReady:", navigationRef?.isReady?.())

      if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
        // Check role - handle both string comparison and case-insensitive
        const userRole = user.role?.toLowerCase()
        console.log("Checking user role:", { original: user.role, lowercase: userRole, roleId: user.roleId })

        if (userRole === "staff" || user.roleId === 1002) {
          console.log("✅ Navigating to staffStack for staff user")
          navigationRef.reset({
            index: 0,
            routes: [{ name: "staffStack" }],
          })
        } else {
          console.log("✅ Navigating to tabStack for", user.role, "user")
          navigationRef.reset({
            index: 0,
            routes: [{ name: "tabStack" }],
          })
        }
      } else {
        console.log("❌ navigationRef not ready, cannot navigate")
      }
      setJustLoggedIn(false)
    }
  }, [user, justLoggedIn])

  const handleLogin = async () => {
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      Alert.alert("Invalid Email", emailValidation.error || "Please enter a valid email")
      return
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      Alert.alert("Invalid Password", passwordValidation.error || "Please enter a valid password")
      return
    }

    setIsLoading(true)
    // eslint-disable-next-line no-console
    console.log("mobile sign in attempt", email, password)
    try {
      const success = await login(email, password)
      // eslint-disable-next-line no-console
      console.log("mobile login result success", success)
      if (success) {
        // Wait a bit for auth context to update
        await new Promise(resolve => setTimeout(resolve, 200))

        // Get current user from localStorage
        const { authService } = require("../../../lib/api")
        const currentUser = authService.getCurrentUser()
        console.log("Current user after login:", currentUser)

        if (currentUser) {
          const userRole = currentUser.role?.toLowerCase()
          const isStaff = userRole === "staff" || currentUser.roleId === 1002

          console.log("Immediate role check:", {
            role: currentUser.role,
            roleId: currentUser.roleId,
            isStaff
          })

          // Navigate immediately based on role
          const { navigationRef } = require("../../navigators/navigation-utilities")
          if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
            if (isStaff) {
              console.log("✅ IMMEDIATE NAVIGATION to staffStack")
              navigationRef.reset({
                index: 0,
                routes: [{ name: "staffStack" }],
              })
            } else {
              console.log("✅ IMMEDIATE NAVIGATION to tabStack")
              navigationRef.reset({
                index: 0,
                routes: [{ name: "tabStack" }],
              })
            }
          } else {
            // Fallback to useEffect method
            console.log("navigationRef not ready, using useEffect method")
            setJustLoggedIn(true)
          }
        } else {
          // Fallback to useEffect method
          console.log("No current user from localStorage, using useEffect method")
          setJustLoggedIn(true)
        }
      } else {
        // visible feedback on failure
        Alert.alert(
          "Login Failed",
          "Unable to sign in. This could be due to:\n\n• Invalid email or password\n• Server is starting up (try again in a moment)\n• Network connection issue",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Try Again", onPress: () => handleLogin() }
          ]
        )
      }
    } catch (err: any) {
      // network or unexpected error
      // eslint-disable-next-line no-console
      console.log("login exception", err)

      const isTimeout = err?.message?.includes("timeout") || err?.message?.includes("Timeout")
      const message = isTimeout
        ? "The server is taking too long to respond. It may be starting up. Please try again in a moment."
        : err?.message || "Something went wrong"

      Alert.alert(
        "Login Error",
        message,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: () => handleLogin() }
        ]
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log("=== Opening Google OAuth Handler ===")
    setShowGoogleHint(false)

    // Navigate to OAuth handler screen
    navigate("GoogleOAuthHandler")

    // Check login status when user comes back
    setTimeout(() => {
      refreshUser()
      const { authService } = require("../../../lib/api")
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        console.log("✅ User logged in via Google OAuth Handler")
        setJustLoggedIn(true)
      }
    }, 1000)
  }

  const handleCheckLoginStatus = (showAlert: boolean = true) => {
    console.log("Checking login status...")
    refreshUser()

    // Check if user is now logged in
    const { authService } = require("../../../lib/api")
    const currentUser = authService.getCurrentUser()

    if (currentUser) {
      console.log("✅ User found after refresh:", currentUser.email)
      setJustLoggedIn(true)
      setShowGoogleHint(false)
    } else if (showAlert) {
      Alert.alert(
        "Not Logged In Yet",
        "Please make sure you:\n1. Completed Google login in the browser\n2. Closed the browser\n\nThen tap 'Check Login Status' again.",
        [{ text: "OK" }]
      )
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
        <Text
          onPress={() => navigate("ResetScreen")}
          style={styles.forgotPasswordText}>
          Forgot Password
        </Text>
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

      {showGoogleHint && (
        <View style={[styles.buttonContainer, { marginTop: scale(12) }]}>
          <View style={{
            backgroundColor: '#FFF3CD',
            padding: scale(12),
            borderRadius: scale(8),
            marginBottom: scale(8)
          }}>
            <Text style={{
              fontSize: scale(12),
              color: '#856404',
              textAlign: 'center'
            }}>
              ℹ️ After completing Google login, close the browser and tap below
            </Text>
          </View>
          <Button
            text="Check Login Status"
            textStyles={styles.outlineButtonText}
            buttonStyles={styles.outlineButton}
            onPress={() => handleCheckLoginStatus(true)}
          />
        </View>
      )}
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

"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, Alert, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { bookingsService, carsService, type Car } from "../../../lib/api"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import getAsset from "../../../lib/getAsset"
import Header from "../../components/Header/Header"
import { useAuth } from "../../../lib/auth-context"

export default function BookingFormScreen({ route }: any) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { user } = useAuth()
  const carId = route?.params?.id
  const [car, setCar] = useState<Car | null>(null)
  const [carLoading, setCarLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCar = async () => {
      if (!carId) return
      setCarLoading(true)
      const { data } = await carsService.getCarById(carId)
      if (data) setCar(data)
      setCarLoading(false)
    }
    fetchCar()
  }, [carId])

  // Billing Info - Auto-fill from user profile
  const [name, setName] = useState(user?.name || "")
  const [address, setAddress] = useState(user?.address || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [city, setCity] = useState("")

  // Auto-fill user data when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setAddress(user.address || "")
      setPhone(user.phone || "")
    }
  }, [user])

  // Rental Info - Get from route params or use empty defaults
  const [pickupLocation, setPickupLocation] = useState(route?.params?.pickupLocation || "")
  const [pickupDate, setPickupDate] = useState(route?.params?.pickupDate || "")
  const [pickupTime, setPickupTime] = useState(route?.params?.pickupTime || "")
  const [dropoffLocation, setDropoffLocation] = useState(route?.params?.dropoffLocation || "")
  const [dropoffDate, setDropoffDate] = useState(route?.params?.dropoffDate || "")
  const [dropoffTime, setDropoffTime] = useState(route?.params?.dropoffTime || "")

  // Format error states
  const [pickupDateError, setPickupDateError] = useState("")
  const [pickupTimeError, setPickupTimeError] = useState("")
  const [dropoffDateError, setDropoffDateError] = useState("")
  const [dropoffTimeError, setDropoffTimeError] = useState("")

  // Promo code
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("cash")

  // Confirmation checkboxes
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const subtotal = car ? car.price * 1 : 0 // 1 day rental
  const tax = 0
  const total = subtotal + tax - discount

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "save10") {
      setDiscount(subtotal * 0.1)
      Alert.alert("Success", "10% discount applied!")
    } else {
      Alert.alert("Invalid", "Promo code not found")
    }
  }

  // Real-time format validation helpers
  const validateDateFormat = (date: string): string => {
    if (!date) return ""
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return "Format phải là YYYY-MM-DD (ví dụ: 2025-11-23)"
    }
    // Check if it's a valid date
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "Ngày không hợp lệ"
    }
    return ""
  }

  const validateTimeFormat = (time: string): string => {
    if (!time) return ""
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return "Format phải là HH:MM (ví dụ: 14:30)"
    }
    return ""
  }

  // Handle input changes with validation
  const handlePickupDateChange = (text: string) => {
    setPickupDate(text)
    setPickupDateError(validateDateFormat(text))
  }

  const handlePickupTimeChange = (text: string) => {
    setPickupTime(text)
    setPickupTimeError(validateTimeFormat(text))
  }

  const handleDropoffDateChange = (text: string) => {
    setDropoffDate(text)
    setDropoffDateError(validateDateFormat(text))
  }

  const handleDropoffTimeChange = (text: string) => {
    setDropoffTime(text)
    setDropoffTimeError(validateTimeFormat(text))
  }

  const validateDateTime = (date: string, time: string, fieldName: string): Date | null => {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      Alert.alert("Error", `${fieldName} date must be in format YYYY-MM-DD (e.g., 2025-11-23)`)
      return null
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      Alert.alert("Error", `${fieldName} time must be in format HH:MM (e.g., 14:30)`)
      return null
    }

    // Create datetime and validate
    const dateTime = new Date(`${date}T${time}:00`)
    if (isNaN(dateTime.getTime())) {
      Alert.alert("Error", `Invalid ${fieldName} date or time`)
      return null
    }

    return dateTime
  }

  const validateUUID = (id: string, fieldName: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      Alert.alert("Error", `Invalid ${fieldName}. Please try again.`)
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate billing info
      if (!name.trim()) {
        Alert.alert("Error", "Please enter your name")
        return
      }
      if (!address.trim()) {
        Alert.alert("Error", "Please enter your address")
        return
      }
      if (!phone.trim()) {
        Alert.alert("Error", "Please enter your phone number")
        return
      }
      // Validate phone format (basic validation)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(phone)) {
        Alert.alert("Error", "Please enter a valid phone number")
        return
      }
      if (!city.trim()) {
        Alert.alert("Error", "Please enter your city")
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Validate rental info
      if (!pickupLocation.trim()) {
        Alert.alert("Error", "Please enter pick-up location")
        return
      }
      if (!pickupDate.trim()) {
        Alert.alert("Error", "Please enter pick-up date")
        return
      }
      if (!pickupTime.trim()) {
        Alert.alert("Error", "Please enter pick-up time")
        return
      }
      if (!dropoffLocation.trim()) {
        Alert.alert("Error", "Please enter drop-off location")
        return
      }
      if (!dropoffDate.trim()) {
        Alert.alert("Error", "Please enter drop-off date")
        return
      }
      if (!dropoffTime.trim()) {
        Alert.alert("Error", "Please enter drop-off time")
        return
      }

      // Validate pickup datetime
      const pickupDateTime = validateDateTime(pickupDate, pickupTime, "Pick-up")
      if (!pickupDateTime) return

      // Validate dropoff datetime
      const dropoffDateTime = validateDateTime(dropoffDate, dropoffTime, "Drop-off")
      if (!dropoffDateTime) return

      // Check if pickup is in the past
      const now = new Date()
      if (pickupDateTime < now) {
        Alert.alert("Error", "Pick-up date and time cannot be in the past")
        return
      }

      // Check if dropoff is after pickup
      if (dropoffDateTime <= pickupDateTime) {
        Alert.alert("Error", "Drop-off date and time must be after pick-up date and time")
        return
      }

      // Check minimum rental duration (at least 1 hour)
      const durationHours = (dropoffDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60)
      if (durationHours < 1) {
        Alert.alert("Error", "Minimum rental duration is 1 hour")
        return
      }

      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Validate payment method
      if (!paymentMethod) {
        Alert.alert("Error", "Please select a payment method")
        return
      }
      setCurrentStep(4)
    } else if (currentStep === 4) {
      // Validate confirmation
      if (!agreeMarketing) {
        Alert.alert("Error", "Please agree to marketing terms")
        return
      }
      if (!agreeTerms) {
        Alert.alert("Error", "Please agree to terms and conditions")
        return
      }
      handleCreate()
    }
  }

  const handleCreate = async () => {
    // Validate user ID
    if (!user?.id) {
      Alert.alert("Error", "Please login to create a booking")
      return
    }
    if (!validateUUID(user.id, "User ID")) {
      return
    }

    // Validate car ID
    if (!carId) {
      Alert.alert("Error", "Car not found")
      return
    }
    if (!validateUUID(carId, "Car ID")) {
      return
    }

    setLoading(true)
    try {
      // Validate and create pickup datetime
      const pickupDateTime = validateDateTime(pickupDate, pickupTime, "Pick-up")
      if (!pickupDateTime) {
        setLoading(false)
        return
      }

      // Validate and create dropoff datetime
      const dropoffDateTime = validateDateTime(dropoffDate, dropoffTime, "Drop-off")
      if (!dropoffDateTime) {
        setLoading(false)
        return
      }

      // Validate pickup location
      if (!pickupLocation.trim()) {
        Alert.alert("Error", "Pick-up location is required")
        setLoading(false)
        return
      }

      // Validate dropoff location
      if (!dropoffLocation.trim()) {
        Alert.alert("Error", "Drop-off location is required")
        setLoading(false)
        return
      }

      // Calculate rental duration in days (minimum 1 day)
      const durationMs = dropoffDateTime.getTime() - pickupDateTime.getTime()
      const rentime = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)))

      // Validate car price
      const carRentPrice = car?.price || 0
      if (carRentPrice <= 0) {
        Alert.alert("Error", "Invalid car rental price")
        setLoading(false)
        return
      }

      // Validate rent type
      const rentType = "daily"
      if (!rentType || rentType.trim() === "") {
        Alert.alert("Error", "Rent type is required")
        setLoading(false)
        return
      }

      const bookingData = {
        customerId: user.id,
        carId: carId,
        pickupPlace: pickupLocation.trim(),
        pickupTime: pickupDateTime.toISOString(),
        dropoffPlace: dropoffLocation.trim(),
        dropoffTime: dropoffDateTime.toISOString(),
        bookingFee: 0,
        carRentPrice: carRentPrice,
        rentime: rentime,
        rentType: rentType,
      }

      console.log("Creating booking with data:", bookingData)

      const res = await bookingsService.createBooking(bookingData)

      if (res.error) {
        console.error("Booking creation error:", res.error)
        Alert.alert("Error", res.error?.message || "Failed to create booking")
        return
      }

      if (res.data) {
        const bookingId = res.data.id
        Alert.alert("Success", "Booking created successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("BookingDetail" as any, { id: bookingId })
          }
        ])
      }
    } catch (e: any) {
      console.error("Booking creation exception:", e)
      Alert.alert("Error", e.message || "Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  if (carLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  if (!car) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Car not found</Text>
        </View>
      </View>
    )
  }

  const carImage = getAsset(car.image)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >

          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>Rental Summary</Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.placeholder,
                marginBottom: 12,
              }}
            >
              Prices may change depending on the length of the rental and the price of your rental car.
            </Text>

            {/* Car Card */}
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              {carImage && (
                <Image
                  source={carImage}
                  style={{
                    width: "100%",
                    height: 120,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
              )}
              <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 4 }}>{car.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", marginRight: 4 }}>★ {car.rating}</Text>
                <Text style={{ fontSize: 12, color: colors.placeholder }}>{car.reviews}+ Reviewer</Text>
              </View>

              {/* Pricing */}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.placeholder }}>Subtotal</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>${subtotal.toFixed(2)}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.placeholder }}>Tax</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>${tax.toFixed(2)}</Text>
                </View>

                {/* Promo Code */}
                <View style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    <TextInput
                      placeholder="Apply promo code"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        fontSize: 12,
                        color: colors.morentBlue,
                      }}
                    />
                    <Pressable
                      onPress={handleApplyPromo}
                      style={{
                        backgroundColor: colors.morentBlue,
                        paddingHorizontal: 16,
                        borderRadius: 6,
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: colors.white, fontSize: 12, fontWeight: "600" }}>Apply now</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Total */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "700" }}>Total Rental Price</Text>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.morentBlue }}>${total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.placeholder }}>Step {currentStep} of 4</Text>
          </View>

          {currentStep === 1 && (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Billing Info</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.placeholder,
                  marginBottom: 16,
                }}
              >
                Please enter your billing info
              </Text>

              <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                {/* Name */}
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Name</Text>
                <TextInput
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 16,
                    fontSize: 12,
                  }}
                />

                {/* Address */}
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Address</Text>
                <TextInput
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 16,
                    fontSize: 12,
                  }}
                />

                {/* Phone Number */}
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Phone Number</Text>
                <TextInput
                  placeholder="Phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 16,
                    fontSize: 12,
                  }}
                />

                {/* Town/City */}
                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Town/City</Text>
                <TextInput
                  placeholder="Town or city"
                  value={city}
                  onChangeText={setCity}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 12,
                  }}
                />
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Rental Info</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.placeholder,
                  marginBottom: 16,
                }}
              >
                Please select your rental date
              </Text>

              <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                {/* Pick-Up */}
                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 Pick - Up</Text>

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Locations</Text>
                <TextInput
                  placeholder="Select your city"
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 12,
                    fontSize: 12,
                  }}
                />

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD (e.g., 2025-11-23)"
                  value={pickupDate}
                  onChangeText={handlePickupDateChange}
                  style={{
                    borderWidth: 1,
                    borderColor: pickupDateError ? "#ef4444" : colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: pickupDateError ? 4 : 12,
                    fontSize: 12,
                  }}
                />
                {pickupDateError ? (
                  <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
                    ⚠️ {pickupDateError}
                  </Text>
                ) : null}

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Time</Text>
                <TextInput
                  placeholder="HH:MM (e.g., 14:30)"
                  value={pickupTime}
                  onChangeText={handlePickupTimeChange}
                  style={{
                    borderWidth: 1,
                    borderColor: pickupTimeError ? "#ef4444" : colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: pickupTimeError ? 4 : 16,
                    fontSize: 12,
                  }}
                />
                {pickupTimeError ? (
                  <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 16 }}>
                    ⚠️ {pickupTimeError}
                  </Text>
                ) : null}

                {/* Drop-Off */}
                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 12 }}>🔵 Drop - Off</Text>

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Locations</Text>
                <TextInput
                  placeholder="Select your city"
                  value={dropoffLocation}
                  onChangeText={setDropoffLocation}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 12,
                    fontSize: 12,
                  }}
                />

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD (e.g., 2025-11-23)"
                  value={dropoffDate}
                  onChangeText={handleDropoffDateChange}
                  style={{
                    borderWidth: 1,
                    borderColor: dropoffDateError ? "#ef4444" : colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: dropoffDateError ? 4 : 12,
                    fontSize: 12,
                  }}
                />
                {dropoffDateError ? (
                  <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
                    ⚠️ {dropoffDateError}
                  </Text>
                ) : null}

                <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Time</Text>
                <TextInput
                  placeholder="HH:MM (e.g., 14:30)"
                  value={dropoffTime}
                  onChangeText={handleDropoffTimeChange}
                  style={{
                    borderWidth: 1,
                    borderColor: dropoffTimeError ? "#ef4444" : colors.border,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: dropoffTimeError ? 4 : 0,
                    fontSize: 12,
                  }}
                />
                {dropoffTimeError ? (
                  <Text style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                    ⚠️ {dropoffTimeError}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Payment Method</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.placeholder,
                  marginBottom: 16,
                }}
              >
                Please enter your payment method
              </Text>

              <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12 }}>
                {/* Cash Option */}
                <Pressable
                  onPress={() => setPaymentMethod("cash")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: paymentMethod === "cash" ? colors.morentBlue : colors.border,
                      marginRight: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {paymentMethod === "cash" && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: colors.morentBlue,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>Cash</Text>
                    <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>
                      Pay with cash on pickup
                    </Text>
                  </View>
                </Pressable>

                {/* QR PayOS Option */}
                <Pressable
                  onPress={() => setPaymentMethod("qr-payos")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: paymentMethod === "qr-payos" ? colors.morentBlue : colors.border,
                      marginRight: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {paymentMethod === "qr-payos" && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: colors.morentBlue,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600" }}>QR PayOS</Text>
                    <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>
                      Scan QR code to pay
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {currentStep === 4 && (
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Confirmation</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.placeholder,
                  marginBottom: 16,
                }}
              >
                We are getting to the end. Just few clicks and your rental is ready!
              </Text>

              <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                {/* Marketing Checkbox */}
                <Pressable
                  onPress={() => setAgreeMarketing(!agreeMarketing)}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 4,
                      marginRight: 12,
                      marginTop: 2,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: agreeMarketing ? colors.morentBlue : colors.white,
                    }}
                  >
                    {agreeMarketing && <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>}
                  </View>
                  <Text style={{ fontSize: 12, flex: 1, color: colors.primary }}>
                    I agree with sending an Marketing and newsletter emails. No spam, promised!
                  </Text>
                </Pressable>

                {/* Terms Checkbox */}
                <Pressable
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 4,
                      marginRight: 12,
                      marginTop: 2,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: agreeTerms ? colors.morentBlue : colors.white,
                    }}
                  >
                    {agreeTerms && <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>}
                  </View>
                  <Text style={{ fontSize: 12, flex: 1, color: colors.primary }}>
                    I agree with our terms and conditions and privacy policy!
                  </Text>
                </Pressable>
              </View>

              {/* Security Message */}
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 4 }}>🛡️ All your data are safe</Text>
                <Text style={{ fontSize: 12, color: colors.placeholder, textAlign: "center" }}>
                  We are using the most advanced security to provide you the best experience ever.
                </Text>
              </View>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingHorizontal: 16,
              paddingTop: 24,
            }}
          >
            {currentStep > 1 && (
              <Pressable
                onPress={() => setCurrentStep(currentStep - 1)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.morentBlue,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.morentBlue, fontWeight: "600" }}>Back</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleNextStep}
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: colors.morentBlue,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={{ color: colors.white, fontWeight: "600" }}>{currentStep === 4 ? "Rental Now" : "Next"}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

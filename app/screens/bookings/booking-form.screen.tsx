"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, Alert, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { bookingsService, carsService, userService, type Car } from "../../../lib/api"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import getAsset from "../../../lib/getAsset"
import Header from "../../components/Header/Header"
import { useAuth } from "../../../lib/auth-context"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

export default function BookingFormScreen({ route }: any) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { user } = useAuth()
  const carId = route?.params?.id
  const [car, setCar] = useState<Car | null>(null)
  const [carLoading, setCarLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Billing Info state
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!carId) return
      setCarLoading(true)

      // Fetch car details
      const { data } = await carsService.getCarById(carId)
      if (data) setCar(data)

      // Fetch and set user billing info
      if (user?.id) {
        try {
          const userResult = await userService.getUserById(user.id)
          if (userResult.data) {
            const userData = userResult.data

            // Set billing info from API
            setName(userData.fullname || userData.username || user.name || "")
            setAddress(userData.address || "")
            setPhone(userData.phoneNumber || user.phone || "")

            // Extract city from address
            if (userData.address) {
              const addressParts = userData.address.split(',')
              if (addressParts.length > 0) {
                setCity(addressParts[addressParts.length - 1].trim())
              }
            }
          } else {
            // Fallback to auth context data if API fails
            setName(user.username || user.name || "")
            setAddress(user.address || "")
            setPhone(user.phone || "")

            if (user.address) {
              const addressParts = user.address.split(',')
              if (addressParts.length > 0) {
                setCity(addressParts[addressParts.length - 1].trim())
              }
            }
          }
        } catch (err) {
          console.log("Could not fetch user profile, using auth context data")
          // Fallback to auth context data
          setName(user.username || user.name || "")
          setAddress(user.address || "")
          setPhone(user.phone || "")

          if (user.address) {
            const addressParts = user.address.split(',')
            if (addressParts.length > 0) {
              setCity(addressParts[addressParts.length - 1].trim())
            }
          }
        }
      }

      setCarLoading(false)
    }
    fetchData()
  }, [carId, user?.id])


  const [pickupLocation, setPickupLocation] = useState(route?.params?.pickupLocation || "")
  const [pickupDate, setPickupDate] = useState(route?.params?.pickupDate || "")
  const [pickupTime, setPickupTime] = useState(route?.params?.pickupTime || "")
  const [dropoffLocation, setDropoffLocation] = useState(route?.params?.dropoffLocation || "")
  const [dropoffDate, setDropoffDate] = useState(route?.params?.dropoffDate || "")
  const [dropoffTime, setDropoffTime] = useState(route?.params?.dropoffTime || "")


  const [pickupDateError, setPickupDateError] = useState("")
  const [pickupTimeError, setPickupTimeError] = useState("")
  const [dropoffDateError, setDropoffDateError] = useState("")
  const [dropoffTimeError, setDropoffTimeError] = useState("")


  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)


  const [paymentMethod, setPaymentMethod] = useState("cash")


  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const subtotal = car ? car.price * 1 : 0
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


  const validateDateFormat = (date: string): string => {
    if (!date) return ""
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return "Format phải là YYYY-MM-DD (ví dụ: 2025-11-23)"
    }

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

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      Alert.alert("Error", `${fieldName} date must be in format YYYY-MM-DD (e.g., 2025-11-23)`)
      return null
    }


    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      Alert.alert("Error", `${fieldName} time must be in format HH:MM (e.g., 14:30)`)
      return null
    }


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


      const pickupDateTime = validateDateTime(pickupDate, pickupTime, "Pick-up")
      if (!pickupDateTime) return


      const dropoffDateTime = validateDateTime(dropoffDate, dropoffTime, "Drop-off")
      if (!dropoffDateTime) return


      const now = new Date()
      if (pickupDateTime < now) {
        Alert.alert("Error", "Pick-up date and time cannot be in the past")
        return
      }


      if (dropoffDateTime <= pickupDateTime) {
        Alert.alert("Error", "Drop-off date and time must be after pick-up date and time")
        return
      }


      const durationHours = (dropoffDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60)
      if (durationHours < 1) {
        Alert.alert("Error", "Minimum rental duration is 1 hour")
        return
      }

      setCurrentStep(3)
    } else if (currentStep === 3) {

      if (!paymentMethod) {
        Alert.alert("Error", "Please select a payment method")
        return
      }
      setCurrentStep(4)
    } else if (currentStep === 4) {

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

    if (!user?.id) {
      Alert.alert("Error", "Please login to create a booking")
      return
    }
    if (!validateUUID(user.id, "User ID")) {
      return
    }


    if (!carId) {
      Alert.alert("Error", "Car not found")
      return
    }
    if (!validateUUID(carId, "Car ID")) {
      return
    }

    setLoading(true)
    try {

      const pickupDateTime = validateDateTime(pickupDate, pickupTime, "Pick-up")
      if (!pickupDateTime) {
        setLoading(false)
        return
      }


      const dropoffDateTime = validateDateTime(dropoffDate, dropoffTime, "Drop-off")
      if (!dropoffDateTime) {
        setLoading(false)
        return
      }


      if (!pickupLocation.trim()) {
        Alert.alert("Error", "Pick-up location is required")
        setLoading(false)
        return
      }


      if (!dropoffLocation.trim()) {
        Alert.alert("Error", "Drop-off location is required")
        setLoading(false)
        return
      }


      // Calculate rental duration in days
      const durationMs = dropoffDateTime.getTime() - pickupDateTime.getTime()
      const rentime = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)))

      // Get car price and validate
      const carPrice = car?.price || 0
      if (carPrice <= 0) {
        Alert.alert("Error", "Invalid car rental price")
        setLoading(false)
        return
      }

      // Convert price to integer (remove decimals if any)
      const carRentPrice = Math.floor(carPrice)

      const rentType = "daily"

      // Build booking data matching API format
      const bookingData = {
        customerId: user.id,
        carId: carId,
        pickupPlace: pickupLocation.trim(),
        pickupTime: pickupDateTime.toISOString(),
        dropoffPlace: dropoffLocation.trim(),
        dropoffTime: dropoffDateTime.toISOString(),
        bookingFee: 15, // Fixed booking fee
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
        // Extract booking ID and payment URL from response
        const bookingResponse = res.data
        let createdBookingId: string | null = null
        let payosUrl: string | null = null

        console.log("=== BOOKING RESPONSE DEBUG ===")
        console.log("Response data:", JSON.stringify(bookingResponse, null, 2))
        console.log("Response data type:", typeof bookingResponse)

        // Handle different response formats
        if (typeof bookingResponse === 'string') {
          // Response is a PayOS URL string
          payosUrl = bookingResponse
          console.log("Response is PayOS URL string:", payosUrl)
        } else if (typeof bookingResponse === 'object' && bookingResponse !== null) {
          // Response is an object - extract bookingId and paymentUrl
          // Check for nested structure: { payment: "url", booking: { id: "..." } }
          if (bookingResponse.payment) {
            payosUrl = bookingResponse.payment
          }
          if (bookingResponse.booking && bookingResponse.booking.id) {
            createdBookingId = bookingResponse.booking.id
          }

          // Fallback to flat structure
          if (!createdBookingId) {
            createdBookingId = bookingResponse.bookingId || bookingResponse.id || null
          }
          if (!payosUrl) {
            payosUrl = bookingResponse.paymentUrl || bookingResponse.checkoutUrl || null
          }

          console.log("Extracted from response object:")
          console.log("- Booking ID:", createdBookingId)
          console.log("- PayOS URL:", payosUrl)
        }

        console.log("Payment method:", paymentMethod)

        // Check if user selected QR PayOS payment
        if (paymentMethod === "qr-payos") {
          // Open PayOS payment URL in WebView
          console.log("✅ Opening PayOS WebView with URL:", payosUrl)
          navigation.navigate("PayOSWebView" as any, {
            paymentUrl: payosUrl,
            bookingId: createdBookingId || "pending"
          })
        } else {
          // Cash payment - show confirmation popup
          console.log("💵 Cash payment - showing confirmation")
          Alert.alert(
            "Confirm Cash Payment",
            "Your booking has been created. You will pay cash when picking up the car.\n\nPlease confirm to complete the booking.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: async () => {
                  console.log("❌ User cancelled cash payment confirmation")

                  // Update booking status to cancelled
                  if (createdBookingId) {
                    try {
                      console.log("Updating booking status to cancelled:", createdBookingId)
                      const { error: updateError } = await bookingsService.updateBookingStatus(createdBookingId, "cancelled")
                      if (updateError) {
                        console.error("Failed to update booking status to cancelled:", updateError)
                        Alert.alert("Error", "Failed to cancel booking. Please try again.")
                      } else {
                        console.log("✓ Booking status updated to cancelled")
                        Alert.alert("Booking Cancelled", "Your booking has been cancelled.")
                      }
                    } catch (err) {
                      console.error("Exception updating booking status to cancelled:", err)
                      Alert.alert("Error", "Failed to cancel booking. Please try again.")
                    }
                  } else {
                    Alert.alert("Booking Cancelled", "Your booking has been cancelled.")
                  }

                  // Stay on current screen so user can modify and try again
                }
              },
              {
                text: "Confirm",
                onPress: async () => {
                  console.log("✅ User confirmed cash payment")

                  // Update booking status to confirmed
                  if (createdBookingId) {
                    try {
                      console.log("Updating booking status to confirmed:", createdBookingId)
                      const { error: updateError } = await bookingsService.updateBookingStatus(createdBookingId, "confirmed")
                      if (updateError) {
                        console.error("Failed to update booking status to confirmed:", updateError)
                        Alert.alert("Error", "Failed to confirm booking. Please try again.")
                        return
                      } else {
                        console.log("✓ Booking status updated to confirmed")
                      }
                    } catch (err) {
                      console.error("Exception updating booking status to confirmed:", err)
                      Alert.alert("Error", "Failed to confirm booking. Please try again.")
                      return
                    }
                  }

                  // Navigate to main tab stack (home screen)
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "tabStack" as any }],
                  })

                  // Show success message after navigation
                  setTimeout(() => {
                    Alert.alert(
                      "Booking Confirmed",
                      "Your booking has been confirmed! Please bring cash when picking up the car."
                    )
                  }, 500)
                }
              }
            ]
          )
        }
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

  // Get car image - prioritize imageUrls from API, then images, then image property
  const getCarImageSource = () => {
    // First check imageUrls from API
    if (car.imageUrls && car.imageUrls.length > 0) {
      return { uri: car.imageUrls[0] }
    }
    // Then check images array
    if (car.images && car.images.length > 0) {
      return { uri: car.images[0] }
    }
    // Then check image property
    if (car.image) {
      // Check if it's a URL
      if (car.image.startsWith('http://') || car.image.startsWith('https://')) {
        return { uri: car.image }
      }
      // Try to get local asset
      const localAsset = getAsset(car.image)
      if (localAsset) {
        return localAsset
      }
    }
    return null
  }

  const carImageSource = getCarImageSource()

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
              {carImageSource ? (
                <Image
                  source={carImageSource}
                  style={{
                    width: "100%",
                    height: 120,
                    borderRadius: 8,
                    marginBottom: 12,
                    backgroundColor: colors.background,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 120,
                    borderRadius: 8,
                    marginBottom: 12,
                    backgroundColor: colors.background,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name="directions-car" size={48} color={colors.placeholder} />
                  <Text style={{ fontSize: 12, color: colors.placeholder, marginTop: 8 }}>
                    No image available
                  </Text>
                </View>
              )}
              <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 4 }}>{car.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", marginRight: 4 }}>★ {car.rating}</Text>
                <Text style={{ fontSize: 12, color: colors.placeholder }}>{car.reviews}+ Reviewer</Text>
              </View>

              {/* Car Category & Brand */}
              <Text style={{ fontSize: 11, color: colors.placeholder, marginBottom: 12 }}>
                {car.brand} • {car.category} • {car.year}
              </Text>

              {/* Car Specifications */}
              <View style={{
                flexDirection: "row",
                justifyContent: "space-around",
                paddingVertical: 12,
                backgroundColor: colors.background,
                borderRadius: 6,
                marginBottom: 12
              }}>
                <View style={{ alignItems: "center" }}>
                  <MaterialIcons name="local-gas-station" size={16} color={colors.placeholder} />
                  <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Fuel</Text>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 }}>
                    {car.fuelType}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <MaterialIcons name="settings" size={16} color={colors.placeholder} />
                  <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Transmission</Text>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 }}>
                    {car.transmission}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <MaterialIcons name="people" size={16} color={colors.placeholder} />
                  <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Capacity</Text>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 }}>
                    {car.seats} People
                  </Text>
                </View>
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
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>{subtotal.toFixed(0)} VND</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.placeholder }}>Tax</Text>
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>{tax.toFixed(0)} VND</Text>
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
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.morentBlue }}>{total.toFixed(0)} VND</Text>
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

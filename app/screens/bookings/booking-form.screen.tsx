"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, Alert, ScrollView, Image, ActivityIndicator } from "react-native"
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

  // Rental Info
  const [pickupLocation, setPickupLocation] = useState("Semarang")
  const [pickupDate, setPickupDate] = useState("20 July 2022")
  const [pickupTime, setPickupTime] = useState("07.00")
  const [dropoffLocation, setDropoffLocation] = useState("Semarang")
  const [dropoffDate, setDropoffDate] = useState("21 July 2022")
  const [dropoffTime, setDropoffTime] = useState("01.00")

  // Promo code
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [cvc, setCvc] = useState("")

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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name || !address || !phone || !city) {
        Alert.alert("Error", "Please fill in all billing information")
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      if (paymentMethod === "credit-card") {
        if (!cardNumber || !cardHolder || !expirationDate || !cvc) {
          Alert.alert("Error", "Please fill in all card details")
          return
        }
      }
      setCurrentStep(4)
    } else if (currentStep === 4) {
      if (!agreeMarketing || !agreeTerms) {
        Alert.alert("Error", "Please agree to all terms and conditions")
        return
      }
      handleCreate()
    }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await bookingsService.createBooking({
        carId,
        startDate: pickupDate,
        endDate: dropoffDate,
        pickupLocation,
        dropoffLocation,
        driverInfo: {
          name,
          email: "guest@example.com",
          phone,
          licenseNumber: "N/A",
        },
        paymentMethod,
        cardNumber,
        cardHolder,
        expirationDate,
        cvc,
      } as any)
      if (res.data) {
        navigation.navigate("BookingDetail" as any, { id: res.data.id })
      } else {
        Alert.alert("Error", res.error?.message || "Failed to create booking")
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed")
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24,
        }}
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

              <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Time</Text>
              <TextInput
                placeholder="Select your time"
                value={pickupTime}
                onChangeText={setPickupTime}
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
                placeholder="Select your date"
                value={pickupDate}
                onChangeText={setPickupDate}
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

              <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Time</Text>
              <TextInput
                placeholder="Select your time"
                value={dropoffTime}
                onChangeText={setDropoffTime}
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
                placeholder="Select your date"
                value={dropoffDate}
                onChangeText={setDropoffDate}
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
              {/* Credit Card Option */}
              <Pressable
                onPress={() => setPaymentMethod("credit-card")}
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
                    borderColor: colors.morentBlue,
                    marginRight: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {paymentMethod === "credit-card" && (
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
                  <Text style={{ fontSize: 14, fontWeight: "600" }}>Credit Card</Text>
                  <View style={{ flexDirection: "row", marginTop: 4, gap: 8 }}>
                    <Text style={{ fontSize: 10, color: colors.placeholder }}>VISA</Text>
                    <Text style={{ fontSize: 10, color: colors.placeholder }}>Mastercard</Text>
                  </View>
                </View>
              </Pressable>

              {/* Credit Card Form */}
              {paymentMethod === "credit-card" && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Card Number</Text>
                  <TextInput
                    placeholder="Card number"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
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

                  <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Card Holder</Text>
                  <TextInput
                    placeholder="Card holder"
                    value={cardHolder}
                    onChangeText={setCardHolder}
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

                  <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Expiration Date</Text>
                      <TextInput
                        placeholder="DD/MM/YY"
                        value={expirationDate}
                        onChangeText={setExpirationDate}
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
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 6 }}>CVC</Text>
                      <TextInput
                        placeholder="CVC"
                        value={cvc}
                        onChangeText={setCvc}
                        keyboardType="numeric"
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
                </View>
              )}

              {/* PayPal Option */}
              <Pressable
                onPress={() => setPaymentMethod("paypal")}
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
                    borderColor: paymentMethod === "paypal" ? colors.morentBlue : colors.border,
                    marginRight: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {paymentMethod === "paypal" && (
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
                <Text style={{ fontSize: 14, fontWeight: "600" }}>PayPal</Text>
              </Pressable>

              {/* Bitcoin Option */}
              <Pressable
                onPress={() => setPaymentMethod("bitcoin")}
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
                    borderColor: paymentMethod === "bitcoin" ? colors.morentBlue : colors.border,
                    marginRight: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {paymentMethod === "bitcoin" && (
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
                <Text style={{ fontSize: 14, fontWeight: "600" }}>Bitcoin</Text>
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
  )
}

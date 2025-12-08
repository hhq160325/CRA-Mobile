"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView, Pressable, Alert } from "react-native"
import { carsService, reviewsService, type Car, type Review } from "../../../lib/api"
import { userService } from "../../../lib/api/services/user.service"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import type { StackNavigationProp } from "@react-navigation/stack"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { getAsset } from "../../../lib/getAsset"
import Header from "../../components/Header/Header"
import { useAuth } from "../../../lib/auth-context"


import CarImageGallery from "./components/CarImageGallery"
import CarSpecifications from "./components/CarSpecifications"
import CarAmenities from "./components/CarAmenities"
import CarRentalPolicies from "./components/CarRentalPolicies"
import CarReviews from "./components/CarReviews"
import CarDocumentsModal from "./components/CarDocumentsModal"
import CarTermsModal from "./components/CarTermsModal"
import CarRefundModal from "./components/CarRefundModal"

export default function CarDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { user } = useAuth()
  const { id } = (route.params as any) || {}
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [documentsModalVisible, setDocumentsModalVisible] = useState(false)
  const [termsModalVisible, setTermsModalVisible] = useState(false)
  const [refundModalVisible, setRefundModalVisible] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return

      setLoading(true)

      try {
        const [carResult, reviewsResult] = await Promise.all([
          carsService.getCarById(id),
          reviewsService.getCarReviews(id)
        ])

        if (mounted) {
          if (carResult.data) setCar(carResult.data)
          if (reviewsResult.data) setReviews(reviewsResult.data)
        }
      } catch (err) {
        console.error("Error loading car details:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [id, user?.id])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
        </View>
      </View>
    )
  }

  if (!car) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: scale(16), color: colors.placeholder }}>Car not found</Text>
        </View>
      </View>
    )
  }

  const getCarImages = () => {
    if (car.imageUrls && car.imageUrls.length > 0) return car.imageUrls
    if (car.images && car.images.length > 0) return car.images
    return [car.image, car.image, car.image]
  }

  const carImages = getCarImages()

  const getImageSource = (img: string) => {
    if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
      return { uri: img }
    }
    return getAsset(img) || require("../../../assets/tesla-model-s-luxury.png")
  }

  const handleBookNow = async () => {
    if (!user?.id || !user?.email) {
      Alert.alert("Login Required", "Please login to book a car")
      return
    }

    try {

      const { data: licenseData, error: licenseError } = await userService.getDriverLicense(user.id, user.email)

      if (licenseError || !licenseData || !licenseData.urls || licenseData.urls.length === 0) {

        Alert.alert(
          "Driver's License Required",
          "You must upload your driver's license before booking a car. Would you like to upload it now?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Upload Now",
              onPress: () => navigation.navigate("Profile" as any)
            }
          ]
        )
        return
      }

      navigation.navigate("BookingForm" as any, { id: car?.id })
    } catch (error) {
      console.error("Error checking driver's license:", error)
      Alert.alert(
        "Driver's License Required",
        "You must upload your driver's license before booking a car. Would you like to upload it now?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Upload Now",
            onPress: () => navigation.navigate("Profile" as any)
          }
        ]
      )
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: scale(20) }}>
        <CarImageGallery
          carImages={carImages}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={setSelectedImageIndex}
          getImageSource={getImageSource}
        />

        {/* Car Details */}
        <View style={{
          backgroundColor: colors.white,
          padding: scale(16),
          marginHorizontal: scale(16),
          borderRadius: scale(12),
          marginBottom: scale(16)
        }}>
          <Text style={{ fontSize: scale(24), fontWeight: "700", color: colors.primary }}>{car.model}</Text>
          <Text style={{ fontSize: scale(14), color: colors.placeholder, marginTop: scale(4) }}>
            {car.manufacturer} • {car.yearofManufacture}
          </Text>

          <CarSpecifications car={car} />
          <CarAmenities />
          <CarRentalPolicies
            onDocumentsPress={() => setDocumentsModalVisible(true)}
            onTermsPress={() => setTermsModalVisible(true)}
            onRefundPress={() => setRefundModalVisible(true)}
          />

          {/* Description */}
          <Text style={{
            fontSize: scale(16),
            fontWeight: '600',
            color: colors.primary,
            marginTop: scale(20),
            marginBottom: scale(8)
          }}>
            Description
          </Text>
          <Text style={{
            fontSize: scale(14),
            color: colors.placeholder,
            lineHeight: scale(22)
          }}>
            {car.description}
          </Text>

          {/* Deposit Information */}
          <View style={{
            marginTop: scale(20),
            padding: scale(16),
            backgroundColor: colors.background,
            borderRadius: scale(8),
            borderLeftWidth: 4,
            borderLeftColor: colors.morentBlue
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(8) }}>
              <Text style={{ fontSize: scale(16), fontWeight: '600', color: colors.primary }}>
                💰 Deposit Information
              </Text>
            </View>
            <View style={{ marginLeft: scale(4) }}>
              <View style={{ flexDirection: 'row', marginBottom: scale(6) }}>
                <Text style={{ fontSize: scale(14), color: colors.primary, marginRight: scale(4) }}>•</Text>
                <Text style={{ fontSize: scale(14), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                  Mandatory deposit: <Text style={{ fontWeight: '600', color: colors.morentBlue }}>10,000,000 VND</Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: scale(6) }}>
                <Text style={{ fontSize: scale(14), color: colors.primary, marginRight: scale(4) }}>•</Text>
                <Text style={{ fontSize: scale(14), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                  Motorbike deposit not accepted.
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: scale(14), color: colors.primary, marginRight: scale(4) }}>•</Text>
                <Text style={{ fontSize: scale(14), color: colors.primary, flex: 1, lineHeight: scale(20) }}>
                  Deposit will be returned after returning the vehicle 15 days.
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Owner Button */}
          <Pressable
            onPress={() => navigation.navigate("Chat" as any, { carId: car.id })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#E3F2FD',
              paddingVertical: scale(12),
              borderRadius: scale(8),
              marginTop: scale(20),
              borderWidth: 1,
              borderColor: colors.morentBlue
            }}
          >
            <Text style={{ fontSize: scale(20), marginRight: scale(8) }}>💬</Text>
            <Text style={{ color: colors.morentBlue, fontSize: scale(14), fontWeight: "600" }}>
              Contact Car Owner
            </Text>
          </Pressable>

          {/* Price and Book Button */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: scale(16),
            paddingTop: scale(16),
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: scale(12)
          }}>
            {car.price > 0 && (
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Price per day</Text>
                <Text
                  style={{
                    fontSize: scale(18),
                    fontWeight: '700',
                    color: colors.morentBlue,
                    flexWrap: 'wrap'
                  }}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {car.price.toLocaleString()} VND
                </Text>
              </View>
            )}
            <Pressable
              onPress={handleBookNow}
              style={{
                backgroundColor: colors.morentBlue,
                paddingHorizontal: scale(24),
                paddingVertical: scale(12),
                borderRadius: scale(8),
                marginLeft: car.price > 0 ? 0 : 'auto',
                flexShrink: 0
              }}
            >
              <Text style={{ color: colors.white, fontSize: scale(14), fontWeight: "600" }}>Rent Now</Text>
            </Pressable>
          </View>
        </View>

        {/* Customer Reviews Section */}
        <CarReviews
          reviews={reviews}
          onViewAllReviews={() => navigation.navigate("FeedbackList" as any)}
        />
      </ScrollView>

      <CarDocumentsModal visible={documentsModalVisible} onClose={() => setDocumentsModalVisible(false)} />
      <CarTermsModal visible={termsModalVisible} onClose={() => setTermsModalVisible(false)} />
      <CarRefundModal visible={refundModalVisible} onClose={() => setRefundModalVisible(false)} />
    </View>
  )
}

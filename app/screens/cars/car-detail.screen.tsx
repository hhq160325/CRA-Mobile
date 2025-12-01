"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native"
import { carsService, reviewsService, bookingsService, type Car, type Review } from "../../../lib/api"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import type { StackNavigationProp } from "@react-navigation/stack"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { getAsset } from "../../../lib/getAsset"
import Header from "../../components/Header/Header"
import { useAuth } from "../../../lib/auth-context"

// Components
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
  const [hasBookedCar, setHasBookedCar] = useState(false)
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

        if (user?.id && mounted) {
          try {
            const bookingsResult = await bookingsService.getBookings(user.id)
            if (bookingsResult.data && bookingsResult.data.length > 0) {
              const hasBooked = bookingsResult.data.some(
                (booking: any) => booking.carId === id && booking.status === "completed"
              )
              setHasBookedCar(hasBooked)
            } else {
              setHasBookedCar(false)
            }
          } catch (bookingErr) {
            console.log("No bookings found for user (this is normal for new users)")
            setHasBookedCar(false)
          }
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

          {/* Price and Book Button */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: scale(24),
            paddingTop: scale(16),
            borderTopWidth: 1,
            borderTopColor: colors.border
          }}>
            {car.price > 0 && (
              <View>
                <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Price per day</Text>
                <Text style={{ fontSize: scale(28), fontWeight: '700', color: colors.morentBlue }}>
                  {car.price.toLocaleString()} VND
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => navigation.navigate("BookingForm" as any, { id: car.id })}
              style={{
                backgroundColor: colors.morentBlue,
                paddingHorizontal: scale(32),
                paddingVertical: scale(14),
                borderRadius: scale(8),
                marginLeft: car.price > 0 ? 0 : 'auto'
              }}
            >
              <Text style={{ color: colors.white, fontSize: scale(16), fontWeight: "600" }}>Rent Now</Text>
            </Pressable>
          </View>
        </View>

        <CarReviews
          reviews={reviews}
          hasBookedCar={hasBookedCar}
          onAddReview={() => navigation.navigate("FeedbackForm" as any, { carId: car.id })}
          onViewAllReviews={() => navigation.navigate("FeedbackList" as any)}
        />
      </ScrollView>

      <CarDocumentsModal visible={documentsModalVisible} onClose={() => setDocumentsModalVisible(false)} />
      <CarTermsModal visible={termsModalVisible} onClose={() => setTermsModalVisible(false)} />
      <CarRefundModal visible={refundModalVisible} onClose={() => setRefundModalVisible(false)} />
    </View>
  )
}

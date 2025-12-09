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
import { getAsset } from "../../../lib/getAsset"
import Header from "../../components/Header/Header"
import { useAuth } from "../../../lib/auth-context"
import { styles } from "./car-detail.styles"

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

    async function loadCarDetails() {
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
        if (mounted) {
          Alert.alert("Error", "Failed to load car details. Please try again.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCarDetails()

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
        </View>
      </View>
    )
  }

  if (!car) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.notFoundText}>Car not found</Text>
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

  const checkDriverLicense = async () => {
    if (!user?.id || !user?.email) {
      return { hasLicense: false, error: "No user credentials" }
    }

    try {
      const { data: licenseData, error: licenseError } = await userService.getDriverLicense(user.id, user.email)

      const hasLicense = !licenseError && licenseData && licenseData.urls && licenseData.urls.length > 0
      return { hasLicense, error: licenseError }
    } catch (error) {
      console.error("Error checking driver's license:", error)
      return { hasLicense: false, error: error }
    }
  }

  const showLicenseRequiredAlert = () => {
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

  const handleBookNow = async () => {
    if (!user?.id || !user?.email) {
      Alert.alert("Login Required", "Please login to book a car")
      return
    }

    const { hasLicense } = await checkDriverLicense()

    if (!hasLicense) {
      showLicenseRequiredAlert()
      return
    }

    navigation.navigate("BookingForm" as any, { id: car?.id })
  }

  const renderDepositInformation = () => (
    <View style={styles.depositContainer}>
      <View style={styles.depositHeader}>
        <Text style={styles.depositTitle}>💰 Deposit Information</Text>
      </View>
      <View style={styles.depositList}>
        <View style={styles.depositItem}>
          <Text style={styles.depositBullet}>•</Text>
          <Text style={styles.depositText}>
            Mandatory deposit: <Text style={styles.depositAmount}>10,000,000 VND</Text>
          </Text>
        </View>
        <View style={styles.depositItem}>
          <Text style={styles.depositBullet}>•</Text>
          <Text style={styles.depositText}>Motorbike deposit not accepted.</Text>
        </View>
        <View style={styles.depositItem}>
          <Text style={styles.depositBullet}>•</Text>
          <Text style={styles.depositText}>
            Deposit will be returned after returning the vehicle 15 days.
          </Text>
        </View>
      </View>
    </View>
  )

  const renderPriceAndBooking = () => (
    <View style={styles.priceBookContainer}>
      {car.price > 0 && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price per day</Text>
          <Text style={styles.priceValue} numberOfLines={2} adjustsFontSizeToFit>
            {car.price.toLocaleString()} VND
          </Text>
        </View>
      )}
      <Pressable
        onPress={handleBookNow}
        style={[styles.bookButton, !car.price && { marginLeft: 'auto' }]}
      >
        <Text style={styles.bookButtonText}>Rent Now</Text>
      </Pressable>
    </View>
  )

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CarImageGallery
          carImages={carImages}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={setSelectedImageIndex}
          getImageSource={getImageSource}
        />

        <View style={styles.carDetailsCard}>
          <Text style={styles.carTitle}>{car.model}</Text>
          <Text style={styles.carSubtitle}>
            {car.manufacturer} • {car.yearofManufacture}
          </Text>

          <CarSpecifications car={car} />
          <CarAmenities />
          <CarRentalPolicies
            onDocumentsPress={() => setDocumentsModalVisible(true)}
            onTermsPress={() => setTermsModalVisible(true)}
            onRefundPress={() => setRefundModalVisible(true)}
          />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{car.description}</Text>

          {renderDepositInformation()}

          <Pressable
            onPress={() => navigation.navigate("Chat" as any, { carId: car.id })}
            style={styles.contactButton}
          >
            <Text style={styles.contactEmoji}>💬</Text>
            <Text style={styles.contactText}>Contact Car Owner</Text>
          </Pressable>

          {renderPriceAndBooking()}
        </View>

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

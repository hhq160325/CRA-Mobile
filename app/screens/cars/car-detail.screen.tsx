"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView, Pressable, Image } from "react-native"
import { carsService, reviewsService, type Car, type Review } from "../../../lib/api"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import type { StackNavigationProp } from "@react-navigation/stack"
import { colors } from "../../theme/colors"
import { scale, verticalScale } from "../../theme/scale"
import { getAsset } from "../../../lib/getAsset"
import Header from "../../components/Header/Header"
import Icon from "react-native-vector-icons/MaterialIcons"

export default function CarDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { id } = (route.params as any) || {}
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!id) return

      setLoading(true)

      try {
        // Load car details and reviews in parallel for faster loading
        const [carResult, reviewsResult] = await Promise.all([
          carsService.getCarById(id),
          reviewsService.getCarReviews(id)
        ])

        if (mounted) {
          if (carResult.data) {
            setCar(carResult.data)
          }
          if (reviewsResult.data) {
            setReviews(reviewsResult.data)
          }
        }
      } catch (err) {
        console.error("Error loading car details:", err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [id])

  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return "0"
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const renderStars = (rating: number, size: number = 14) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name="star"
            size={scale(size)}
            color={i < rating ? "#FFB800" : colors.border}
            style={{ marginRight: scale(2) }}
          />
        ))}
      </View>
    )
  }

  const extractTitle = (comment: string) => {
    const lines = comment.split('\n')
    return lines[0] || "Customer Review"
  }

  const extractMessage = (comment: string) => {
    const lines = comment.split('\n')
    return lines.slice(2).join('\n').replace(/Category:.*$/, '').trim() || comment
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
  }

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

  // Create array of images (main image + additional images if available)
  const carImages = car.images && car.images.length > 0
    ? car.images
    : [car.image, car.image, car.image, car.image, car.image]

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: scale(20) }}>
        {/* Main Car Image */}
        <View style={{
          backgroundColor: colors.white,
          paddingVertical: scale(20),
          paddingHorizontal: scale(16),
          marginBottom: scale(8)
        }}>
          <Image
            source={getAsset(carImages[selectedImageIndex]) || require("../../../assets/tesla-model-s-luxury.png")}
            style={{
              width: "100%",
              height: scale(300),
              resizeMode: "contain"
            }}
          />
        </View>

        {/* Thumbnail Gallery */}
        <View style={{
          backgroundColor: colors.white,
          paddingVertical: scale(12),
          paddingHorizontal: scale(8),
          marginBottom: scale(16)
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: scale(8) }}
          >
            {carImages.map((img, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={{
                  width: scale(110),
                  height: scale(90),
                  marginRight: scale(12),
                  borderRadius: scale(8),
                  borderWidth: selectedImageIndex === index ? 3 : 1,
                  borderColor: selectedImageIndex === index ? colors.morentBlue : colors.border,
                  overflow: 'hidden',
                  backgroundColor: colors.background,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Image
                  source={getAsset(img) || require("../../../assets/tesla-model-s-luxury.png")}
                  style={{
                    width: "90%",
                    height: "90%",
                    resizeMode: "contain"
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Car Details */}
        <View style={{
          backgroundColor: colors.white,
          padding: scale(16),
          marginHorizontal: scale(16),
          borderRadius: scale(12),
          marginBottom: scale(16)
        }}>
          <Text style={{ fontSize: scale(24), fontWeight: "700", color: colors.primary }}>{car.name}</Text>
          <Text style={{ fontSize: scale(14), color: colors.placeholder, marginTop: scale(4) }}>
            {car.brand} • {car.year} • {car.category}
          </Text>

          {/* Specs */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: scale(20),
            paddingVertical: scale(16),
            backgroundColor: colors.background,
            borderRadius: scale(8)
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Fuel</Text>
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.fuelType}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Transmission</Text>
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.transmission}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Seats</Text>
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.seats}</Text>
            </View>
          </View>

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
            <View>
              <Text style={{ fontSize: scale(12), color: colors.placeholder }}>Price per day</Text>
              <Text style={{ fontSize: scale(28), fontWeight: '700', color: colors.morentBlue }}>
                ${car.price}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("BookingForm" as any, { id: car.id })}
              style={{
                backgroundColor: colors.morentBlue,
                paddingHorizontal: scale(32),
                paddingVertical: scale(14),
                borderRadius: scale(8),
              }}
            >
              <Text style={{ color: colors.white, fontSize: scale(16), fontWeight: "600" }}>Rent Now</Text>
            </Pressable>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={{
          backgroundColor: colors.white,
          padding: scale(16),
          marginHorizontal: scale(16),
          borderRadius: scale(12),
          marginBottom: scale(16)
        }}>
          {/* Reviews Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: scale(16)
          }}>
            <View>
              <Text style={{ fontSize: scale(18), fontWeight: '700', color: colors.primary }}>
                Customer Reviews
              </Text>
              {reviews.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4) }}>
                  {renderStars(Math.round(parseFloat(calculateAverageRating())), 16)}
                  <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary, marginLeft: scale(8) }}>
                    {calculateAverageRating()} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={() => navigation.navigate("FeedbackForm" as any, { carId: car.id })}
              style={{
                backgroundColor: colors.morentBlue,
                paddingHorizontal: scale(16),
                paddingVertical: scale(8),
                borderRadius: scale(6),
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Icon name="add" size={scale(16)} color={colors.white} />
              <Text style={{ color: colors.white, fontSize: scale(12), fontWeight: "600", marginLeft: scale(4) }}>
                Add Review
              </Text>
            </Pressable>
          </View>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <View style={{
              paddingVertical: scale(40),
              alignItems: 'center',
              backgroundColor: colors.background,
              borderRadius: scale(8)
            }}>
              <Icon name="rate-review" size={scale(48)} color={colors.border} />
              <Text style={{ marginTop: scale(12), color: colors.placeholder, fontSize: scale(14) }}>
                No reviews yet
              </Text>
              <Text style={{ marginTop: scale(4), color: colors.placeholder, fontSize: scale(12) }}>
                Be the first to review this car!
              </Text>
            </View>
          ) : (
            <View>
              {reviews.slice(0, 3).map((review, index) => (
                <View
                  key={review.id}
                  style={{
                    paddingVertical: scale(16),
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: colors.border
                  }}
                >
                  {/* Review Header */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: scale(8)
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>
                        {review.userName}
                      </Text>
                      <View style={{ marginTop: scale(4) }}>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                    <Text style={{ fontSize: scale(11), color: colors.placeholder }}>
                      {formatDate(review.date)}
                    </Text>
                  </View>

                  {/* Review Title */}
                  <Text style={{
                    fontSize: scale(13),
                    fontWeight: '600',
                    color: colors.primary,
                    marginBottom: scale(4)
                  }}>
                    {extractTitle(review.comment)}
                  </Text>

                  {/* Review Message */}
                  <Text style={{
                    fontSize: scale(13),
                    color: colors.placeholder,
                    lineHeight: scale(18)
                  }}>
                    {extractMessage(review.comment)}
                  </Text>
                </View>
              ))}

              {/* View All Reviews Button */}
              {reviews.length > 3 && (
                <Pressable
                  onPress={() => navigation.navigate("FeedbackList" as any)}
                  style={{
                    marginTop: scale(12),
                    paddingVertical: scale(12),
                    backgroundColor: colors.background,
                    borderRadius: scale(8),
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color: colors.morentBlue, fontSize: scale(14), fontWeight: '600' }}>
                    View All {reviews.length} Reviews
                  </Text>
                  <Icon name="arrow-forward" size={scale(16)} color={colors.morentBlue} style={{ marginLeft: scale(4) }} />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

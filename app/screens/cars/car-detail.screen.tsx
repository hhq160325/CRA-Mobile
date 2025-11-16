"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView, Pressable, Image } from "react-native"
import { carsService } from "../../../lib/api"
import type { Car } from "../../../lib/mock-data/cars"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import type { StackNavigationProp } from "@react-navigation/stack"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { getAsset } from "../../../lib/getAsset"
import Header from "../../components/Header/Header"

export default function CarDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { id } = (route.params as any) || {}
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const res = await carsService.getCarById(id)
      if (mounted && res.data) setCar(res.data)
      setLoading(false)
    }
    if (id) load()
    return () => {
      mounted = false
    }
  }, [id])

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
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.specs.fuel}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Transmission</Text>
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.specs.transmission}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: scale(12), color: colors.placeholder, marginBottom: scale(4) }}>Seats</Text>
              <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary }}>{car.specs.seats}</Text>
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
      </ScrollView>
    </View>
  )
}

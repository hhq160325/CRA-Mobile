"use client"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native"
import { carsService } from "../../../lib/api"
import type { Car } from "../../../lib/mock-data/cars"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import type { StackNavigationProp } from "@react-navigation/stack"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { Car360View } from "../../components/car-360-view/car-360-view.component"
import Header from "../../components/Header/Header"

export default function CarDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const { id } = (route.params as any) || {}
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView contentContainerStyle={{ padding: scale(16) }}>
        <Car360View images={car.images} carName={car.name} />
        <View style={{ marginTop: scale(16) }}>
          <Text style={{ fontSize: scale(20), fontWeight: "700", color: colors.primary }}>{car.name}</Text>
          <Text style={{ fontSize: scale(14), color: colors.placeholder, marginTop: scale(4) }}>
            {car.brand} • {car.year}
          </Text>
          <Text style={{ fontSize: scale(14), color: colors.primary, marginTop: scale(12), lineHeight: scale(20) }}>
            {car.description}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("BookingForm" as any, { id: car.id })}
          style={{
            backgroundColor: colors.morentBlue,
            padding: scale(14),
            borderRadius: scale(8),
            alignItems: "center",
            marginTop: scale(24)
          }}
        >
          <Text style={{ color: colors.white, fontSize: scale(16), fontWeight: "600" }}>Book Now</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

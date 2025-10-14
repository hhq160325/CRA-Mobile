"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TextInput, Pressable, Image, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { carsService } from "../../../lib/api"
import type { Car } from "../../../lib/mock-data/cars"
import { getAsset } from "../../../lib/getAsset"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const [cars, setCars] = useState<Car[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadCars() {
      const res = await carsService.getCars({})
      if (res.data) setCars(res.data)
    }
    loadCars()
  }, [])

  const popularCars = cars.slice(0, 3)
  const recommendedCars = cars.slice(3)

  const renderCarCard = (car: Car, isHorizontal = false) => (
    <Pressable
      key={car.id}
      onPress={() => navigation.navigate("CarDetail" as any, { id: car.id })}
      style={{
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: scale(16),
        marginRight: isHorizontal ? scale(12) : 0,
        marginBottom: scale(16),
        width: isHorizontal ? scale(240) : "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: scale(12),
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: scale(16), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
            {car.name}
          </Text>
          <Text style={{ fontSize: scale(12), color: colors.placeholder }}>{car.category.toUpperCase()}</Text>
        </View>
        <Ionicons name="heart-outline" size={scale(20)} color={colors.placeholder} />
      </View>

      <Image
        source={getAsset(car.image) || require("../../../assets/tesla-model-s-luxury.png")}
        style={{ width: "100%", height: scale(80), resizeMode: "contain", marginBottom: scale(16) }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(12) }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="local-gas-station" size={scale(14)} color={colors.placeholder} />
          <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(4) }}>
            {car.specs.fuel === "Electric" ? "90L" : "70L"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="settings" size={scale(14)} color={colors.placeholder} />
          <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(4) }}>
            {car.specs.transmission}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="people" size={scale(14)} color={colors.placeholder} />
          <Text style={{ fontSize: scale(12), color: colors.placeholder, marginLeft: scale(4) }}>
            {car.specs.seats} People
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: scale(16), fontWeight: "700", color: colors.primary }}>
            ${car.price}.00
            <Text style={{ fontSize: scale(12), fontWeight: "400", color: colors.placeholder }}>/day</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("BookingForm" as any, { id: car.id })}
          style={{
            backgroundColor: colors.morentBlue,
            paddingHorizontal: scale(16),
            paddingVertical: scale(8),
            borderRadius: 4,
          }}
        >
          <Text style={{ color: colors.white, fontSize: scale(12), fontWeight: "600" }}>Rent Now</Text>
        </Pressable>
      </View>
    </Pressable>
  )

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search Bar */}
      <View style={{ padding: scale(16), paddingTop: scale(20) }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.white,
            borderRadius: 10,
            paddingHorizontal: scale(16),
            paddingVertical: scale(12),
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons name="search" size={scale(20)} color={colors.placeholder} />
          <TextInput
            placeholder="Search something here"
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: scale(8), fontSize: scale(14), color: colors.primary }}
          />
          <MaterialIcons name="tune" size={scale(20)} color={colors.placeholder} />
        </View>
      </View>

      {/* Pick-Up Section */}
      <View style={{ paddingHorizontal: scale(16), marginBottom: scale(16) }}>
        <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: scale(16) }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(12) }}>
            <View
              style={{
                width: scale(12),
                height: scale(12),
                borderRadius: scale(6),
                backgroundColor: colors.morentBlue,
                opacity: 0.3,
                marginRight: scale(8),
              }}
            />
            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>Pick - Up</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingRight: scale(8) }}>
              <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                Locations
              </Text>
              <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Select your city</Text>
            </View>
            <View
              style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingHorizontal: scale(8) }}
            >
              <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                Date
              </Text>
              <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Select your date</Text>
            </View>
            <View style={{ flex: 1, paddingLeft: scale(8) }}>
              <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                Time
              </Text>
              <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Select your time</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Swap Button */}
      <View style={{ alignItems: "center", marginBottom: scale(16) }}>
        <Pressable
          style={{
            backgroundColor: colors.morentBlue,
            width: scale(50),
            height: scale(50),
            borderRadius: scale(8),
            justifyContent: "center",
            alignItems: "center",
            shadowColor: colors.morentBlue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MaterialIcons name="swap-vert" size={scale(24)} color={colors.white} />
        </Pressable>
      </View>

      {/* Drop-Off Section */}
      <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
        <View style={{ backgroundColor: colors.white, borderRadius: 10, padding: scale(16) }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(12) }}>
            <View
              style={{
                width: scale(12),
                height: scale(12),
                borderRadius: scale(6),
                backgroundColor: colors.morentBlue,
                marginRight: scale(8),
              }}
            />
            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>Drop - Off</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingRight: scale(8) }}>
              <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                Locations
              </Text>
              <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Select your city</Text>
            </View>
            <View
              style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border, paddingHorizontal: scale(8) }}
            >
              <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                Date
              </Text>
              <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Select your date</Text>
            </View>
            <View style={{ flex: 1, paddingLeft: scale(8) }}>
              <Text style={{ fontSize: scale(12), fontWeight: "700", color: colors.primary, marginBottom: scale(4) }}>
                Time
              </Text>
              <Text style={{ fontSize: scale(11), color: colors.placeholder }}>Select your time</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Popular Car Section */}
      <View style={{ marginBottom: scale(24) }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: scale(16),
            marginBottom: scale(12),
          }}
        >
          <Text style={{ fontSize: scale(14), color: colors.placeholder }}>Popular Car</Text>
          <Pressable onPress={() => navigation.navigate("Cars" as any)}>
            <Text style={{ fontSize: scale(12), color: colors.morentBlue, fontWeight: "600" }}>View All</Text>
          </Pressable>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: scale(16) }}
          renderItem={({ item }) => renderCarCard(item, true)}
        />
      </View>

      {/* Recommendation Car Section */}
      <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: scale(12),
          }}
        >
          <Text style={{ fontSize: scale(14), color: colors.placeholder }}>Recomendation Car</Text>
          <Pressable onPress={() => navigation.navigate("Cars" as any)}>
            <Text style={{ fontSize: scale(12), color: colors.morentBlue, fontWeight: "600" }}>View All</Text>
          </Pressable>
        </View>

        {recommendedCars.map((car) => renderCarCard(car, false))}
      </View>
    </ScrollView>
  )
}

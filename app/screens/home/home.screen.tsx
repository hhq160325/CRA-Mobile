"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TextInput, Pressable, Image, FlatList, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../navigators/navigation-route"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { carsService } from "../../../lib/api"
import type { Car } from "../../../lib/mock-data/cars"
import { getAsset } from "../../../lib/getAsset"
import { mockBookings } from "../../../lib/mock-data/bookings"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useAuth } from "../../../lib/auth-context"

const DonutChart = () => {
  const chartData = [
    { label: "Sport Car", value: 17439, color: "#1E3A8A" },
    { label: "SUV", value: 9478, color: "#3B82F6" },
    { label: "Coupe", value: 18197, color: "#60A5FA" },
    { label: "Hatchback", value: 12310, color: "#93C5FD" },
    { label: "MPV", value: 14406, color: "#DBEAFE" },
  ]

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: scale(150),
          height: scale(150),
          borderRadius: scale(75),
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: scale(16),
          borderWidth: scale(20),
          borderColor: "#3563E9",
          position: "relative",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: scale(24), fontWeight: "700", color: colors.primary }}>
            {total.toLocaleString()}
          </Text>
          <Text style={{ fontSize: scale(12), color: colors.placeholder, marginTop: scale(4) }}>Rental Car</Text>
        </View>
      </View>

      <View style={{ width: "100%" }}>
        {chartData.map((item, index) => (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(12) }}>
            <View
              style={{
                width: scale(12),
                height: scale(12),
                borderRadius: scale(2),
                backgroundColor: item.color,
                marginRight: scale(12),
              }}
            />
            <Text style={{ fontSize: scale(12), color: colors.primary, fontWeight: "500", flex: 1 }}>{item.label}</Text>
            <Text style={{ fontSize: scale(12), color: colors.placeholder, fontWeight: "600" }}>
              {item.value.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const [cars, setCars] = useState<Car[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [menuVisible, setMenuVisible] = useState(false)
  const { logout } = useAuth()

  useEffect(() => {
    async function loadCars() {
      const res = await carsService.getCars({})
      if (res.data) setCars(res.data)
    }
    loadCars()
  }, [])

  const popularCars = cars.slice(0, 3)
  const recommendedCars = cars.slice(3)
  const recentBookings = mockBookings.slice(0, 4)

  const handleLogout = async () => {
    setMenuVisible(false)
    await logout()
    navigation.navigate("authStack" as any)
  }

  const handleMenuNavigation = (screen: string) => {
    setMenuVisible(false)
    if (screen === "Profile") {
      navigation.navigate("Profile" as any)
    } else if (screen === "Bookings") {
      navigation.navigate("Bookings" as any)
    } else if (screen === "Cars") {
      navigation.navigate("Cars" as any)
    }
  }

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* MORENT header with logo and avatar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: scale(20),
          paddingTop: scale(50),
          paddingBottom: scale(16),
          backgroundColor: colors.white,
        }}
      >
        <Text style={{ fontSize: scale(28), fontWeight: "700", color: colors.morentBlue, letterSpacing: 1 }}>
          MORENT
        </Text>
        <Pressable onPress={() => setMenuVisible(true)}>
          <Image
            source={require("../../../assets/admin-avatar.png")}
            style={{ width: scale(40), height: scale(40), borderRadius: scale(20) }}
          />
        </Pressable>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: scale(90),
              right: scale(20),
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: scale(8),
              minWidth: scale(180),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Pressable
              onPress={() => handleMenuNavigation("Profile")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: scale(12),
                paddingHorizontal: scale(12),
                borderRadius: 8,
              }}
            >
              <MaterialIcons name="person" size={scale(20)} color={colors.primary} />
              <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                Profile
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleMenuNavigation("Bookings")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: scale(12),
                paddingHorizontal: scale(12),
                borderRadius: 8,
              }}
            >
              <MaterialIcons name="event-note" size={scale(20)} color={colors.primary} />
              <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                Bookings
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleMenuNavigation("Cars")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: scale(12),
                paddingHorizontal: scale(12),
                borderRadius: 8,
              }}
            >
              <MaterialIcons name="directions-car" size={scale(20)} color={colors.primary} />
              <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: colors.primary, fontWeight: "500" }}>
                Cars
              </Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: scale(4) }} />

            <Pressable
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: scale(12),
                paddingHorizontal: scale(12),
                borderRadius: 8,
              }}
            >
              <MaterialIcons name="logout" size={scale(20)} color="#EF4444" />
              <Text style={{ marginLeft: scale(12), fontSize: scale(14), color: "#EF4444", fontWeight: "500" }}>
                Logout
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={{ flex: 1 }}>
        {/* Search Bar */}
        <View style={{ padding: scale(16), paddingTop: scale(12), backgroundColor: colors.white }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: 10,
              paddingHorizontal: scale(16),
              paddingVertical: scale(14),
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <MaterialIcons name="search" size={scale(22)} color={colors.placeholder} />
            <TextInput
              placeholder="Search something here"
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, marginLeft: scale(12), fontSize: scale(14), color: colors.primary }}
            />
            <Pressable
              style={{
                padding: scale(8),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <MaterialIcons name="tune" size={scale(20)} color={colors.primary} />
            </Pressable>
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

        <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 10,
              padding: scale(16),
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
                alignItems: "center",
                marginBottom: scale(16),
              }}
            >
              <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>Top 5 Car Rental</Text>
              <MaterialIcons name="more-vert" size={scale(20)} color={colors.placeholder} />
            </View>

            <DonutChart />
          </View>
        </View>

        <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: scale(12),
            }}
          >
            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary }}>Recent Transaction</Text>
            <Pressable onPress={() => navigation.navigate("Bookings" as any)}>
              <Text style={{ fontSize: scale(12), color: colors.morentBlue, fontWeight: "600" }}>View All</Text>
            </Pressable>
          </View>

          {recentBookings.map((booking) => (
            <View
              key={booking.id}
              style={{
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: scale(12),
                marginBottom: scale(12),
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Image
                source={getAsset(booking.carImage) || require("../../../assets/tesla-model-s-luxury.png")}
                style={{ width: scale(60), height: scale(50), resizeMode: "contain", marginRight: scale(12) }}
              />

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>{booking.carName}</Text>
                <Text style={{ fontSize: scale(11), color: colors.placeholder, marginTop: scale(2) }}>
                  {booking.status === "completed" ? "Completed" : "Upcoming"}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: scale(11), color: colors.placeholder, marginBottom: scale(4) }}>
                  {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
                <Text style={{ fontSize: scale(12), fontWeight: "600", color: colors.primary }}>
                  ${booking.totalPrice}.00
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

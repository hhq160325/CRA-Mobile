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
import Header from "../../components/Header/Header"

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
  const [filterVisible, setFilterVisible] = useState(false)

  // Filter states
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<number | null>(null)

  useEffect(() => {
    async function loadCars() {
      const res = await carsService.getCars({})
      if (res.data) setCars(res.data)
    }
    loadCars()
  }, [])

  // Filter cars based on search and filters
  const filteredCars = cars.filter((car) => {
    // Search by name
    if (searchQuery && !car.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by price
    if (maxPrice && car.price > maxPrice) {
      return false
    }

    // Filter by type
    if (selectedType && car.category.toLowerCase() !== selectedType.toLowerCase()) {
      return false
    }

    // Filter by seats
    if (selectedSeats && car.specs.seats !== selectedSeats) {
      return false
    }

    return true
  })

  const popularCars = filteredCars.slice(0, 3)
  const recommendedCars = filteredCars.slice(3)
  const recentBookings = mockBookings.slice(0, 4)

  const clearFilters = () => {
    setMaxPrice(null)
    setSelectedType(null)
    setSelectedSeats(null)
    setSearchQuery("")
  }

  const hasActiveFilters = maxPrice !== null || selectedType !== null || selectedSeats !== null

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
      <Header />

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
              onPress={() => setFilterVisible(true)}
              style={{
                padding: scale(8),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: hasActiveFilters ? colors.morentBlue : colors.border,
                backgroundColor: hasActiveFilters ? colors.morentBlue : colors.white,
              }}
            >
              <MaterialIcons name="tune" size={scale(20)} color={hasActiveFilters ? colors.white : colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <View style={{ paddingHorizontal: scale(16), paddingBottom: scale(12), backgroundColor: colors.white }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: scale(8) }}>
                {maxPrice && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.morentBlue,
                      paddingHorizontal: scale(12),
                      paddingVertical: scale(6),
                      borderRadius: scale(16),
                    }}
                  >
                    <Text style={{ fontSize: scale(12), color: colors.white, marginRight: scale(6) }}>
                      Max ${maxPrice}
                    </Text>
                    <Pressable onPress={() => setMaxPrice(null)}>
                      <MaterialIcons name="close" size={scale(14)} color={colors.white} />
                    </Pressable>
                  </View>
                )}
                {selectedType && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.morentBlue,
                      paddingHorizontal: scale(12),
                      paddingVertical: scale(6),
                      borderRadius: scale(16),
                    }}
                  >
                    <Text style={{ fontSize: scale(12), color: colors.white, marginRight: scale(6) }}>
                      {selectedType}
                    </Text>
                    <Pressable onPress={() => setSelectedType(null)}>
                      <MaterialIcons name="close" size={scale(14)} color={colors.white} />
                    </Pressable>
                  </View>
                )}
                {selectedSeats && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.morentBlue,
                      paddingHorizontal: scale(12),
                      paddingVertical: scale(6),
                      borderRadius: scale(16),
                    }}
                  >
                    <Text style={{ fontSize: scale(12), color: colors.white, marginRight: scale(6) }}>
                      {selectedSeats} Seats
                    </Text>
                    <Pressable onPress={() => setSelectedSeats(null)}>
                      <MaterialIcons name="close" size={scale(14)} color={colors.white} />
                    </Pressable>
                  </View>
                )}
                <Pressable
                  onPress={clearFilters}
                  style={{
                    paddingHorizontal: scale(12),
                    paddingVertical: scale(6),
                    borderRadius: scale(16),
                    borderWidth: 1,
                    borderColor: colors.morentBlue,
                  }}
                >
                  <Text style={{ fontSize: scale(12), color: colors.morentBlue }}>Clear All</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        )}

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

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide" onRequestClose={() => setFilterVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderTopLeftRadius: scale(20),
              borderTopRightRadius: scale(20),
              padding: scale(20),
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: scale(20),
              }}
            >
              <Text style={{ fontSize: scale(18), fontWeight: "700", color: colors.primary }}>Filters</Text>
              <Pressable onPress={() => setFilterVisible(false)}>
                <MaterialIcons name="close" size={scale(24)} color={colors.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Price Filter */}
              <View style={{ marginBottom: scale(24) }}>
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary, marginBottom: scale(12) }}>
                  Max Price per Day
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: scale(8) }}>
                  {[50, 100, 150, 200, 300].map((price) => (
                    <Pressable
                      key={price}
                      onPress={() => setMaxPrice(maxPrice === price ? null : price)}
                      style={{
                        paddingHorizontal: scale(16),
                        paddingVertical: scale(10),
                        borderRadius: scale(8),
                        borderWidth: 1,
                        borderColor: maxPrice === price ? colors.morentBlue : colors.border,
                        backgroundColor: maxPrice === price ? colors.morentBlue : colors.white,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: scale(13),
                          color: maxPrice === price ? colors.white : colors.primary,
                          fontWeight: maxPrice === price ? "600" : "400",
                        }}
                      >
                        ${price}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Car Type Filter */}
              <View style={{ marginBottom: scale(24) }}>
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary, marginBottom: scale(12) }}>
                  Car Type
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: scale(8) }}>
                  {["Sports", "SUV", "Sedan", "Luxury", "Electric"].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setSelectedType(selectedType === type ? null : type)}
                      style={{
                        paddingHorizontal: scale(16),
                        paddingVertical: scale(10),
                        borderRadius: scale(8),
                        borderWidth: 1,
                        borderColor: selectedType === type ? colors.morentBlue : colors.border,
                        backgroundColor: selectedType === type ? colors.morentBlue : colors.white,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: scale(13),
                          color: selectedType === type ? colors.white : colors.primary,
                          fontWeight: selectedType === type ? "600" : "400",
                        }}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Seats Filter */}
              <View style={{ marginBottom: scale(24) }}>
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.primary, marginBottom: scale(12) }}>
                  Number of Seats
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: scale(8) }}>
                  {[2, 4, 5, 6, 7, 8].map((seats) => (
                    <Pressable
                      key={seats}
                      onPress={() => setSelectedSeats(selectedSeats === seats ? null : seats)}
                      style={{
                        paddingHorizontal: scale(16),
                        paddingVertical: scale(10),
                        borderRadius: scale(8),
                        borderWidth: 1,
                        borderColor: selectedSeats === seats ? colors.morentBlue : colors.border,
                        backgroundColor: selectedSeats === seats ? colors.morentBlue : colors.white,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: scale(13),
                          color: selectedSeats === seats ? colors.white : colors.primary,
                          fontWeight: selectedSeats === seats ? "600" : "400",
                        }}
                      >
                        {seats} Seats
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: scale(12), marginTop: scale(16) }}>
              <Pressable
                onPress={() => {
                  clearFilters()
                  setFilterVisible(false)
                }}
                style={{
                  flex: 1,
                  paddingVertical: scale(14),
                  borderRadius: scale(8),
                  borderWidth: 1,
                  borderColor: colors.morentBlue,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.morentBlue }}>Clear All</Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: scale(14),
                  borderRadius: scale(8),
                  backgroundColor: colors.morentBlue,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.white }}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

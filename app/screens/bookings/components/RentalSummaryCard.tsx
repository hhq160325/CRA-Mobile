import { View, Text, Image } from "react-native"
import { colors } from "../../../theme/colors"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import type { Car } from "../../../../lib/api"

interface RentalSummaryCardProps {
    car: Car
    carImageSource: any
    subtotal: number
    shippingFee: number
    bookingFee: number
    discount: number
    total: number
    distanceInKm?: number | null
    rentalDays?: number
    pricePerDay?: number
}

export default function RentalSummaryCard({
    car,
    carImageSource,
    subtotal,
    shippingFee,
    bookingFee,
    discount,
    total,
    distanceInKm,
    rentalDays = 1,
    pricePerDay = 0,
}: RentalSummaryCardProps) {
    return (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>Rental Summary</Text>
            <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 12 }}>
                Prices may change depending on the length of the rental and the price of your rental car.
            </Text>

            <View style={{ backgroundColor: colors.white, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                {carImageSource ? (
                    <Image
                        source={carImageSource}
                        style={{ width: "100%", height: 120, borderRadius: 8, marginBottom: 12, backgroundColor: colors.background }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{ width: "100%", height: 120, borderRadius: 8, marginBottom: 12, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
                        <MaterialIcons name="directions-car" size={48} color={colors.placeholder} />
                        <Text style={{ fontSize: 12, color: colors.placeholder, marginTop: 8 }}>No image available</Text>
                    </View>
                )}

                <Text style={{ fontSize: 14, fontWeight: "700", marginBottom: 4 }}>{car.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", marginRight: 4 }}>★ {car.rating}</Text>
                    <Text style={{ fontSize: 12, color: colors.placeholder }}>{car.reviews}+ Reviewer</Text>
                </View>

                <Text style={{ fontSize: 11, color: colors.placeholder, marginBottom: 12 }}>
                    {car.brand} • {car.category} • {car.year}
                </Text>

                {/* Car Specifications */}
                <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: colors.background, borderRadius: 6, marginBottom: 12 }}>
                    <View style={{ alignItems: "center" }}>
                        <MaterialIcons name="local-gas-station" size={16} color={colors.placeholder} />
                        <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Fuel</Text>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 }}>{car.fuelType}</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <MaterialIcons name="settings" size={16} color={colors.placeholder} />
                        <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Transmission</Text>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 }}>{car.transmission}</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <MaterialIcons name="people" size={16} color={colors.placeholder} />
                        <Text style={{ fontSize: 10, color: colors.placeholder, marginTop: 4 }}>Capacity</Text>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary, marginTop: 2 }}>{car.seats} People</Text>
                    </View>
                </View>

                {/* Pricing */}
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: colors.placeholder }}>Price per day</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600" }}>{pricePerDay.toFixed(0)} VND</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: colors.placeholder }}>Rental days</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600" }}>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text style={{ fontSize: 12, color: colors.placeholder }}>Subtotal</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600" }}>{subtotal.toFixed(0)} VND</Text>
                    </View>
                    {shippingFee > 0 && (
                        <View style={{ marginBottom: 12 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <MaterialIcons name="local-shipping" size={14} color={colors.morentBlue} style={{ marginRight: 4 }} />
                                    <Text style={{ fontSize: 12, color: colors.morentBlue, fontWeight: "600" }}>Shipping Fee</Text>
                                </View>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.morentBlue }}>{shippingFee.toFixed(0)} VND</Text>
                            </View>
                            {distanceInKm && (
                                <Text style={{ fontSize: 10, color: colors.placeholder, marginLeft: 18 }}>
                                    Distance: {distanceInKm.toFixed(1)} km × 20,000 VND/km
                                </Text>
                            )}
                        </View>
                    )}
                    {!shippingFee && (
                        <View style={{ marginBottom: 12 }} />
                    )}

                    {/* Booking Fee - shown above total */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialIcons name="receipt" size={14} color="#FF6B00" style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 12, color: "#FF6B00", fontWeight: "600" }}>Booking Fee</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#FF6B00" }}>{bookingFee.toFixed(0)} VND</Text>
                    </View>

                    {discount > 0 && (
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, color: "#10B981", fontWeight: "600" }}>Discount</Text>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: "#10B981" }}>-{discount.toFixed(0)} VND</Text>
                        </View>
                    )}

                    {/* Total */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: "700" }}>Total Rental Price</Text>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.morentBlue }}>{total.toFixed(0)} VND</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

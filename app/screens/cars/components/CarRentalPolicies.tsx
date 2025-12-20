import { View, Text, Pressable } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"
import Icon from "react-native-vector-icons/MaterialIcons"

interface CarRentalPoliciesProps {
    onDocumentsPress: () => void
    onTermsPress: () => void
    onRefundPress: () => void
}

export default function CarRentalPolicies({
    onDocumentsPress,
    onTermsPress,
    onRefundPress,
}: CarRentalPoliciesProps) {
    return (
        <>
            {/* Car Rental Documents */}
            <View style={{ marginTop: scale(20) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(12) }}>
                    <Text style={{ fontSize: scale(16), fontWeight: '600', color: colors.primary }}>
                        Car rental documents
                    </Text>
                    <Pressable onPress={onDocumentsPress} style={{ marginLeft: scale(8) }}>
                        <View style={{
                            width: scale(20),
                            height: scale(20),
                            borderRadius: scale(10),
                            backgroundColor: colors.morentBlue,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: colors.white, fontSize: scale(14), fontWeight: '700' }}>!</Text>
                        </View>
                    </Pressable>
                </View>
                <View style={{
                    backgroundColor: colors.background,
                    padding: scale(16),
                    borderRadius: scale(8),
                    borderLeftWidth: 4,
                    borderLeftColor: colors.morentBlue
                }}>
                    <Text style={{ fontSize: scale(14), fontWeight: '600', color: colors.primary, marginBottom: scale(8) }}>
                        Choose 1 of 2 forms:
                    </Text>
                    <View style={{ marginLeft: scale(8) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(6) }}>
                            <Icon name="check-circle" size={scale(16)} color="#4CAF50" style={{ marginRight: scale(8), marginTop: scale(2) }} />
                            <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1 }}>
                                Driver's license (check) & CCCD (check VNeID)
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Icon name="check-circle" size={scale(16)} color="#4CAF50" style={{ marginRight: scale(8), marginTop: scale(2) }} />
                            <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1 }}>
                                Driver's license (check) & Passport (keep)
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* General Terms */}
            <View style={{ marginTop: scale(20) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scale(12) }}>
                    <Text style={{ fontSize: scale(16), fontWeight: '600', color: colors.primary }}>
                        General terms
                    </Text>
                    <Pressable onPress={onTermsPress} style={{ marginLeft: scale(8) }}>
                        <View style={{
                            width: scale(20),
                            height: scale(20),
                            borderRadius: scale(10),
                            backgroundColor: colors.morentBlue,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: colors.white, fontSize: scale(14), fontWeight: '700' }}>!</Text>
                        </View>
                    </Pressable>
                </View>
                <View style={{
                    backgroundColor: colors.background,
                    padding: scale(16),
                    borderRadius: scale(8),
                    borderLeftWidth: 4,
                    borderLeftColor: '#F57C00'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(8) }}>
                        <Icon name="payment" size={scale(18)} color={colors.morentBlue} style={{ marginRight: scale(8), marginTop: scale(2) }} />
                        <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1 }}>
                            Pay the rental fee immediately upon receiving the car
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Icon name="rule" size={scale(18)} color={colors.morentBlue} style={{ marginRight: scale(8), marginTop: scale(2) }} />
                        <Text style={{ fontSize: scale(13), color: colors.primary, flex: 1 }}>
                            Follow all rental regulations and terms
                        </Text>
                    </View>
                </View>
            </View>

            {/* Additional Fees */}
            <View style={{ marginTop: scale(20) }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: colors.primary, marginBottom: scale(12) }}>
                    Additional fees
                </Text>
                <View style={{
                    backgroundColor: colors.white,
                    borderRadius: scale(8),
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: 'hidden'
                }}>
                    {/* Overtime Fee */}
                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: colors.background
                    }}>
                        <View style={{ marginRight: scale(10) }}>
                            <Icon name="schedule" size={scale(20)} color="#F57C00" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(4) }}>
                                <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.primary }}>
                                    Overtime fee
                                </Text>
                                <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#F44336' }}>
                                    500.000 VND/hour
                                </Text>
                            </View>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder, lineHeight: scale(16) }}>
                                Surcharge if the car is returned late. In case of delay of more than 5 hours, an additional day of rental fee will be charged.
                            </Text>
                        </View>
                    </View>

                    {/* Cleaning Fee */}
                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: colors.white
                    }}>
                        <View style={{ marginRight: scale(10) }}>
                            <Icon name="cleaning-services" size={scale(20)} color="#2196F3" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(4) }}>
                                <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.primary }}>
                                    Cleaning fee
                                </Text>
                                <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#F44336' }}>
                                    70.000 VND
                                </Text>
                            </View>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder, lineHeight: scale(16) }}>
                                Surcharge if the car is returned unsanitary (many stains, mud, etc.)
                            </Text>
                        </View>
                    </View>

                    {/* Deodorization Fee */}
                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        backgroundColor: colors.background
                    }}>
                        <View style={{ marginRight: scale(10) }}>
                            <Icon name="air" size={scale(20)} color="#9C27B0" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(4) }}>
                                <Text style={{ fontSize: scale(13), fontWeight: '600', color: colors.primary }}>
                                    Deodorization fee
                                </Text>
                                <Text style={{ fontSize: scale(13), fontWeight: '700', color: '#F44336' }}>
                                    500.000 VND
                                </Text>
                            </View>
                            <Text style={{ fontSize: scale(11), color: colors.placeholder, lineHeight: scale(16) }}>
                                Surcharge if the car is returned with an unpleasant odor (cigarette smell, strong-smelling food, etc.)
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Cancellation Policy */}
            <View style={{ marginTop: scale(20) }}>
                <Text style={{ fontSize: scale(16), fontWeight: '600', color: colors.primary, marginBottom: scale(12) }}>
                    Cancellation policy
                </Text>
                <View style={{
                    backgroundColor: colors.white,
                    borderRadius: scale(8),
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: 'hidden'
                }}>
                    {/* Table Header */}
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: colors.morentBlue,
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12)
                    }}>
                        <Text style={{ flex: 1, fontSize: scale(13), fontWeight: '700', color: colors.white }}>
                            Time of cancellation
                        </Text>
                        <Text style={{ flex: 1, fontSize: scale(13), fontWeight: '700', color: colors.white, textAlign: 'right' }}>
                            Cancellation fee
                        </Text>
                    </View>

                    {/* Table Rows */}
                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: '#E8F5E9'
                    }}>
                        <Text style={{ flex: 1, fontSize: scale(12), color: colors.primary, lineHeight: scale(18) }}>
                            Within 1 hour of booking
                        </Text>
                        <Text style={{ flex: 1, fontSize: scale(12), fontWeight: '600', color: '#4CAF50', textAlign: 'right' }}>
                            Free of charge
                        </Text>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        backgroundColor: colors.background
                    }}>
                        <Text style={{ flex: 1, fontSize: scale(12), color: colors.primary, lineHeight: scale(18) }}>
                            Before trip {'>'}7 days{'\n'}
                            <Text style={{ fontSize: scale(10), color: colors.placeholder }}>
                                (After 1 hour of Reservation)
                            </Text>
                        </Text>
                        <Text style={{ flex: 1, fontSize: scale(12), fontWeight: '600', color: '#FF9800', textAlign: 'right' }}>
                            10% of trip value
                        </Text>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        backgroundColor: colors.background
                    }}>
                        <Text style={{ flex: 1, fontSize: scale(12), color: colors.primary, lineHeight: scale(18) }}>
                            Within 7 days before the trip{'\n'}
                            <Text style={{ fontSize: scale(10), color: colors.placeholder }}>
                                (After 1 hour of Reservation)
                            </Text>
                        </Text>
                        <Text style={{ flex: 1, fontSize: scale(12), fontWeight: '600', color: '#F44336', textAlign: 'right' }}>
                            40% of the trip value
                        </Text>
                    </View>
                </View>

                {/* Cancellation Policy Notes */}
                <View style={{
                    marginTop: scale(12),
                    padding: scale(16),
                    backgroundColor: '#FFF3E0',
                    borderRadius: scale(8),
                    borderLeftWidth: 4,
                    borderLeftColor: '#F57C00'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(10) }}>
                        <Text style={{ color: '#F57C00', marginRight: scale(8), fontSize: scale(14) }}>*</Text>
                        <Text style={{ fontSize: scale(12), color: colors.primary, flex: 1, lineHeight: scale(18) }}>
                            Cancellation policy applies to both renters and car owners (in addition, depending on the time of cancellation, the car owner may be rated 2-3* on the system).
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(10) }}>
                        <Text style={{ color: '#F57C00', marginRight: scale(8), fontSize: scale(14) }}>*</Text>
                        <Text style={{ fontSize: scale(12), color: colors.primary, flex: 1, lineHeight: scale(18) }}>
                            Renters who do not receive the car will lose the cancellation fee (40% of the trip value).
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(10) }}>
                        <Text style={{ color: '#F57C00', marginRight: scale(8), fontSize: scale(14) }}>*</Text>
                        <Text style={{ fontSize: scale(12), color: colors.primary, flex: 1, lineHeight: scale(18) }}>
                            Car owners who do not deliver the car will refund the deposit and compensate the cancellation fee to the renter (40% of the trip value).
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: scale(10) }}>
                        <Text style={{ color: '#F57C00', marginRight: scale(8), fontSize: scale(14) }}>*</Text>
                        <Text style={{ fontSize: scale(12), color: colors.primary, flex: 1, lineHeight: scale(18) }}>
                            The deposit and compensation due to the car owner canceling the trip (if any) will be refunded by Morent to the renter by bank transfer within the next 1-3 working days.
                        </Text>
                    </View>

                    <Pressable
                        onPress={onRefundPress}
                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4) }}
                    >
                        <Text style={{
                            fontSize: scale(12),
                            color: colors.morentBlue,
                            fontWeight: '600',
                            textDecorationLine: 'underline'
                        }}>
                            See more Cancellation refund & compensation procedures
                        </Text>
                        <Icon name="arrow-forward" size={scale(14)} color={colors.morentBlue} style={{ marginLeft: scale(4) }} />
                    </Pressable>
                </View>
            </View>
        </>
    )
}

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
    ActivityIndicator,
} from 'react-native';
import { carsService, type Car } from '../../../lib/api';
import { getAsset } from '../../../lib/getAsset';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFavorites } from '../../../lib/favorites-context';

export default function AllCarsScreen() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            console.log('Fetching all cars...');
            const res = await carsService.getAllCars();
            if (mounted && res.data) {
                console.log('All cars loaded:', res.data.length);
                setCars(res.data);
            }
            setLoading(false);
        }
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const handleFavoritePress = (carId: string, e: any) => {
        e.stopPropagation();
        toggleFavorite(carId);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Header />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={{ marginTop: 16, color: colors.placeholder }}>Loading all cars...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Header />

            {/* Header Title */}
            <View
                style={{
                    paddingHorizontal: scale(16),
                    paddingTop: scale(16),
                    paddingBottom: scale(12),
                    backgroundColor: colors.white,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <MaterialIcons
                    name="directions-car"
                    size={scale(20)}
                    color={colors.morentBlue}
                    style={{ marginRight: scale(8) }}
                />
                <Text
                    style={{
                        fontSize: scale(18),
                        fontWeight: '700',
                        color: colors.primary,
                    }}>
                    All Cars ({cars.length})
                </Text>
            </View>

            <FlatList
                data={cars}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: scale(16) }}
                ListEmptyComponent={
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: scale(60),
                        }}>
                        <MaterialIcons
                            name="directions-car"
                            size={scale(64)}
                            color={colors.border}
                        />
                        <Text
                            style={{
                                fontSize: scale(16),
                                color: colors.placeholder,
                                marginTop: scale(16),
                                textAlign: 'center',
                            }}>
                            No cars available
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            navigation.navigate('CarDetail' as any, { id: item.id })
                        }
                        style={{
                            backgroundColor: colors.white,
                            marginBottom: scale(16),
                            borderRadius: scale(12),
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}>
                        <View style={{ padding: scale(16) }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: scale(12),
                                }}>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: scale(16),
                                            fontWeight: '700',
                                            color: colors.primary,
                                            marginBottom: scale(4),
                                        }}>
                                        {item.manufacturer} {item.model}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: scale(12),
                                            color: colors.placeholder,
                                            textTransform: 'uppercase',
                                        }}>
                                        {item.category || 'SEDAN'}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={(e) => handleFavoritePress(item.id, e)}
                                    style={{
                                        padding: scale(8),
                                    }}>
                                    <Ionicons
                                        name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                                        size={scale(20)}
                                        color={isFavorite(item.id) ? '#FF6B6B' : colors.placeholder}
                                    />
                                </Pressable>
                            </View>

                            {/* Car Image */}
                            <View
                                style={{
                                    height: scale(120),
                                    backgroundColor: colors.background,
                                    borderRadius: scale(8),
                                    marginBottom: scale(12),
                                    overflow: 'hidden',
                                }}>
                                <Image
                                    source={
                                        item.imageUrls && item.imageUrls.length > 0
                                            ? { uri: item.imageUrls[0] }
                                            : getAsset('luxury-sedan')
                                    }
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Car Details */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: scale(12),
                                }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialIcons
                                        name="local-gas-station"
                                        size={scale(16)}
                                        color={colors.placeholder}
                                    />
                                    <Text
                                        style={{
                                            fontSize: scale(12),
                                            color: colors.placeholder,
                                            marginLeft: scale(4),
                                        }}>
                                        {item.fuelConsumption || 'N/A'}L
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialIcons
                                        name="settings"
                                        size={scale(16)}
                                        color={colors.placeholder}
                                    />
                                    <Text
                                        style={{
                                            fontSize: scale(12),
                                            color: colors.placeholder,
                                            marginLeft: scale(4),
                                        }}>
                                        {item.transmission || 'Manual'}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialIcons
                                        name="people"
                                        size={scale(16)}
                                        color={colors.placeholder}
                                    />
                                    <Text
                                        style={{
                                            fontSize: scale(12),
                                            color: colors.placeholder,
                                            marginLeft: scale(4),
                                        }}>
                                        {item.seats || 4} People
                                    </Text>
                                </View>
                            </View>

                            {/* Price and Rent Button */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                <View>
                                    <Text
                                        style={{
                                            fontSize: scale(16),
                                            fontWeight: '700',
                                            color: colors.primary,
                                        }}>
                                        {item.price > 0 ? `${item.price.toLocaleString()} VND` : 'Price on request'}
                                        <Text
                                            style={{
                                                fontSize: scale(12),
                                                fontWeight: '400',
                                                color: colors.placeholder,
                                            }}>
                                            /day
                                        </Text>
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() =>
                                        navigation.navigate('BookingForm' as any, { id: item.id })
                                    }
                                    style={{
                                        backgroundColor: colors.morentBlue,
                                        paddingHorizontal: scale(16),
                                        paddingVertical: scale(8),
                                        borderRadius: scale(6),
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: scale(12),
                                            fontWeight: '600',
                                            color: colors.white,
                                        }}>
                                        Rent Now
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}
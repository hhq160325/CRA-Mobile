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
import { styles } from './styles/allCars.styles';

export default function AllCarsScreen() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            const res = await carsService.getAllCars();
            if (mounted && res.data) {
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
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.morentBlue} />
                    <Text style={styles.loadingText}>Loading all cars...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />

            {/* Header Title */}
            <View style={styles.headerContainer}>
                <MaterialIcons
                    name="directions-car"
                    size={scale(20)}
                    color={colors.morentBlue}
                    style={{ marginRight: scale(8) }}
                />
                <Text style={styles.headerTitle}>
                    All Cars ({cars.length})
                </Text>
            </View>

            <FlatList
                data={cars}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons
                            name="directions-car"
                            size={scale(64)}
                            color={colors.border}
                        />
                        <Text style={styles.emptyText}>
                            No cars available
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            navigation.navigate('CarDetail' as any, { id: item.id })
                        }
                        style={styles.carCard}>
                        <View style={styles.carCardContent}>
                            <View style={styles.carHeader}>
                                <View style={styles.carHeaderContent}>
                                    <Text style={styles.carTitle}>
                                        {item.manufacturer} {item.model}
                                    </Text>
                                    <Text style={styles.carCategory}>
                                        {item.category || 'SEDAN'}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={(e) => handleFavoritePress(item.id, e)}
                                    style={styles.favoriteButton}>
                                    <Ionicons
                                        name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                                        size={scale(20)}
                                        color={isFavorite(item.id) ? '#FF6B6B' : colors.placeholder}
                                    />
                                </Pressable>
                            </View>

                            {/* Car Image */}
                            <View style={styles.carImage}>
                                <Image
                                    source={
                                        item.imageUrls && item.imageUrls.length > 0
                                            ? { uri: item.imageUrls[0] }
                                            : getAsset('luxury-sedan')
                                    }
                                    style={styles.carImageContent}
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Car Details */}
                            <View style={styles.carDetails}>
                                <View style={styles.carDetailItem}>
                                    <MaterialIcons
                                        name="settings"
                                        size={scale(16)}
                                        color={colors.placeholder}
                                    />
                                    <Text style={styles.carDetailText}>
                                        {item.transmission || 'Automatic'}
                                    </Text>
                                </View>
                                <View style={styles.carDetailItem}>
                                    <MaterialIcons
                                        name="people"
                                        size={scale(16)}
                                        color={colors.placeholder}
                                    />
                                    <Text style={styles.carDetailText}>
                                        {item.seats || 4} People
                                    </Text>
                                </View>
                            </View>

                            {/* Price and Rent Button */}
                            <View style={styles.priceRentContainer}>
                                <View>
                                    <Text style={styles.priceText}>
                                        {item.price > 0 ? `${item.price.toLocaleString()} VND/day` : 'Price on request'}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() =>
                                        navigation.navigate('BookingForm' as any, { id: item.id })
                                    }
                                    style={styles.rentButton}>
                                    <Text style={styles.rentButtonText}>
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
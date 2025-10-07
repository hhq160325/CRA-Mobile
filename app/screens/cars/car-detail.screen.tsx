import React, {useEffect, useState} from 'react';
import {View, Text, Image, ActivityIndicator, ScrollView, Pressable} from 'react-native';
import {carsService} from '../../../lib/api';
import type {Car} from '../../../lib/mock-data/cars';
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import type {StackNavigationProp} from '@react-navigation/stack';
import {colors} from '../../theme/colors';
import {getAsset} from '../../../lib/getAsset';
import {scale} from '../../theme/scale';

export default function CarDetailScreen() {
  const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {id} = (route.params as any) || {};
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await carsService.getCarById(id);
      if (mounted && res.data) setCar(res.data);
      setLoading(false);
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <ActivityIndicator />;
  if (!car) return <Text>Car not found</Text>;

  return (
    <ScrollView style={{flex: 1, backgroundColor: colors.background}} contentContainerStyle={{padding: 12}}>
  <Image source={getAsset(car.image) || require('../../../assets/tesla-model-s-luxury.png')} style={{width: '100%', height: scale(200), borderRadius: 8}} />
      <View style={{marginTop: 12}}>
        <Text style={{fontSize: 18, fontWeight: '700'}}>{car.name}</Text>
        <Text style={{color: colors.placeholder}}>{car.brand} • {car.year}</Text>
        <Text style={{marginTop: 8}}>{car.description}</Text>
      </View>
      <Pressable
        onPress={() => navigation.navigate('BookingForm' as any, {id: car.id})}
        style={{backgroundColor: colors.button, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16}}>
        <Text style={{color: colors.white}}>Book Now</Text>
      </Pressable>
    </ScrollView>
  );
}

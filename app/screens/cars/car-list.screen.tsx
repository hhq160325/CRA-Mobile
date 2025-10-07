import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Pressable, Image, ActivityIndicator} from 'react-native';
import {carsService} from '../../../lib/api';
import type {Car} from '../../../lib/mock-data/cars';
import {getAsset} from '../../../lib/getAsset';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';

export default function CarListScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await carsService.getCars({});
      if (mounted && res.data) setCars(res.data);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={cars}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{padding: 12}}
      renderItem={({item}) => (
        <Pressable
          onPress={() => navigation.navigate('CarDetail' as any, {id: item.id})}
          style={{
            backgroundColor: colors.white,
            marginBottom: 12,
            borderRadius: 8,
            overflow: 'hidden',
            elevation: 1,
          }}>
          <View style={{flexDirection: 'row', padding: 12, alignItems: 'center'}}>
            <Image source={getAsset(item.image) || require('../../../assets/tesla-model-s-luxury.png')} style={{width: 80, height: 50, borderRadius: 6, marginRight: 12}} />
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: '600'}}>{item.name}</Text>
              <Text style={{color: colors.placeholder}}>{item.brand} • {item.category}</Text>
            </View>
            <Text style={{fontWeight: '700'}}>${item.price}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

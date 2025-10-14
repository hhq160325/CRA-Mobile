import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';
import {useAuth} from '../../../lib/auth-context'; 

export default function ProfileScreen() {
  const {logout, user} = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <Text style={{fontSize: scale(18), marginBottom: scale(20)}}>
        {user ? `Hello, ${user.name}` : 'Profile'}
      </Text>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: colors.primary || '#FF3B30',
          paddingVertical: scale(10),
          paddingHorizontal: scale(20),
          borderRadius: scale(8),
        }}>
        <Text style={{color: '#fff', fontSize: scale(16)}}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

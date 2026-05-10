import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAtomValue} from 'jotai';
import {RootStackParamList} from './types';
import {userAtom, isGuestAtom} from '../../core/auth/authAtoms';

import HomeScreen from '../../features/home/screens/HomeScreen';
import ProfileEditScreen from '../../features/home/screens/ProfileEditScreen';
import ProfileMenuScreen from '../../features/home/screens/ProfileMenuScreen';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import HotelNavigator from './HotelNavigator';
import BusNavigator from './BusNavigator';
import ManagementScreen from '../../features/management/screens/ManagementScreen';
import AdminUsersScreen from '../../features/management/screens/AdminUsersScreen';
import AdminUserDetailScreen from '../../features/management/screens/AdminUserDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const isGuest = useAtomValue(isGuestAtom);
  const user = useAtomValue(userAtom);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {(!user && !isGuest) ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="ProfileMenu" component={ProfileMenuScreen} />
          <Stack.Screen name="Management" component={ManagementScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
          <Stack.Screen name="HotelStack" component={HotelNavigator} />
          <Stack.Screen name="BusStack" component={BusNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;

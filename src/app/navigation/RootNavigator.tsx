import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAtomValue} from 'jotai';
import {RootStackParamList} from './types';
import {userAtom, isGuestAtom} from '../../core/auth/authAtoms';

import HomeScreen from '../../features/home/screens/HomeScreen';
import SettingsScreen from '../../features/home/screens/SettingsScreen';
import ProfileEditScreen from '../../features/home/screens/ProfileEditScreen';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import HotelNavigator from './HotelNavigator';
import BusNavigator from './BusNavigator';

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
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="HotelStack" component={HotelNavigator} />
          <Stack.Screen name="BusStack" component={BusNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;

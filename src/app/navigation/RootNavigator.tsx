import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import HomeScreen from '../../features/home/screens/HomeScreen';
import SettingsScreen from '../../features/home/screens/SettingsScreen';
import HotelNavigator from './HotelNavigator';
import BusNavigator from './BusNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HotelStack" component={HotelNavigator} />
      <Stack.Screen name="BusStack" component={BusNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;

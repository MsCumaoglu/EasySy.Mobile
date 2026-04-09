import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BusStackParamList} from './types';
import SearchBusScreen from '../../features/bus/screens/SearchBusScreen';
import BusResultsScreen from '../../features/bus/screens/BusResultsScreen';

const Stack = createNativeStackNavigator<BusStackParamList>();

const BusNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SearchBus" component={SearchBusScreen} />
      <Stack.Screen name="BusResults" component={BusResultsScreen} />
    </Stack.Navigator>
  );
};

export default BusNavigator;

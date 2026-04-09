import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HotelStackParamList} from './types';
import SearchHotelsScreen from '../../features/hotels/screens/SearchHotelsScreen';
import WhereToGoScreen from '../../features/hotels/screens/WhereToGoScreen';
import SelectDatesScreen from '../../features/hotels/screens/SelectDatesScreen';
import HotelResultsScreen from '../../features/hotels/screens/HotelResultsScreen';
import HotelDetailScreen from '../../features/hotels/screens/HotelDetailScreen';

const Stack = createNativeStackNavigator<HotelStackParamList>();

const HotelNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SearchHotels" component={SearchHotelsScreen} />
      <Stack.Screen name="WhereToGo" component={WhereToGoScreen} />
      <Stack.Screen name="SelectDates" component={SelectDatesScreen} />
      <Stack.Screen name="HotelResults" component={HotelResultsScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
    </Stack.Navigator>
  );
};

export default HotelNavigator;

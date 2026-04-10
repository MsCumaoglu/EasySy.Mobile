import {NavigatorScreenParams} from '@react-navigation/native';

export type HotelStackParamList = {
  SearchHotels: undefined;
  HotelResults: undefined;
  HotelDetail: {hotelId: string};
};

export type BusStackParamList = {
  SearchBus: undefined;
  BusResults: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  HotelStack: NavigatorScreenParams<HotelStackParamList>;
  BusStack: NavigatorScreenParams<BusStackParamList>;
};

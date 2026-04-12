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
  LanguageSelection: undefined;
  Login: undefined;
  Home: undefined;
  Settings: undefined;
  ProfileEdit: undefined;
  HotelStack: NavigatorScreenParams<HotelStackParamList>;
  BusStack: NavigatorScreenParams<BusStackParamList>;
};

import {NavigatorScreenParams} from '@react-navigation/native';

export type HotelStackParamList = {
  SearchHotels: undefined;
  WhereToGo: undefined;
  SelectDates: undefined;
  HotelResults: undefined;
  HotelDetail: {hotelId: string};
};

export type BusStackParamList = {
  SearchBus: undefined;
  BusResults: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  HotelStack: NavigatorScreenParams<HotelStackParamList>;
  BusStack: NavigatorScreenParams<BusStackParamList>;
};

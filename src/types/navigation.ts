import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp, BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeNavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Export: {sessionId: string};
  Settings: undefined;
  CalibrationHelp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Games: undefined;
};

export type RecordStackParamList = {
  BoardSetup: undefined;
  Recording: {sessionId: string};
};

export type GamesStackParamList = {
  GameList: undefined;
  GameDetail: {sessionId: string};
};

export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

export type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type RecordTabProps = BottomTabScreenProps<MainTabParamList, 'Record'>;

export type BoardSetupScreenProps = NativeStackScreenProps<RecordStackParamList, 'BoardSetup'>;
export type RecordingScreenProps = NativeStackScreenProps<RecordStackParamList, 'Recording'>;

export type GameListScreenProps = NativeStackScreenProps<GamesStackParamList, 'GameList'>;
export type GameDetailScreenProps = NativeStackScreenProps<GamesStackParamList, 'GameDetail'>;

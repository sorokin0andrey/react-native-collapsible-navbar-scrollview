import { Dimensions, Platform } from 'react-native'

export const SCREEN_HEIGHT = Dimensions.get('window').height

export const isAndroid = Platform.OS === 'android'

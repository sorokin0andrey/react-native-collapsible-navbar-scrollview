import { ReactNode } from 'react'
import { Animated, ScrollView } from 'react-native'

export interface CollapsibleNavBarActionOptions {
  animated: boolean
}

export enum CollapsibleNavBarState {
  open = 'open',
  closed = 'closed',
}

export interface CollapsibleNavBarScrollViewProps {
  children?: ReactNode | ReactNode[]
  header: ReactNode
  headerMaxHeight: number
  headerMinHeight: number
  animatedValue?: Animated.Value
  initialState?: CollapsibleNavBarState
  useNativeDriver?: boolean
  onChangeState?(state: CollapsibleNavBarState): void
}

export interface CollapsibleNavBarScrollViewRef extends ScrollView {
  open(options?: CollapsibleNavBarActionOptions): void
  close(options?: CollapsibleNavBarActionOptions): void
  scrollToView(viewRef: ReactNode, offset?: number): void
}

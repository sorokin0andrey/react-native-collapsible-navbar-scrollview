import React, { memo, useRef, useCallback, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import {
  Animated,
  ScrollView,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollViewProps,
  LayoutChangeEvent,
  StyleSheet,
} from 'react-native'

import useTimeout from './useTimeout'
import {
  CollapsibleNavBarScrollViewRef,
  CollapsibleNavBarScrollViewProps,
  CollapsibleNavBarState,
  CollapsibleNavBarActionOptions,
} from './types'
import { SCREEN_HEIGHT, isAndroid } from './constants'

export const CollapsibleNavBarScrollView = memo(
  forwardRef<CollapsibleNavBarScrollViewRef | null, CollapsibleNavBarScrollViewProps & ScrollViewProps>(
    (
      {
        onChangeState,
        animatedValue,
        header,
        headerMinHeight,
        headerMaxHeight,
        initialState = CollapsibleNavBarState.open,
        useNativeDriver = true,
        style,
        onLayout,
        ...props
      },
      ref
    ) => {
      const [setEndScrollTimeout, clearEndScrollTimeout] = useTimeout()

      const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT)

      const headerScrollDistance = useMemo(() => headerMaxHeight - headerMinHeight, [])
      const contentOffset = useMemo(
        () => ({
          x: 0,
          y: initialState === CollapsibleNavBarState.closed ? headerScrollDistance : 0,
        }),
        []
      )
      const contentHeight = useMemo(() => containerHeight - headerMinHeight, [containerHeight])
      const localAnimatedValue = useMemo(
        () => new Animated.Value(initialState === CollapsibleNavBarState.closed ? headerScrollDistance : 0),
        []
      )
      const scrollY = useMemo(() => {
        if (animatedValue) {
          animatedValue.setValue(initialState === CollapsibleNavBarState.closed ? headerScrollDistance : 0)
          return animatedValue
        }
        return localAnimatedValue
      }, [])

      const scrollViewRef = useRef<ScrollView | null>(null)
      const contentScrollViewRef = useRef<ScrollView | null>(null)
      const scrollValue = useRef(0)
      const opened = useRef(true)
      const firstRender = useRef(true)
      const isDraging = useRef(false)

      const setOpened = useCallback((newOpened: boolean) => {
        if (onChangeState && opened.current !== newOpened) {
          onChangeState(newOpened ? CollapsibleNavBarState.open : CollapsibleNavBarState.closed)
        }
        opened.current = newOpened
      }, [])

      const open = useCallback(
        (options?: CollapsibleNavBarActionOptions) => {
          setOpened(true)
          if (scrollViewRef.current) {
            const scrollParams = { y: 0, animated: options ? options?.animated : true }
            if (typeof scrollViewRef.current.scrollTo === 'function') {
              scrollViewRef.current.scrollTo(scrollParams)
            } else {
              // @ts-ignore
              scrollViewRef.current.getNode().scrollTo(scrollParams)
            }
          }
        },
        [setOpened]
      )

      const close = useCallback(
        (options?: { animated: boolean }) => {
          setOpened(false)
          if (scrollViewRef.current) {
            const scrollParams = { animated: options ? options?.animated : true }
            if (typeof scrollViewRef.current.scrollToEnd === 'function') {
              scrollViewRef.current.scrollToEnd(scrollParams)
            } else {
              // @ts-ignore
              scrollViewRef.current.getNode().scrollToEnd(scrollParams)
            }
          }
        },
        [setOpened]
      )

      const onScrollBegin = useCallback(() => {
        isDraging.current = true
        clearEndScrollTimeout()
      }, [])

      const handleIntermediateState = useCallback(() => {
        clearEndScrollTimeout()
        if (scrollValue.current < headerScrollDistance) {
          if (scrollValue.current > headerScrollDistance / 2) {
            close()
          } else {
            open()
          }
        }
      }, [close, open])

      const onMomentumScrollEnd = useCallback(() => {
        isDraging.current = false
        if (scrollValue.current < headerScrollDistance) {
          setEndScrollTimeout(handleIntermediateState, 300)
        }
      }, [handleIntermediateState])

      const onScrollEndDrag = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          isDraging.current = false
          const velocity = e.nativeEvent.velocity?.y || 0
          if (velocity === 0 || (isAndroid && Math.abs(Math.round(velocity)) <= 2)) {
            handleIntermediateState()
          }
        },
        [handleIntermediateState]
      )

      const onScrollContentEndDrag = useCallback(
        (event) => {
          if (event.nativeEvent.contentOffset.y > 0 && opened.current) {
            close()
          }
        },
        [close]
      )

      const handleLayout = useCallback(
        (event: LayoutChangeEvent) => {
          if (firstRender.current && initialState === CollapsibleNavBarState.closed && isAndroid) {
            close({ animated: false })
          }
          if (onLayout) {
            onLayout(event)
          }
          firstRender.current = false
        },
        [close]
      )

      const handleContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
          const height = event.nativeEvent.layout.height
          if (height !== containerHeight) {
            setContainerHeight(event.nativeEvent.layout.height)
          }
        },
        [containerHeight]
      )

      const scrollToView = useCallback((viewRef: View, offset = 0) => {
        if (viewRef && viewRef.measure) {
          viewRef.measure((ox, oy) => {
            if (contentScrollViewRef.current) {
              contentScrollViewRef.current.scrollTo({ y: oy + offset })
            }
          })
        }
      }, [])

      useImperativeHandle(
        ref,
        (): CollapsibleNavBarScrollViewRef | null => {
          if (contentScrollViewRef.current) {
            // @ts-ignore
            contentScrollViewRef.current.open = open
            // @ts-ignore
            contentScrollViewRef.current.close = close
            // @ts-ignore
            contentScrollViewRef.current.scrollToView = scrollToView
            return contentScrollViewRef.current as CollapsibleNavBarScrollViewRef
          }
          return null
        },
        [open, close, scrollToView]
      )

      useEffect(() => {
        scrollY.addListener(({ value }) => {
          scrollValue.current = value
          if (!isDraging.current) {
            clearEndScrollTimeout()
            if (value < headerScrollDistance) {
              setEndScrollTimeout(handleIntermediateState, 300)
            }
          }
          setOpened(value < headerScrollDistance)
        })

        return () => {
          scrollY.removeAllListeners()
          scrollY.stopAnimation()
        }
      }, [])

      return (
        <View style={styles.container} onLayout={handleContainerLayout}>
          <Animated.ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver,
            })}
            onScrollBeginDrag={onScrollBegin}
            onMomentumScrollBegin={onScrollBegin}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            overScrollMode='never'
            contentOffset={contentOffset}
            // @ts-ignore
            ref={scrollViewRef}
          >
            <View
              style={{
                height: headerMaxHeight,
              }}
            >
              {header}
            </View>

            <ScrollView
              ref={contentScrollViewRef}
              nestedScrollEnabled
              bounces={false}
              onScrollEndDrag={onScrollContentEndDrag}
              style={[style, { height: contentHeight }]}
              onLayout={handleLayout}
              {...props}
            />
          </Animated.ScrollView>
        </View>
      )
    }
  )
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

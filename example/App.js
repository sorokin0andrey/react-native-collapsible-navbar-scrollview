import React, { memo, useMemo } from 'react'
import { StyleSheet, View, SafeAreaView, Animated } from 'react-native'
import { CollapsibleNavBarScrollView } from '@busfor/react-native-collapsible-navbar-scrollview'

const HEADER_MAX_HEIGHT = 300
const HEADER_MIN_HEIGHT = 56

const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

export default memo(() => {
  const animatedValue = useMemo(() => new Animated.Value(0), [])
  return (
    <SafeAreaView style={styles.container}>
      <CollapsibleNavBarScrollView
        headerMinHeight={HEADER_MIN_HEIGHT}
        headerMaxHeight={HEADER_MAX_HEIGHT}
        header={
          <Animated.View
            style={[
              styles.header,
              {
                backgroundColor: animatedValue.interpolate({
                  inputRange: [0, HEADER_SCROLL_DISTANCE],
                  outputRange: ['#16b1f7', '#16f7ac'],
                }),
              },
            ]}
          />
        }
        animatedValue={animatedValue}
        useNativeDriver={false}
      >
        <View style={styles.content} />
        <View style={styles.content} />
        <View style={styles.content} />
        <View style={styles.content} />
      </CollapsibleNavBarScrollView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    flex: 1,
  },
  content: {
    backgroundColor: '#b8e2f5',
    height: 200,
    marginBottom: 12,
  },
})

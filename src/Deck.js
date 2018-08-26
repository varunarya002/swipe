import React, { Component } from 'react';

import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.35 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeLeft: () => {},
    onSwipeRight: () => {}
  }

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    };
    this.position = new Animated.ValueXY();

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        this.position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data != this.props.data) {
      this.setState({
        index: 0,
      })
    }
  }

  UNSAFE_componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental
    && UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  forceSwipe = (direction) => {
    Animated.timing(this.position, {
      toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION,
    }).start(this.onSwipeComplete(direction));
  }

  onSwipeComplete = (direction) => () => {
    const { onSwipeRight, onSwipeLeft, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({
      index: this.state.index + 1,
    });
  }

  resetPosition = () => {
    Animated.spring(this.position, { toValue: 0, }).start();
  }

  getCardStyle = () => {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });
    return {
      ...this.position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards = () => {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
        return null;
      }
      if (i === this.state.index) {
        return (
          <Animated.View
            {...this.panResponder.panHandlers}
            style={[this.getCardStyle(), styles.cardStyle, { zIndex: 5 }]}
            key={`${item.id}${i}`}
          >
            { this.props.renderCard(item) }
          </Animated.View>
        );
      }
      return (
        <Animated.View
          key={item.id}
          style={[
            styles.cardStyle,
            {
              zIndex: i * -1,
              top: 10 * (i - this.state.index),
            }
          ]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  }
};

export default Deck;

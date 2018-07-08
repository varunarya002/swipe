import React, { Component } from 'react';
import { View, Animated } from 'react-native';

class Deck extends Component {
  renderCard = () => this.props.data.map(item => this.props.renderCard(item))

  render() {
    return (
      <View>
        {this.renderCard()}
      </View>
    );
  }
}

export default Deck;

import React from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import { StyleSheet, Image, TouchableWithoutFeedback, View } from "react-native";
import { Block, Text, theme } from "galio-framework";
import StarRating from 'react-native-star-rating';
import Star from 'react-native-star-view';
import { argonTheme } from "../constants";

class PlayerTableCard extends React.Component {
  render() {
    const {
      navigation,
      item,
      horizontal,
      full,
      style,
      ctaColor,
      imageStyle,
      ctaRight,
    } = this.props;

    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle,
    ];
    const cardContainer = [styles.card, style];

    return (
      <Block row={horizontal} card flex style={cardContainer}>
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("PlayerProfile", { playerProfile: item })
          }
        >
          <Block flex style={styles.cardDescription}>
            <Image source={{ uri: item.image }} style={imageStyles} />
          </Block>
        </TouchableWithoutFeedback>

        {/* team name */}
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("PlayerProfile", { playerProfile: item })
          }
        >
          <Block flex space="between" style={styles.cardName}>
            <Block flex>
              <Text
                style={{marginTop: 20,fontFamily: "open-sans-regular" }}
                size={14}
                style={styles.cardTitle}
                color={argonTheme.COLORS.TEXT}
              >
                {item.name}
              </Text>

            </Block>
          </Block>
        </TouchableWithoutFeedback>

        {/* captain badge rating */}
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("PlayerProfile", { playerProfile: item })
          }
        >
          <Block flex space="between" style={styles.cardRating}>
            <Block flex>
            <View style={styles.container}>
                {/* <Star score={1} totalScore={1} style={starStyle} /> */}
            </View>
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

PlayerTableCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 0,
    marginBottom: 0,
  },
  cardTitle: {
    // flex: 1,
    // flexWrap: "wrap",
    paddingBottom: 6,
  },
  cardDescription: {
    padding: 5,
  },
  cardName: {
    marginTop: 25
  }, 
  cardRating: {
    marginTop: 25
  },
  imageContainer: {
    padding: 10,
    // borderRadius: 3,
    // elevation: 1,
    // overflow: "hidden"
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
  },
  horizontalImage: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  fullImage: {
    height: 215,
  }
});

export default withNavigation(PlayerTableCard);

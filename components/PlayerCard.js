import React from "react";
import { withNavigation } from '@react-navigation/compat';
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import { argonTheme } from "../constants";

class PlayerCard extends React.Component {
  render() {
    const {
      navigation,
      item,
      horizontal,
      full,
      style,
      ctaColor,
      imageStyle,
      ctaRight
    } = this.props;

    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, style]

    return (
      <Block row={horizontal} card flex style={cardContainer}>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("PlayerProfile", { playerProfile: item })}
        >
          <Block flex style={styles.cardDescription}>
            <Image source={{ uri: item.image }} style={imageStyles} />
          </Block>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("PlayerProfile", { playerProfile: item })}
        >
          <Block flex space="between" style={styles.cardDescription}>
            <Block flex>
            <Text
                style={{ fontFamily: "open-sans-regular" }}
                size={14}
                style={styles.cardTitle}
                color={argonTheme.COLORS.TEXT}
              >
                {item.username}
              </Text>

              <Block flex left style={{ marginTop: 12}}>
                <Text
                  style={{ fontFamily: "open-sans-regular" }}
                  size={12}
                  color={argonTheme.COLORS.TEXT}
                >
                  {"Puntaje: " + item.score}
                </Text>

                <Text
                  style={{ fontFamily: "open-sans-regular" }}
                  size={12}
                  color={argonTheme.COLORS.TEXT}
                >
                  {"Partidos Jugados: " + item.playedMatches}
                </Text>
                
              </Block>
            </Block>
            <Block right={ctaRight ? true : false}>
              <Text
                style={{ fontFamily: 'open-sans-bold' }}
                size={12}
                muted={!ctaColor}
                color={ctaColor || argonTheme.COLORS.ACTIVE}
                bold
              >
                {item.cta}
              </Text>
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

PlayerCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool
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
    paddingBottom: 6
  },
  cardDescription: {
    padding: 24
  },
  imageContainer: {
      padding: 20
    // borderRadius: 3,
    // elevation: 1,
    // overflow: "hidden"
  },
  image: {
    width: 112, height: 112, borderRadius: 112/ 2
  },
  horizontalImage: {
    width: 112, height: 112, borderRadius: 112/ 2
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  }
});

export default withNavigation(PlayerCard);

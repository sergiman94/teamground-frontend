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

class FeedShortcutsComponent extends React.Component {
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
    const cardContainer = [styles.card, style];
    const imgContainer = [
      styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles
    ];

    return (
      <Block row={horizontal} card flex style={cardContainer}>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("PlayerProfile", { playerProfile: item })}
        >
          <Block flex style={imgContainer}>
            <Image source={{ uri: item.image }} style={imageStyles} />

            <Block right={ctaRight ? true : false} style={{ marginTop: 10}}>
              <Text
                style={{fontFamily: "open-sans-bold" }}
                size={12}
                muted={!ctaColor}
                color={ctaColor || argonTheme.COLORS.ACTIVE}
                bold
              >
                {item.name}
              </Text>
            </Block>
          </Block>
          
        </TouchableWithoutFeedback>
        
      </Block>
    );
  }
}

FeedShortcutsComponent.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool
};

const styles = StyleSheet.create({
  card: {
    //backgroundColor: theme.COLORS.WHITE,
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
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {

    // borderRadius: 60/2,
    // elevation: 1,
    // overflow: "hidden"
  },
  image: {
    width: 40, height: 40, borderRadius: 40/ 2
  },
  horizontalImage: {
    width: 40, height: 40, borderRadius: 40/ 2, marginLeft: 4
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

export default withNavigation(FeedShortcutsComponent);

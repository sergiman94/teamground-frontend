import React from "react";
import { withNavigation } from '@react-navigation/compat';
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import { argonTheme } from "../constants";

class FieldShortcutComponent extends React.Component {
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
      data,
      component,
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
        <TouchableOpacity
          onPress={() => navigation.navigate(component ? component : "Home", { data: data ? data : item })}
        >
          <Block flex style={imgContainer}>
            <Image source={item} style={imageStyles} />
            <Block right={ctaRight ? true : false} style={{ marginTop: 10}}>
              <Text
                style={{fontFamily: "open-sans-bold" }}
                size={12}
                muted={!ctaColor}
                color={argonTheme.COLORS.WHITE}
                bold
              >
                Comentar
              </Text>
            </Block>
          </Block>
        </TouchableOpacity>
      </Block>
    );
  }
}

FieldShortcutComponent.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool
};

const styles = StyleSheet.create({
  card: {
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 0,
    marginBottom: 0,
  },
  cardTitle: {
    paddingBottom: 6
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    marginHorizontal: 2
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

export default withNavigation(FieldShortcutComponent);

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

class UserCard extends React.Component {
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
          <Block flex row  style={imgContainer}>
            {/* IMAGE */}
            <Image source={{ uri: item.image }} style={imageStyles} />

            {/* NAME */}
            <Block right={ctaRight ? true : false} style={{ marginTop: 0, marginLeft: 20}}>
              <Text
                style={{fontFamily: "open-sans-bold" }}
                size={16}
                muted={!ctaColor}
                color={ctaColor || argonTheme.COLORS.WHITE}
                bold
              >
                {item.displayName} 
              </Text>

              <Text
                style={{marginTop:2, marginLeft: 0, fontFamily: "open-sans-regular" }}
                size={16}
                muted={!ctaColor}
                color={"#96A7AF"}
              >
                @{item.username}
              </Text>
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

UserCard.propTypes = {
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
    width: 50, height: 50, borderRadius: 50/ 2
  },
  horizontalImage: {
    width: 50, height: 50, borderRadius: 50/ 2
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

export default withNavigation(UserCard);

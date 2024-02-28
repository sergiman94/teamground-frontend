import React from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import { StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { Block, Text, theme, Button } from "galio-framework";

import { Images } from "../constants";
class ProfileBookingMiniature extends React.Component {
  render() {
    const {
      navigation,
      item,
      horizontal,
      full,
      style,
      ctaColor,
      imageStyle,
    } = this.props;

    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle,
    ];
    const cardContainer = [styles.card, style];
    const imgContainer = [
      styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles
    ];

    return (
      <Block flex style={cardContainer}>
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("PlayerProfile", { playerProfile: item })
          }
        >
          <Block flex style={imgContainer}>
            {/* IMAGE */}
            <Image
              source={item ? { uri: item.image } : Images.ProfilePicture}
              style={imageStyles}
            />

            {/* NAME AND USERNAME */}
            <Block right={false} style={{alignItems: 'center'}}>
              {/* name text */}
              <Text
                style={{ fontFamily: "open-sans-bold" }}
                size={12}
                muted={!ctaColor}
                color={"#FFFFFF"}
                bold
              >
                {item ? item.displayName : " - "}
              </Text>
            </Block>

            {/* button badge */}
            <Button
              style={{ width: 70, height: 20, paddingHorizontal: 8 }}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 9 }}
              small
              color={"success"}
              shadowless
            >
              {"Ver perfil"}
            </Button>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

ProfileBookingMiniature.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    // borderWidth: 2, // use this for visual debug
    backgroundColor: "#30444E",
    paddingTop: 12, 
    alignItems: 'center'
  },
  cardTitle: {
    paddingBottom: 6,
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  imageContainer: {
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
  horizontalImage: {
    left: 16,
    marginBottom: 4, 
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  }
});

export default withNavigation(ProfileBookingMiniature);

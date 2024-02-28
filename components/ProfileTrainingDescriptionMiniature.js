import React, { useEffect } from "react";
import { withNavigation } from '@react-navigation/compat';
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import { Block, Text, theme, Button } from "galio-framework";

import { argonTheme, Images } from "../constants";
import { Icon } from ".";
import { timeAgo } from "../utils/utils.";
import { TouchableOpacity } from "react-native-gesture-handler";

class ProfileTrainingDescriptionMiniature extends React.Component {
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
      host
    } = this.props;
    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, style];
    const imgContainer = [
      styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles,
    ];

    return (
      <Block card flex row style={cardContainer}>
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("PlayerProfile", { playerProfile: item })
          }
        >
          <Block flex row style={imgContainer}>
            {/* IMAGE */}
            <Image
              source={item ? { uri: item.image } : Images.ProfilePicture}
              style={imageStyles}
            />

            {/* NAME AND TIME AGO */}
            <Block
              right={ctaRight ? true : false}
              style={{ marginTop: 0, marginLeft: 20 }}
            >
              {/* name text */}
              <Text
                style={{ fontFamily: "open-sans-bold" }}
                size={16}
                muted={!ctaColor}
                color={"#FFFFFF"}
                bold
              >
                {item ? item.displayName : " - "}
              </Text>

              {/* username and time ago */}
              <Block flex row style>
                <Text
                  style={{
                    marginTop: 2,
                    marginLeft: 0,
                    fontFamily: "open-sans-regular",
                  }}
                  size={16}
                  muted={!ctaColor}
                  color={"#96A7AF"}
                >
                  @{item ? item.username : " - "}
                </Text>
              </Block>
            </Block>
          </Block>
        </TouchableWithoutFeedback>

        <Button
          style={{ width: 80, height: 30 }}
          textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
          small
          color={"success"}
          shadowless
        >
          {"ENTRENADOR"}
        </Button>
      </Block>
    );
  }
}

ProfileTrainingDescriptionMiniature.propTypes = {
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
    borderWidth: 0, // use this for visual debug
    width: '100%', 
    minHeight: 0,
    marginBottom: 0,
    backgroundColor: '#286053',
    padding: 20
  },
  cardTitle: {
   
    paddingBottom: 6
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    
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

export default withNavigation(ProfileTrainingDescriptionMiniature);


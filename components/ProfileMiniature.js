import React from "react";
import { withNavigation } from '@react-navigation/compat';
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Icon } from ".";
import { timeAgo } from "../utils/utils.";

class ProfileMiniature extends React.Component {
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
          onPress={() =>
            navigation.navigate("PlayerProfile", { playerProfile: item })
          }
        >
          <Block flex row style={imgContainer}>
            {/* IMAGE */}
            <Image source={{ uri: item.userImage || item.image}} style={imageStyles} />

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
                {item.name || item.displayName}
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
                  @{item.username}
                </Text>
                <Icon
                  name="circle"
                  family="Font-Awesome"
                  color={"#96A7AF"}
                  size={4}
                  style={{ paddingRight: 4, paddingLeft: 4, marginTop: 12.5 }}
                />
                <Text
                  style={{
                    marginTop: 4.8,
                    marginLeft: 0,
                    fontFamily: "open-sans-regular",
                  }}
                  size={14}
                  muted={true}
                  color={"#96A7AF"}
                >
                  {timeAgo(Number(item.timestamp))}
                </Text>
              </Block>
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

ProfileMiniature.propTypes = {
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
    width: '50%', 
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

export default withNavigation(ProfileMiniature);

import React from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import { StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { Block, Text, theme } from "galio-framework";
import { argonTheme } from "../constants";
import { Icon } from ".";

class FieldCard extends React.Component {
  render() {
    const {
      navigation,
      item,
      horizontal,
      full,
      style,
      imageStyle,
      withoutCta,
      component,
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
      <Block row={horizontal} card flex style={cardContainer}>
        {/* image */}
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate(component ? component : "FieldDescription", {
              field: item,
            })
          }
        >
          <Block flex style={imgContainer}>
            <Image source={{ uri: item.image }} style={imageStyles} />
          </Block>
        </TouchableWithoutFeedback>

        {/* field data */}
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate(component ? component : "FieldDescription", {
              field: item,
            })
          }
        >
          <Block flex space="between" style={styles.cardDescription}>
            <Block style={{ padding: 8 }} flex>
              {/* field title */}
              <Text
                size={16}
                style={styles.cardTitle}
                color={argonTheme.COLORS.WHITE}
              >
                {item.field}
              </Text>

              {/* field address */}
              <Text
                style={{ fontFamily: "open-sans-regular" }}
                size={12}
                color={argonTheme.COLORS.WHITE}
              >
                {item.address}
              </Text>

              {/* field description */}
              <Block flex left style={{ marginTop: 16 }}>
                <Text
                  style={{ fontFamily: "open-sans-regular" }}
                  size={12}
                  color={argonTheme.COLORS.WHITE}
                >
                  {item.description}
                </Text>
              </Block>
            </Block>

            {/* redirection */}
            {withoutCta ? (
              <></>
            ) : (
              <Block flex space="between" style={{ marginTop: 8, padding: 8 }}>
                <Block flex row>
                  <Text
                    style={{ fontFamily: "open-sans-bold" }}
                    size={12}
                    muted={false}
                    color={"#FFFFFF"}
                    bold
                  >
                    {"Ver detalles"}
                  </Text>
                  <Icon
                    name="external-link-square"
                    style={{
                      marginTop: 2,
                      fontFamily: "open-sans-bold",
                      color: "#FFFFFF",
                      left: 8,
                    }}
                    family="Font-Awesome"
                    size={12}
                    color={"#FFFFFF"}
                  />
                </Block>
              </Block>
            )}
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

FieldCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#30444E",
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: "open-sans-bold",
    fontSize: 20,
  },
  cardDescription: {
    padding: 8
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  image: {

  },
  horizontalImage: {
    height: 122,
    width: "auto",
  },
  horizontalStyles: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  verticalStyles: {
    borderBottomRightRadius: 3,
    borderBottomLeftRadius: 3,
  },
  fullImage: {
    height: 215,
  }
});

export default withNavigation(FieldCard);

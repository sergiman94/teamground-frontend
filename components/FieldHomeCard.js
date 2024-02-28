import React, { useEffect, useState } from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import { StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Images, argonTheme } from "../constants";
import { Icon } from ".";

export default function FieldHomeCard(props) {
  const { navigation, item, horizontal, ctaRight } = props;

  const [fieldPoints, setFieldPoints] = useState(0);
  const [pointers, setPointers] = useState(0);

  const setAveragePoints = (points) => {
    let sum = points.reduce((a, b) => a + b, 0);
    let avg = sum / points.length;
    setFieldPoints(avg);
    setPointers(points.length);
  };

  useEffect(() => {
    setAveragePoints(item.points);
  }, []);

  return (
    <Block row={horizontal} card flex style={styles.card}>
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate("FieldDescription", { field: item })}
      >
        <>
          {/* image */}
          <Block flex style={styles.imageContainer}>
            <Image
              source={
                item && item.image
                  ? { uri: item.image }
                  : Images.CardPlaceholder
              }
              style={styles.horizontalImage}
            />
          </Block>
          {/* content */}
          <Block style={styles.cardDescription}>
            <Block>
              {/* title */}
              <Text
                size={12}
                style={styles.cardTitle}
                color={argonTheme.COLORS.WHITE}
              >
                {item && item.field}
              </Text>
              {/* description */}
              {item && item.description ? (
                <Block>
                  <Text
                    style={styles.cardBody}
                    size={12}
                    color={argonTheme.COLORS.TEXT}
                  >
                    {item.description}
                  </Text>
                </Block>
              ) : (
                <></>
              )}
            </Block>
          </Block>
          {/* rating */}
          <Block flex row style={styles.cardRating}>
            <Icon
              name="star"
              style={{ top: 2 }}
              family="Font-Awesome"
              size={12}
              color={"#96A7AF"}
            />
            <Text style={styles.cardCta} size={12}>
              {`${fieldPoints || 0} (${pointers})`}
            </Text>
          </Block>
        </>
      </TouchableWithoutFeedback>
    </Block>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8, 
    backgroundColor: "#30444E",
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    marginBottom: 0,
    width: 200,
    height: 290,
    borderRadius: 8,
    marginRight: 36,
    paddingBottom: 0
  },
  cardTitle: {
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 16,
    paddingBottom: 8,
  },
  cardRating: {
    flex: 0.3,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  cardBody: {
    color: "#ffffff",
    fontFamily: "open-sans-regular",
    fontSize: 14,
    textAlign: "auto",
    paddingBottom: 8,
  },
  cardCta: {
    marginLeft: 4,
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 14,
  },
  cardDescription: {
    flex: 1.4,
    marginTop: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    overflow: "hidden",
  },
  horizontalImage: {
    borderRadius: 8, 
    height: 135,
    width: "auto",
  },
  imageContainer: {
    flex: 1.5,
    overflow: "hidden",
  },
  horizontalStyles: {},
});

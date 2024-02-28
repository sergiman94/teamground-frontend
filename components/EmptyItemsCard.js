import React from "react";
import { StyleSheet } from "react-native";
import { Block, Text, theme } from "galio-framework";
import { argonTheme } from "../constants";
import { Icon } from ".";

export default function EmptyItemsCard(props) {
  const { prefix, horizontal, style } = props;
  const cardContainer = [styles.card, style];
  return (
    <Block row={horizontal} card flex style={cardContainer}>
      <Block flex row style={styles.cardHeader}>
        <Icon
          style={styles.icon}
          name="bullhorn"
          family="Font-Awesome"
          size={32}
          color={"#40DF9F"}
        />

        {/* description */}
        <Block>
          <Text
            size={14}
            style={styles.cardTitle}
            color={argonTheme.COLORS.WHITE}
          >
            No hay {prefix || 'items'} en este momento
          </Text>
        </Block>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#30444E",
    borderWidth: 0,
    width: 300,
  },
  cardTitle: {
    fontFamily: "open-sans-bold",
    marginTop: 10,
    paddingBottom: 6,
    marginTop: 12,
    marginLeft: 12
  },
  icon: {
    marginTop: 4
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  cardHeader: { 
    justifyContent: 'center',
    marginTop: 4,
    padding: theme.SIZES.BASE / 2,
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  horizontalImage: {
    height: 122,
    width: "auto",
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
  },
});

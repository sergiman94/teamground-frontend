import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { argonTheme } from "../constants/";

const { width } = Dimensions.get("screen");

export default function MatchDescriptionCard(props) {
  const item = props && props.item ? props.item : {};
  const field = props && props.field ? props.field : {}

  return (
    <Block>
      <Block card style={styles.container}>
        <Block flex row>
          <Block>
            <Text
              style={{ fontFamily: "open-sans-bold", marginLeft: 8, marginTop: 8}}
              size={12}
              color={argonTheme.COLORS.WHITE}
            >
              Cancha {`${field.field}`}
            </Text>
            <Text
              style={{ fontFamily: "open-sans-bold", marginLeft: 8, marginTop: 16}}
              size={12}
              color={argonTheme.COLORS.WHITE}
            >
              Modalidad: {`${item.modality}`}
            </Text>
            <Text
              style={{ fontFamily: "open-sans-bold", marginLeft: 8, marginTop: 2}}
              size={12}
              color={argonTheme.COLORS.WHITE}
            >
              Cupos disponibles: {`${item.players}`}
            </Text>
            <Text
              style={{ fontFamily: "open-sans-bold", marginLeft: 8, marginTop: 2, marginBottom: 12}}
              size={12}
              color={argonTheme.COLORS.WHITE}
            >
              Cupos confirmados: {`${item.confirmedPlayers.length}`}
            </Text>
          </Block>

          <Block style={styles.imageHorizontal}>
            <Image
              source={{ uri: field.image }}
              style={{
                height: theme.SIZES.BASE * 5,
                marginTop: -theme.SIZES.BASE - 8,
                borderRadius: 3,
              }}
            />
          </Block>
        </Block>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  cart: {
    width: width,
  },
  header: {
    marginTop: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
  },
  footer: {
    marginBottom: theme.SIZES.BASE * 2,
  },
  divider: {
    height: 1,
    backgroundColor: argonTheme.COLORS.INPUT,
    marginVertical: theme.SIZES.BASE,
  },
  checkoutWrapper: {
    paddingTop: theme.SIZES.BASE * 2,
    margin: theme.SIZES.BASE,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: argonTheme.COLORS.INPUT,
  },
  products: {
    minHeight: "100%",
  },
  container: {
    width: '100%',
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE * 1.5,
    backgroundColor: "#30444E",
    padding: 12
  },
  productTitle: {
    fontFamily: "open-sans-bold",
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6,
  },
  productDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  imageHorizontal: {
    width: theme.SIZES.BASE * 6.25,
    margin: theme.SIZES.BASE / 2,
    marginLeft: 'auto'
  },
  options: {
    padding: theme.SIZES.BASE / 2,
  },
  qty: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    width: theme.SIZES.BASE * 6.25,
    backgroundColor: argonTheme.COLORS.INPUT,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  optionsButtonText: {
    size: 16,
    fontFamily: "open-sans-bold",
    fontSize: theme.SIZES.BASE * 0.75,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    backgroundColor: "#286053",
  },
  optionsRejectButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    backgroundColor: "#623A42",
  },
  checkout: {
    height: theme.SIZES.BASE * 3,
    width: width - theme.SIZES.BASE * 4,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
  },
  similarTitle: {
    lineHeight: 26,
    marginBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE,
  },
  productVertical: {
    height: theme.SIZES.BASE * 10.75,
    width: theme.SIZES.BASE * 8.125,
    overflow: "hidden",
    borderWidth: 0,
    borderRadius: 4,
    marginBottom: theme.SIZES.BASE,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: theme.SIZES.BASE / 4,
    shadowOpacity: 1,
  },
});

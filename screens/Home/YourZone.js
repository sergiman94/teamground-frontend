import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme } from "galio-framework";

import { Card } from "../../components/";

import deals from "../../constants/deals";
import yourZoneTabs from "../../constants/yourZoneTabs";
import FieldCard from "../../components/FieldCard";

const { width } = Dimensions.get("screen");
// import products from '../constants/products';

export default class YourZone extends React.Component {
  renderProducts = () => {
    const { navigation, route } = this.props;
    // const tabId = navigation.getParam("tabId");
    // const products = tabId ? deals[tabId] : deals.shoes;
    const tabId = route.params?.tabId;
    const products = tabId ? yourZoneTabs[tabId] : yourZoneTabs.sintetic;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.products}
      >
       {tabId && tabId === "sintetic" ? (
          <Block flex>
            <FieldCard item={products[0]} full />
            <FieldCard item={products[1]} full />
            <FieldCard item={products[2]} full />
            <FieldCard item={products[3]} full />
            
          </Block>
        ) : tabId && tabId === "grass" ? (
          <Block flex>
            <FieldCard item={products[0]} full />
            
          </Block>
        ) : (
          <Block flex>
            <FieldCard item={products[1]} full />
            
          </Block>
        )}
      </ScrollView>
    );
  };

  render() {
    return (
      <Block flex center style={styles.deals}>
        {this.renderProducts()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  deals: {
    width
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE
  }
});

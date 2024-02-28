import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme } from "galio-framework";

import { Card } from "../../components/";

import deals from "../../constants/deals";
import highlightedTabs from "../../constants/highlightedTabs";
import MatchCard from "../../components/MatchCard";
import FieldCard from "../../components/FieldCard";
import PlayerCard from "../../components/PlayerCard";
import axios from "axios";
import { HIGHLIGHTED_FIELDS_URL, HIGHLIGHTED_MATCHES_URL, HIGHLIGHTED_USERS_URL } from "../../utils/utils.";

const { width } = Dimensions.get("screen");
// import products from '../constants/products';

export default class Highlighted extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      matches: [],
      players: [],
    };
  }

  componentDidMount = async () => {
    // TODO: change this to Promise.all

    // load highlighted fields
    let fields = await (await axios.get(HIGHLIGHTED_FIELDS_URL)).data;
    this.setState({ fields: fields.data });

    // load highligted matches
    let matches = await (await axios.get(HIGHLIGHTED_MATCHES_URL)).data;
    this.setState({ matches: matches.data });

    // load highlighted players
    let players = await (await axios.get(HIGHLIGHTED_USERS_URL)).data;
    this.setState({ players: players.data });
  };

  renderProducts = () => {
    const { navigation, route } = this.props;
    // const tabId = navigation.getParam("tabId");
    // const products = tabId ? deals[tabId] : deals.shoes;
    const tabId = route.params?.tabId;
    // const products = tabId ? highlightedTabs[tabId] : highlightedTabs.matches;

    const products = tabId && tabId === "fields" ? this.state.fields : tabId && tabId == "players" ? this.state.players : this.state.matches;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.products}
      >
        {tabId && tabId === "players" ? (
          <Block flex>
            {products.length < 0 ? (
              <></>
            ) : (
              products.map((product) => (
                <PlayerCard item={product} horizontal />
              ))
            )}
          </Block>
        ) : tabId && tabId === "fields" ? (
          <Block flex>
            {products.length < 0 ? (
              <></>
            ) : (
              products.map((product) => <FieldCard item={product} full />)
            )}
          </Block>
        ) : (
          <Block flex>
            <Block flex>
              {products.length < 0 ? (
                <></>
              ) : (
                products.map((product) => (
                  <MatchCard item={product} horizontal />
                ))
              )}
            </Block>
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
    width,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

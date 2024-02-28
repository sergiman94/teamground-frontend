import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme, Text } from "galio-framework";

import { Card } from "../../components";
import matchFields from "../../constants/matchFields";
import picturePost from '../../constants/Posts'
import FloatingButton from "../../components/FloatingButton";
import { FloatingAction } from "react-native-floating-action";
import PostCard from "../../components/PostCard";
import PlayerAvatar from "../../components/PlayerAvatar";

import FeedShortcuts from "../../constants/FeedShortcuts";
import FeedShortcutsComponent from "../../components/FeedShortcutsComponent";
import CommentCard from "../../components/CommentCard";
import CreatePostCard from "../../components/CreatePostCard";

const { width } = Dimensions.get("screen");

class CreatePromo extends React.Component {
  
  constructor(props) {
    super(props)
  }

  handleRedirection = (data) => {
    const { navigation, route } = this.props;
    if (data === 'posted') navigation.navigate("Home", {reload: true})
  }

  renderArticles = () => {
    const { navigation, route } = this.props;
    // const { params } = navigation && navigation.state;
    // const product = params.product;
    const item = route.params?.item;
    // console.log(item)

    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
        >
          <Block>
            
          </Block>
        </ScrollView>
      </>
    );
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderArticles()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 2,
  },
  floatinBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

export default CreatePromo;

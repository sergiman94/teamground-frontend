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
import CreateBookingCommentCard from "../../components/CreateBookingCommentCard";

const { width } = Dimensions.get("screen");

export default function CreateBookingComment (props) {

  const handleRedirection = (data) => {
    const { navigation, route } = props;
    if (data === 'posted') navigation.navigate("BookingDescription", { reload: true })
  }

  const renderArticles = () => {
    const { navigation, route } = props;
    const item = route.params?.item;
    console.log(item)
    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
        >
          <Block>
            <CreateBookingCommentCard style={{ marginTop: 100 }} myProps={handleRedirection} item={item} full />
          </Block>
        </ScrollView>
      </>
    );
  };

  return (
    <Block flex center style={styles.home}>
      {renderArticles()}
    </Block>
  );
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


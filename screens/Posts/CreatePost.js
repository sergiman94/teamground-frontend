import React from "react";
import { StyleSheet, Dimensions, ScrollView, Image } from "react-native";
import { Block, theme, Text } from "galio-framework";
import CreatePostCard from "../../components/CreatePostCard";
const { width } = Dimensions.get("screen");

export default function CreatePost(props) {
  const handleRedirection = (data) => {
    const { navigation, route } = props;
    if (data === "posted") navigation.navigate("Home", { reload: true });
  };

  const renderArticles = () => {
    const { navigation } = props;
    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
        >
          <Block>
            <CreatePostCard
              style={{ marginTop: 100 }}
              myProps={handleRedirection}
              navigation={navigation}
              full
            />
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
  verticalStyles: {
    marginTop: 8,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  horizontalImage: {
    borderRadius:5,
    height: 200,
    width: "auto"
  },
});

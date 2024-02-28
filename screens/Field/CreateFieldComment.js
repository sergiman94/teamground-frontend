import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme } from "galio-framework";
import CreateFieldCommentCard from "../../components/CreateFieldCommentCard";
const { width } = Dimensions.get("screen");

export default function CreateFieldComment (props) {
    const { navigation, route } = props;
    const item = route.params?.data;

  const handleRedirection = (data) => {
    if (data === 'posted') navigation.navigate("FieldDescription", { reload: true, field: item })
  }
  const renderArticles = () => {
    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
        >
          <Block>
            <CreateFieldCommentCard style={{ marginTop: 100 }} myProps={handleRedirection} item={item} full />
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


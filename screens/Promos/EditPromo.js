import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import { Block, theme, Text } from "galio-framework";

import { Card } from "../../components";
import matchFields from "../../constants/matchFields";
import posts from "../../constants/Posts";
import FloatingButton from "../../components/FloatingButton";
import { FloatingAction } from "react-native-floating-action";
import { argonTheme } from "../../constants/";
import PostCard from "../../components/PostCard";
import PlayerAvatar from "../../components/PlayerAvatar";

import FeedShortcuts from "../../constants/FeedShortcuts";
import FeedShortcutsComponent from "../../components/FeedShortcutsComponent";
import axios from "axios";
import { BOOKINGS_URL, FIELDS_URL, POSTS_URL } from "../../utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("screen").width;

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";

const { width } = Dimensions.get("screen");

export default function EditPromo(props) {


  const renderArticles = () => {

    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
        >
          
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

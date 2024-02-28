import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Block, theme } from "galio-framework";
import TrainingCard from "../../components/TrainingCard";
import * as Progress from "react-native-progress";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { TRAININGS_URL } from "../../utils/utils.";
import axios from "axios";
import EmptyItemsCard from "../../components/EmptyItemsCard";
const { width } = Dimensions.get("screen");

export default function TrainingHistory(props) {
  const [trainings, setTrainings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [progressBar, setProgressBar] = useState(true);
  const [emptyItems, setEmptyItems] = useState(false)

  const onRefresh = React.useCallback(() => {
    setTrainings([])
    setCurrentPage(1)
    setRefreshing(true);
    let loads = [loadTrainings()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadTrainings = async () => {
    setProgressBar(true);
    await axios.get(`${TRAININGS_URL}?page=${currentPage}&data=${props.route.params.team.key}`).then((response) => {
      setProgressBar(false);
      if (response.data.data.length) {
        setTrainings([...trainings, ...response.data.data])
      } else {
        if (currentPage === 1) setEmptyItems(true)
      }
    });
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  useEffect(() => {
    loadTrainings();
  }, [currentPage]);

  const MyLoader = () => (
    <ContentLoader
      speed={1}
      width={width}
      height={170}
      viewBox="0 -2 300 80"
      backgroundColor="#30444E"
      foregroundColor="black"
    >
      <Rect x="60" y="8" rx="3" ry="3" width="88" height="10" />
      <Rect x="60" y="26" rx="3" ry="3" width="52" height="10" />
      <Rect x="10" y="56" rx="3" ry="3" width="270" height="10" />
      <Rect x="10" y="72" rx="3" ry="3" width="270" height="10" />
      <Rect x="10" y="88" rx="3" ry="3" width="178" height="10" />
      <Circle cx="30" cy="20" r="20" />
    </ContentLoader>
  );

  const render = () => {
    return (
      <>
        {trainings.length ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.products}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                setCurrentPage(currentPage + 1);
              }
            }}
            scrollEventThrottle={400}
          >
            {progressBar ? (
              <Progress.Bar
                width={width - theme.SIZES.BASE - 20}
                indeterminate={true}
              />
            ) : (
              <></>
            )}

            <Block flex>
              {trainings && trainings.length ? (
                trainings.map((training) => (
                  <TrainingCard {...props} item={training} />
                ))
              ) : (
                <></>
              )}
            </Block>
          </ScrollView>
        ) : (
          <>
            {emptyItems ? (
              <Block style={{ paddingBottom: 600, paddingTop: 100 }}>
                <EmptyItemsCard prefix={"entrenos"} full />
              </Block>
            ) : (
              <>
                <MyLoader />
                <MyLoader />
              </>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {render()}
    </Block>
  );
}

const styles = StyleSheet.create({
  deals: {
    width,
    backgroundColor: "#22343C",
  },
  products: {
    paddingTop: 100,
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

/**
 * 
 * 
 * THIS FILE IS NOT BEING USED
 * 
 * 
 * 
 */
import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Block, theme } from "galio-framework";
import teams from "../../constants/teams";
import TeamTableCard from "../../components/TeamTableCard";
import TrainingCard from "../../components/TrainingCard";
import NextTrainings from "./NextTrainings";
import TrainingCalendar from "./TrainingCalendar";
import TrainingHistory from "./TrainingHistory";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Progress from "react-native-progress";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { TRAININGS_URL } from "../../utils/utils.";
const { width } = Dimensions.get("screen");

export default function Trainings(props) {
  const { navigation, route } = props;
  const [trainings, setTrainings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [progressBar, setProgressBar] = useState(true);

  const loadTrainings = async () => {
    setProgressBar(true);
    await axios.get(`${TRAININGS_URL}?page=${currentPage}`).then((response) => {
      setProgressBar(false);
      if (response.data.data.length > 0) {
        setTrainings([...trainings, ...response.data.data]);
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
            <MyLoader />
            <MyLoader />
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
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ScrollView, RefreshControl} from "react-native";
import { Block, theme } from "galio-framework";
import TeamTableCard from "../../components/TeamTableCard";
import axios from "axios";
import { TEAMS_URL } from "../../utils/utils.";
import * as Progress from "react-native-progress";
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'
const { width } = Dimensions.get("screen");

export default function Teams(props) {
  const { navigation, route } = props;
  const [teams, setTeams] = useState([]);
  const [progressBar, setProgressBar] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setTeams([])
    setCurrentPage(1)
    setRefreshing(true);
    let loads = [loadTeams()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadTeams = async () => {
    await axios.get(`${TEAMS_URL}?page=${currentPage}`).then((response) => {
      if (response.data.data.length > 0){
        setTeams([...teams, ...response.data.data])
      }
    })
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    );
  };

  useEffect(() => {
    props.getComponentTitle("Equipos")
  })

  useEffect(() => {
    loadTeams()
  }, []);

  useEffect(() => {
    loadTeams()
  }, [currentPage]);

  useEffect(() => {
    const { progressBar } = props;
    setProgressBar(progressBar);
  }, []);

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

  const renderProducts = () => {
    const tabId = route.params?.tabId;
    return (
      <>
        {teams.length ? (
          <>
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

              {tabId && tabId === "myteams" ? (
                <Block flex>
                  {teams.length < 0 ? (
                    <></>
                  ) : (
                    teams.map((product) => (
                      <TeamTableCard {...props} item={product} horizontal />
                    ))
                  )}
                </Block>
              ) : (
                <Block flex>
                  {teams.length < 0 ? (
                    <></>
                  ) : (
                    teams.map((product) => (
                      <TeamTableCard {...props} item={product} horizontal />
                    ))
                  )}
                </Block>
              )}
            </ScrollView>
          </>
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
      {renderProducts()}
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

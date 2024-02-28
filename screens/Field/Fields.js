import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ScrollView, RefreshControl } from "react-native";
import { Block, theme } from "galio-framework";
import FieldCard from "../../components/FieldCard";
import axios from "axios";
import { FIELDS_URL } from "../../utils/utils.";
import * as Progress from "react-native-progress";
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'
import EmptyItemsCard from "../../components/EmptyItemsCard";
const { width } = Dimensions.get("screen");

export default function Fields(props) {
  const [progressBar, setProgressBar] = useState(true);
  const [fields, setFields] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyItems, setEmptyItems] = useState(false)
  
  const onRefresh = React.useCallback(() => {
    setFields([])
    setCurrentPage(1)
    setRefreshing(true);
    let loads = [loadFields()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadFields = async () => {
    setProgressBar(true);
    await axios.get(`${FIELDS_URL}?page=${currentPage}`).then((response) => {
      setProgressBar(false);
      if (response.data.data.length > 0) {
        setFields([...fields, ...response.data.data]);
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
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    );
  };

  useEffect(() => {
    props.getComponentTitle("Canchas")
  })

  useEffect(() => {
    loadFields()
  }, [])

  useEffect(() => {
    loadFields();
  }, [currentPage]);


  useEffect(() => {
    const { progressBar } = props;
    setProgressBar(progressBar);
  }, []);

  const MyLoader = () => (
    <ContentLoader
      speed={1}
      width={360} height={440}
      viewBox="0 10 380 460"
      backgroundColor="#30444E"
      foregroundColor="black"
    >
      <Rect x="0" y="40" rx="2" ry="0" width="400" height="400" />
    </ContentLoader>
  );

  const renderProducts = () => {
    return (
      <>
        {fields.length ? (
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

              <Block flex>
                {fields && fields.length > 0 ? (
                  fields.map((product) => <FieldCard item={product} full />)
                ) : (
                  <></>
                )}
              </Block>
            </ScrollView>
          </>
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
      {renderProducts()}
    </Block>
  );
}

const styles = StyleSheet.create({
  deals: {
    backgroundColor: "#22343C",
    width,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

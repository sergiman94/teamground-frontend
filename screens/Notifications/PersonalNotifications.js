import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Block } from "galio-framework";
import { Notification } from "../../components";
import { argonTheme } from "../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { NOTIFICATIONS_URL, formatTime } from "../../utils/utils.";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
const { width } = Dimensions.get("screen");

export default function PersonalNotifications(props) {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyItems, setEmptyItems] = useState(false);

  const onRefresh = useCallback(() => {
    setNotifications([]);
    setCurrentPage(1);
    setRefreshing(true);
    let loads = [loadNotifications()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadNotifications = async () => {
    let userID = await AsyncStorage.getItem("@user_id");
    if (userID) {
      await axios
        .get(`${NOTIFICATIONS_URL}/${userID}?page=${currentPage}`)
        .then((response) => {
          if (response.data.data.length > 0) {
            let existingNotifications = response.data.data
            setNotifications([...notifications, ...existingNotifications]);
            let allNotifications = [...notifications, ...existingNotifications]
            let updates = []
            for (let i = 0; i < allNotifications.length; i++) {
              const notification = allNotifications[i];
              updates.push(axios.put(`${NOTIFICATIONS_URL}/read/${notification.key}`))
            }
            if (updates.length) Promise.allSettled(updates)
          } else {
            if (currentPage === 1) setEmptyItems(true);
          }
        });
    } else {
      setEmptyItems(true);
    }
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
    loadNotifications();
    //updateNotifications()
  }, []);

  useEffect(() => {
    loadNotifications();
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

  return (
    <Block style={styles.container} middle flex>
      <Block flex style={{ width: "90%" }}>
        {notifications.length ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
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
              {notifications.map((notification) => (
                <Notification
                  time={formatTime(notification.timestamp)}
                  body={notification.title}
                  iconName={notification.iconName}
                  iconFamily="font-awesome"
                  style={{ marginTop: 15 }}
                />
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            {emptyItems ? (
              <></>
            ) : (
              <>
                <MyLoader />
              </>
            )}
          </>
        )}
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
  },
});

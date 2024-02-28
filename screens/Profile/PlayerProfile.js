import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  RefreshControl,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Button } from "../../components";
import { Images, argonTheme } from "../../constants";
import { HeaderHeight } from "../../constants/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { MATCHES_URL, POSTS_URL, USERS_URL } from "../../utils/utils.";
import * as Progress from "react-native-progress";
import PostCard from "../../components/PostCard";
import Tabs from "../../components/Tabs";
import MatchCard from "../../components/MatchCard";
const { width, height } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;

// TODO: set snackbar when is an error loading
export default function PlayerProfile(props) {
  const { navigation, route } = props;
  const [data, setData] = useState(route.params?.playerProfile);
  const [userId, setUserID] = useState(route.params?.playerProfile?.owner ? route.params?.playerProfile?.owner : route.params?.playerProfile.key);
  const [userPosts, setUserPosts] = useState([]);
  const [canEditProfile, setCanEditProfile] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const [postcurrentPage, setPostCurrentPage] = useState(1);
  const [mediaCurrentPage, setMediaCurrentPage] = useState(1)
  const [matchescurrentPage, setMatchesCurrentPage] = useState(1);
  const [progressBar, setProgressBar] = useState(false);
  const [userMedia, setUserMedia] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [tabId, setTabId] = useState("");
  const [reload, setReload] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadProfile(), loadProfilePosts()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadProfile = async () => {
    let user = (await axios.get(`${USERS_URL}/${userId}`)).data;
    setData(user.data);
  };

  const loadMedia = async () => {
    setProgressBar(true)
    let userId = await AsyncStorage.getItem("@user_id")
    let userMediaData = await axios
      .get(`${POSTS_URL}/owner/${userId}?page=${mediaCurrentPage}`)
      .then((response) => {
        setProgressBar(false);
        return response.data.data.filter(post => post.image);
      });

    if (userMediaData.length > 0) {
      setUserMedia([...userMedia, ...userMediaData]);
    }
  };

  const loadUserMatches = async () => {
    //setProgressBar(true)
    let userMatchesData = await axios
      .get(`${MATCHES_URL}/user/${userId}?page=${matchescurrentPage}`)
      .then((response) => response.data.data);
    if (userMatchesData.length > 0) {
      setProgressBar(false);
      setUserMatches([...userMatches, ...userMatchesData]);
    }
  };

  const loadProfilePosts = async () => {
    //setProgressBar(true)
    let userPostsData = await axios
      .get(`${POSTS_URL}/owner/${userId}?page=${postcurrentPage}`)
      .then((response) => response.data.data);

    if (userPostsData.length > 0) {
      setProgressBar(false);
      setUserPosts([...userPosts, ...userPostsData]);
    }
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

  const handleLikeButton = (data) => {
    if (data === "reload") setReload(true);
  };

  const handleEdit = () => {
    navigation.navigate("EditProfile", { item: data });
  };

  const renderTabs = () => {
    const { navigation } = props;

    let tabs = [
      {
        id: "posts",
        title: "Posts",
      },
      {
        id: "media",
        title: "Media",
      },
      {
        id: "matches",
        title: "Partidos",
      },
    ];

    let tabIndex = 0;

    const defaultTab = tabs && tabs[0] && tabs[0].id;

    if (!tabs) return null;

    return (
      <Tabs
        transparent
        data={tabs || []}
        initialIndex={tabIndex || defaultTab}
        onChange={(id) => navigation.setParams({ tabId: id })}
      />
    );
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    loadProfilePosts();
    loadProfile();
    loadMedia();
    setReload(false);
  }, [reload]);

  useEffect(() => {
    setTabId(route.params?.tabId);
  });

  useEffect(() => {
    loadProfilePosts();
  }, [postcurrentPage]);

  useEffect(() => {
    loadUserMatches();
  }, [matchescurrentPage]);

  useEffect(() => {
    loadMedia();
  }, [mediaCurrentPage]);

  return (
    <Block flex style={styles.profile}>
      {progressBar ? (
        <Progress.Bar width={width} indeterminate={true} />
      ) : (
        <></>
      )}
      <Block flex>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              if (tabId === "posts") {
                setPostCurrentPage(postcurrentPage + 1);
              } else if (tabId === "matches") {
                setMatchesCurrentPage(matchescurrentPage + 1);
              } else if (tabId === "media") {
                setMediaCurrentPage(mediaCurrentPage + 1);
              }
            }
          }}
          scrollEventThrottle={400}
        >
          {/* basic header info */}
          <Block flex style={styles.profileCard}>
            {/* Profile Image */}
            <Block middle style={styles.avatarContainer}>
              <Image
                source={
                  data && data.image
                    ? { uri: data.image }
                    : Images.ProfilePicture
                }
                style={styles.avatar}
              />
            </Block>

            {/* username */}
            <Block style={styles.info}>
              <Block
                middle
                row
                space="evenly"
                style={{ marginTop: 4, paddingBottom: 0 }}
              >
                <Text
                  style={{ fontFamily: "open-sans-regular" }}
                  size={20}
                  color="#96A7AF"
                >
                  {data && data.username ? `@${data.username}` : " - "}
                </Text>
              </Block>

              {/* follow and contact buttons */}
              <Block
                middle
                row
                space="evenly"
                style={{ marginTop: 8, paddingBottom: 24 }}
              >
              </Block>

              <Block flex>
                <Block middle style={styles.nameInfo}>
                  <Text
                    style={{ fontFamily: "open-sans-regular" }}
                    size={28}
                    color="#ffffff"
                  >
                    {data && data.displayName ? data.displayName : " - "}
                  </Text>
                  <Text
                    size={16}
                    color="#ffffff"
                    style={{ marginTop: 10, fontFamily: "open-sans-light" }}
                  >
                    {data && data.cityAndStatelocation
                      ? data.cityAndStatelocation
                      : " - "}
                  </Text>
                </Block>
                <Block middle>
                  <Text
                    size={16}
                    color="#FFFFFF"
                    style={{
                      textAlign: "center",
                      fontFamily: "open-sans-regular",
                    }}
                  >
                    {data && data.description
                      ? data.description
                      : " No hay descripcion "}
                  </Text>
                </Block>
              </Block>

              <Block row space="between" style={{ marginTop: 30 }}>
                <Block middle>
                  <Text
                    size={18}
                    color="#FFFFFF"
                    style={{ marginBottom: 4, fontFamily: "open-sans-bold" }}
                  >
                    {data && data.preferedPosition
                      ? data.preferedPosition
                      : " - "}
                  </Text>
                  <Text
                    style={{ fontFamily: "open-sans-regular" }}
                    size={12}
                    color={argonTheme.COLORS.WHITE}
                  >
                    Posición
                  </Text>
                </Block>
                <Block middle>
                  <Text
                    color="#FFFFFF"
                    size={18}
                    style={{ marginBottom: 4, fontFamily: "open-sans-bold" }}
                  >
                    {data && data.matches ? data.matches.length : " - "}
                  </Text>
                  <Text
                    style={{ fontFamily: "open-sans-regular" }}
                    size={12}
                    color={argonTheme.COLORS.WHITE}
                  >
                    Partidos creados
                  </Text>
                </Block>
              </Block>
            </Block>
          </Block>

          {/* Render tabs */}
          <Block style={styles.tabsContainer}>{renderTabs()}</Block>

          {/* Render user post - user media - user matches */}
          {tabId && tabId === "posts" ? (
            <Block style={styles.posts}>
              {userPosts ? (
                userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <Block>
                      <PostCard item={post} myProps={handleLikeButton} full />
                    </Block>
                  ))
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
            </Block>
          ) : tabId && tabId === "media" ? (
            <Block style={styles.posts}>
              {userMedia ? (
                userMedia.length > 0 ? (
                  userMedia.map((post) => (
                    <Block>
                      <PostCard item={post} myProps={handleLikeButton} full />
                    </Block>
                  ))
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
            </Block>
          ) : tabId && tabId === "matches" ? (
            <Block style={styles.posts}>
              {userMatches ? (
                userMatches.length > 0 ? (
                  userMatches.map((match) => (
                    <Block>
                      <MatchCard item={match} horizontal />
                    </Block>
                  ))
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
            </Block>
          ) : (
            <></>
          )}
        </ScrollView>
        {/* </ImageBackground> */}
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
    flex: 1,
  },
  profileContainer: {
    width: width,
    height: height,
    padding: 0,
  },
  profileBackground: {
    width: width,
    height: height / 2,
  },
  tabsContainer: {
    marginLeft: 20,
    marginTop: 20,
  },
  profileCard: {
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#30444E",
    zIndex: 2,
  },

  posts: {
    padding: theme.SIZES.BASE,
  },

  profilePostContainer: {
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: 65,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: theme.COLORS.WHITE,
    zIndex: 2,
  },

  info: {
    paddingHorizontal: 40,
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
  },
  nameInfo: {
    marginTop: 0,
  },
  divider: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
});

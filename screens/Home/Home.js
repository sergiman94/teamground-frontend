import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  FlatList,
  StatusBar,
  View,
  TouchableOpacity
} from "react-native";
import { Block, theme, Text, Button } from "galio-framework";
import { FloatingAction } from "react-native-floating-action";
import { argonTheme } from "../../constants/";
import PostCard from "../../components/PostCard";
import SnackBar from "react-native-snackbar-component";
import FeedShortcuts from "../../constants/FeedShortcuts";
import FeedShortcutsComponent from "../../components/FeedShortcutsComponent";
import axios from "axios";
import {BottomSheet} from 'react-native-btr'
import {
  BOOKINGS_URL,
  FIELDS_URL,
  MATCHES_URL,
  POSTS_URL,
} from "../../utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";
import {
  LineChart,
  ProgressChart,
} from "react-native-chart-kit";
const { width } = Dimensions.get("screen");
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'
import FieldHomeCard from "../../components/FieldHomeCard";
import MatchCard from "../../components/MatchCard";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
const cardWidth = width - theme.SIZES.BASE * 2;

export default function Home(props) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Ago",
    "Sept",
    "Oct",
    "Nov",
    "Dic",
  ];
  const mockLineChartData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
      },
    ],
  };
  const mockRingData = {
    labels: ["✅", "❌", "🗒️"], // optional
    data: [0, 0, 0],
  };
  const { navigation, route } = props;
  const [reload, setReload] = useState(
    props.reload ? props.reload : null
  );
  const [feedData, setFeedData] = useState([]);
  const [role, setRole] = useState("player");
  const [lineChartData, setLineChartData] = useState(mockLineChartData);
  const [ringData, setRingData] = useState(mockRingData);
  const [lineChartMonths, setLineChartMonths] = useState([]);
  const [approvedMatches, setApprovedMatches] = useState(0);
  const [rejectedMatches, setRejectedMatches] = useState(0);
  const [pendingMatches, setPendingMatches] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(
    route.params ? route.params.created : false
  );
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "Se ha creado el partido exitosamente ! "
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldsCurrentPage, setFieldsCurrentPage] = useState(1)
  const [matchesCurrentPage, setMatchesCurrentPage] = useState(1)
  const [refreshing, setRefreshing] = React.useState(false);
  const [videosOnScreen, setVideosOnScreen] = useState([])
  const [toggleVisible, setToggleVisible] = useState(false)
  const [optionsItemKey, setOptionsItemKey] = useState(null)
  const [progressBar, setProgressBar] = useState(false);
  const [fields, setFields] = useState([])
  const [matches, setMatches] = useState([])

  const loadFeed = async () => {
    let url = `${POSTS_URL}?page=${currentPage}`;
    await axios.get(url).then((response) => {
      if (response.data.data.length > 0) {
        setFeedData([...feedData, ...response.data.data]);
      }
    });
  };

  // matches
  const loadMatches = async () => {
    setProgressBar(true)
    /** get matches from db */
    await axios.get(`${MATCHES_URL}?page=${currentPage}`).then(response => {
      setProgressBar(false)
      if (response.data.data.length > 0) {
        setMatches([...matches, ...response.data.data])
      }
    })
  };

  // fields 
  const loadFields = async () => {
    setProgressBar(true)
    /** get fields from db */
    await axios.get(`${FIELDS_URL}?page=${fieldsCurrentPage}`).then(response => {
      setProgressBar(false)
      if (response.data.data.length > 0) {
        setFields([...fields, ...response.data.data])
      }  
    })
    
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1)
    setMatches([])
    setFields([]) 
    let loads = [loadFields(), loadMatches()]
    Promise.allSettled(loads).then(setRefreshing(false))
    //setFeedData([])
    // loadFeed().then(() => {
    //   setRefreshing(false);
    // });
  }, []);

  const loadRole = async () => {
    let role = await AsyncStorage.getItem("@user_role");
    if (role) {
      setRole(role)
      props.refresh(role)
    } else {
      props.refresh("player")
      setRole("player")
    }
  };

  const loadLineChartAnalytics = async () => {
    let role = await AsyncStorage.getItem("@user_role");

    if (role === "field") {
      try {
        let fieldId = await AsyncStorage.getItem("@field_id");
        // get matches from field
        await axios
          .get(`${FIELDS_URL}/${fieldId}`)
          .then(async (response) => {
            let matches = response.data.data.matches
            let date = new Date();
            let month = date.getMonth();
            let lastMonths = []

            for (let i = 0; i < 6; i++) {
              const index = (month - i + 12) % 12;
              lastMonths.push(months[index]);
            }

            let monthsData = [0, 0, 0, 0, 0, 0]
            for (let i = 0; i < matches.length; i++) {
              const match = (await axios.get(`${MATCHES_URL}/${matches[i]}`)).data.data
              const matchIndex = new Date(match.timestamp * 1000).getMonth() - 1 
              monthsData[matchIndex] = monthsData[matchIndex] + 1
            }

            let lineData = {
              labels: lastMonths.reverse(),
              datasets: [
                {
                  data: monthsData.reverse(),
                },
              ],
            }
            setLineChartData(lineData);
          })
          .catch((error) => {
            throw error 
          });

        // get bookings
        await axios.get(`${BOOKINGS_URL}/field/${fieldId}`).then((response) => {
          let matches = response.data.data;

          let pendingMatches = matches.filter(
            (value) => value.confirmedAction === false
          ).length;
          let approvedMatches = matches.filter(
            (value) =>
              value.confirmedAction === true && value.confirmed === true
          ).length;
          let rejectedMatches = matches.filter(
            (value) =>
              value.confirmedAction === true && value.confirmed === false
          ).length;
          setPendingMatches(Math.abs(pendingMatches / 100));
          setApprovedMatches(Math.abs(approvedMatches / 100));
          setRejectedMatches(Math.abs(rejectedMatches / 100));

          const rData = {
            labels: ["✅", "❌", "🗒️"], // optional
            data: [
              Math.abs(approvedMatches / 100),
              Math.abs(rejectedMatches / 100),
              Math.abs(pendingMatches / 100),
            ],
          };

          setRingData(rData);
        });
      } catch (error) {
        console.log("error setting lineChartAnalytics");
        console.log(error)
      }
    } else if (role === "admin") {
      // get matches from field
      await axios
        .get(`${MATCHES_URL}`)
        .then((response) => {
          let matches = response.data.data;
          let date = new Date();
          let month = date.getMonth() + 1;
          let lastMonths = months.slice(Number(month) - 6, Number(month));

          let monthsData = lastMonths.map((value) => {
            let matchesCount = 0;
            for (let i = 0; i < matches.length; i++) {
              const match = matches[i];
              let date = new Date(Number(match.timestamp) * 1000);
              if (value === months[Number(date.getMonth())]) {
                matchesCount++;
              }
            }
            return matchesCount;
          });

          let lineData = {
            labels: lastMonths,
            datasets: [
              {
                data: monthsData,
              },
            ],
          };
          setLineChartData(lineData);
        })
        .catch((error) => {
          console.log(error);
        });

      // get bookings
      await axios.get(`${BOOKINGS_URL}`).then((response) => {
        let matches = response.data.data;
        let pendingMatches = matches.filter(
          (value) => value.confirmedAction === false
        ).length;
        let approvedMatches = matches.filter(
          (value) => value.confirmedAction === true && value.confirmed === true
        ).length;
        let rejectedMatches = matches.filter(
          (value) => value.confirmedAction === true && value.confirmed === false
        ).length;
        setPendingMatches(Math.abs(pendingMatches / 100));
        setApprovedMatches(Math.abs(approvedMatches / 100));
        setRejectedMatches(Math.abs(rejectedMatches / 100));

        const rData = {
          labels: ["✅", "❌", "🗒️"], // optional
          data: [
            Math.abs(approvedMatches / 100),
            Math.abs(rejectedMatches / 100),
            Math.abs(pendingMatches / 100),
          ],
        };

        setRingData(rData);
      });
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

  useEffect(() => {
    loadRole();
    props.getComponentTitle("Home")
  });

  // load matches at initialization
  useEffect(() => {
    loadMatches()
    loadFields()
  }, [])

  // // load matches for next page
  // useEffect(() => {
  //   loadMatches()
  // }, [currentPage])

  // // load fields for next page
  // useEffect(() => {
  //   loadFields()
  // }, [fieldsCurrentPage])


  useEffect(() => { 
    loadLineChartAnalytics()
  }, [role])

  useEffect(() => {
    loadFeed();
  }, [currentPage]);

  useEffect(() => {
    loadRole()
    loadFeed();
    setReload(null);
  }, [reload, props.reload]);

  useEffect(() => {
    setTimeout(() => {
      setShowSnackbar(false);
    }, 2000);
  }, [showSnackbar]);

  const handleFloatingAction = async (name) => {
    let userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      if (name === "create_post") {
        const { navigation, route } = props;
        navigation.navigate("CreatePost");
      } else if (name === "create_match") {
        const { navigation, route } = props;
        navigation.navigate("CreateMatch");
      }
    } else {
      navigation.navigate("AuthenticationHandler")
    }
  };

  const chartConfig = {
    backgroundColor: "#30444E",
    backgroundGradientFrom: "#30444E",
    backgroundGradientTo: "#30444E",
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 20,
    },
    propsForDots: {
      r: "1",
      strokeWidth: "2",
      stroke: "#FFFFFF",
    },
  }

  const renderSocialMedia = () => {
    const playerActions = [
      {
        text: "Crear Post",
        icon: require("../../assets/imgs/icons/create_post_icon.png"),
        name: "create_post",
        color: "#3DD598", 
        position: 2,
      },
      {
        text: "Crear partido",
        icon: require("../../assets/imgs/icons/field_icon.png"),
        name: "create_match",
        color: "#3DD598", 
        position: 1,
      },
    ];

    const fieldActions = [
      {
        text: "Crear partido",
        icon: require("../../assets/imgs/icons/field_icon.png"),
        name: "create_match",
        color: "#3DD598", 
        position: 1,
      },
    ];

    const actions = role !== "player" ? fieldActions : playerActions;

    const handleLikeButton = (data) => {
      if (data === "reload") setReload(true);
    };

    const toggleBottomNavigationView = () => {
      setToggleVisible(!toggleVisible)
    }

    const handleOptionsButton = (data) => {
      toggleBottomNavigationView()
      setOptionsItemKey(data)
    }

    const handleFeedEnd = () => {
      setCurrentPage(currentPage + 1);
    }

    const renderPostCard = ({item}) => {
      // TODO: take this as a reference for future features, we are detecting if video is showing or not
      let canPlay = videosOnScreen.filter(video => video.item.key === item.key).length > 0
      return (
        <Block>
          <PostCard item={item} canPlay={canPlay} myProps={handleLikeButton} options={handleOptionsButton} full />
        </Block>
      );
    };

    const onViewCallBack = React.useCallback((itemsOnScreen) => {
      let viewableItems = itemsOnScreen.viewableItems
      let viewableVideos = viewableItems.filter(item => item.item.video)
      setVideosOnScreen(viewableVideos)
    }, []); 

    const viewConfigRef = React.useRef({
      viewAreaCoveragePercentThreshold: 5,
    });

    const handlePostDelete = async () => {
      setProgressBar(true);
      await axios
        .delete(`${POSTS_URL}/${optionsItemKey}`)
        .then(() => {
          setReload(true);
          setProgressBar(false);
          setShowSnackbar(true);
          setSnackbarMessage("Post eliminado");
          setReload(true);
          setTimeout(() => {
            setShowSnackbar(false);
          }, 10000);
        })
        .catch((e) => {
          setShowSnackbar(true);
          setSnackbarColor("#BB6556");
          setSnackbarMessage("No se pudo eliminar el post");
          setTimeout(() => {
            setShowSnackbar(false);
          }, 1500);
        });
      setToggleVisible(false)
    };

    const hardcodedShortucts = () => {
      return (
        <>
          {/* hardcoded shortcut items  */}
          {role && role === "player" ? (
            <Block styles={{ padding: theme.SIZES.BASE / 2 }} row>
              <FeedShortcutsComponent item={FeedShortcuts[0]} />
              <FeedShortcutsComponent item={FeedShortcuts[1]} />
              <FeedShortcutsComponent item={FeedShortcuts[2]} />
              {/** this -promos- section is not yet ready */}
              <FeedShortcutsComponent item={FeedShortcuts[3]} />
            </Block>
          ) : (
            <></>
          )}
        </>
      );
    };

    return (
      <>
        <StatusBar barStyle={"light-content"} />
        <SnackBar
          visible={showSnackbar}
          position={"top"}
          backgroundColor={snackbarColor}
          textMessage={snackbarMessage}
        />
        {role && role === "player" ? (
          <>
            {feedData.length ? (
              <>
                <FlatList
                  contentContainerStyle={styles.articles}
                  onViewableItemsChanged={onViewCallBack}
                  viewabilityConfig={viewConfigRef.current}
                  data={feedData}
                  renderItem={renderPostCard}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) => `${index}-${item.title}`}
                  onEndReachedThreshold={0.2}
                  onEndReached={handleFeedEnd}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />

                <BottomSheet
                  visible={toggleVisible}
                  onBackButtonPress={toggleBottomNavigationView}
                  onBackdropPress={toggleBottomNavigationView}
                >
                  <View style={styles.bottomNavigationView}>
                    {progressBar ? (
                      <Progress.Bar
                        style={{ marginTop: 0 }}
                        width={width - 80}
                        indeterminate={true}
                      />
                    ) : (
                      <></>
                    )}
                    <View
                      style={{
                        flex: 0,
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        style={styles.bottomNavigationItem}
                        flex
                        row
                        onPress={() => {
                          handlePostDelete();
                        }}
                      >
                        <Button
                          round
                          onlyIcon
                          shadowless
                          icon="trash"
                          iconFamily="Font-Awesome"
                          iconColor={theme.COLORS.WHITE}
                          iconSize={theme.SIZES.BASE * 1.0}
                          color={"#FF565E"}
                          onPress={() => console.log("hello")}
                        />
                        <Text
                          style={{
                            marginTop: 20,
                            fontFamily: "open-sans-regular",
                          }}
                          size={14}
                          color={argonTheme.COLORS.WHITE}
                        >
                          Eliminar post
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BottomSheet>
              </>
            ) : (
              <>
                <MyLoader />
                <MyLoader />
                <MyLoader />
                <MyLoader />
                <MyLoader />
              </>
            )}
          </>
        ) : (
          <ScrollView
            contentContainerStyle={styles.fieldRoleContainer}
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
            {/* booking history */}
            <Text
              style={{
                marginBottom: 20,
                marginRight: 12,
                marginTop: 20,
                fontFamily: "open-sans-bold",
              }}
              size={24}
              color={argonTheme.COLORS.WHITE}
            >
              Historial Reservas
            </Text>

            {/* Graphs */}
            <LineChart
              data={lineChartData}
              width={Dimensions.get("screen").width - theme.SIZES.BASE * 2} // from react-native
              height={220}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 12,
              }}
            />

            <Text
              style={{
                marginTop: 20,
                marginBottom: 8,
                marginRight: 12,
                fontFamily: "open-sans-bold",
              }}
              size={20}
              color={argonTheme.COLORS.WHITE}
            >
              Detalle Reservas
            </Text>

            <Text
              style={{
                marginTop: 4,
                marginBottom: 12,
                marginRight: 12,
                fontFamily: "open-sans-regular",
              }}
              size={12}
              color={argonTheme.COLORS.WHITE}
            >
              ✅ Aprobados ❌ Rechazados 🗒️ Pendientes
            </Text>

            <ProgressChart
              data={ringData}
              width={Dimensions.get("screen").width - theme.SIZES.BASE * 2}
              height={220}
              strokeWidth={8}
              radius={16}
              style={{ borderRadius: 12 }}
              chartConfig={chartConfig}
              hideLegend={false}
            />
          </ScrollView>
        )}
        <FloatingAction
          actions={actions}
          style={styles.floatinBtn}
          onPressItem={(name) => handleFloatingAction(name)}
          color={"#3DD598"}
        />
      </>
    );
  };

  const renderHorizontalItems = () => {
    return (
      <>
        {matches.length && fields.length ? (
          <>
            <Text
              style={styles.itemTitles}
              size={28}
              color={argonTheme.COLORS.WHITE}
            >
              Canchas
            </Text>

            {fields.length ? (
              <Block flex style={styles.group}>
                <Block flex>
                  <Block flex style={{ marginTop: theme.SIZES.BASE / 2 }}>
                    <ScrollView
                      horizontal={true}
                      pagingEnabled={false}
                      decelerationRate={0}
                      scrollEventThrottle={16}
                      snapToAlignment="center"
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={cardWidth - 150}
                    >
                      {fields.map((item, index) => (
                        <TouchableWithoutFeedback
                          onPress={() => {
                            navigation.navigate("FieldDescription", {
                              field: item,
                            });
                          }}
                        >
                          <FieldHomeCard item={item} {...props} />
                        </TouchableWithoutFeedback>
                      ))}
                    </ScrollView>
                  </Block>
                </Block>
              </Block>
            ) : (
              <></>
            )}

            <Text
              style={[styles.itemTitles, { marginTop: 8 }]}
              size={28}
              color={argonTheme.COLORS.WHITE}
            >
              Partidos
            </Text>

            {matches.length ? (
              <Block flex style={styles.group}>
                <Block flex>
                  <Block flex style={{ marginTop: theme.SIZES.BASE / 2 }}>
                    <ScrollView
                      horizontal={true}
                      pagingEnabled={true}
                      decelerationRate={0}
                      scrollEventThrottle={16}
                      snapToAlignment="center"
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={cardWidth - 20}
                    >
                      {matches.map((item, index) => (
                        <TouchableWithoutFeedback
                          onPress={() => {
                            navigation.navigate("Match", { match: item });
                          }}
                        >
                          <MatchCard item={item} horizontal home {...props} />
                        </TouchableWithoutFeedback>
                      ))}
                    </ScrollView>
                  </Block>
                </Block>
              </Block>
            ) : (
              <></>
            )}
          </>
        ) : (
          <>
            <MyLoader />
            <MyLoader />
            <MyLoader />
            <MyLoader />
          </>
        )}
      </>
    );
  };

  const renderItems = () => {
    const actions = [
      {
        text: "Crear partido",
        icon: require("../../assets/imgs/icons/field_icon.png"),
        name: "create_match",
        color: "#3DD598", 
        position: 1,
      },
    ];

    return (
      <>
        <StatusBar barStyle={"light-content"} />
        <SnackBar
          visible={showSnackbar}
          position={"top"}
          backgroundColor={snackbarColor}
          textMessage={snackbarMessage}
        />
        {role && role === "player" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
          {renderHorizontalItems()}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.fieldRoleContainer}
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
            {/* booking history */}
            <Text
              style={{
                marginBottom: 20,
                marginRight: 12,
                marginTop: 20,
                fontFamily: "open-sans-bold",
              }}
              size={24}
              color={argonTheme.COLORS.WHITE}
            >
              Historial Reservas
            </Text>

            {/* Graphs */}
            <LineChart
              data={lineChartData}
              width={Dimensions.get("screen").width - theme.SIZES.BASE * 2} // from react-native
              height={220}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 12,
              }}
            />

            <Text
              style={{
                marginTop: 20,
                marginBottom: 8,
                marginRight: 12,
                fontFamily: "open-sans-bold",
              }}
              size={20}
              color={argonTheme.COLORS.WHITE}
            >
              Detalle Reservas
            </Text>

            <Text
              style={{
                marginTop: 4,
                marginBottom: 12,
                marginRight: 12,
                fontFamily: "open-sans-regular",
              }}
              size={12}
              color={argonTheme.COLORS.WHITE}
            >
              ✅ Aprobados ❌ Rechazados 🗒️ Pendientes
            </Text>

            <ProgressChart
              data={ringData}
              width={Dimensions.get("screen").width - theme.SIZES.BASE * 2}
              height={220}
              strokeWidth={8}
              radius={16}
              style={{ borderRadius: 12 }}
              chartConfig={chartConfig}
              hideLegend={false}
            />
          </ScrollView>
        )}
        <FloatingAction
          actions={actions}
          style={styles.floatinBtn}
          onPressItem={(name) => handleFloatingAction(name)}
          color={"#3DD598"}
        />
      </>
    );
  }

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
    <Block flex center style={styles.home}>
      {/* {renderSocialMedia()} */}
      {renderItems()}
    </Block>
  );
}

const styles = StyleSheet.create({
  home: {
    backgroundColor: "#22343C", 
    width: width,
  },
  articles: {
    width: width,
    paddingHorizontal: 2,

  },
  contentLoader: {
    paddingHorizontal: 2
  },
  fieldRoleContainer: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  itemsContainer: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  floatinBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#3DD598"
  },
  bottomNavigationView: {
    backgroundColor: '#22343C',
    width: '100%',
    height: 150,
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 28 
  },
  bottomNavigationItem: {
    flexDirection: 'row',
    backgroundColor: '#30444E',
    borderRadius: 13, 
    padding: 8, 
    width: 330,
    marginBottom: 5
  },
  itemTitles: { 
    left: 12,
    fontFamily: "open-sans-bold",
    top: 16
  },
  fieldsContainer: {
    marginTop: 20
  },
  group: {
    paddingTop: theme.SIZES.BASE,
  },
});

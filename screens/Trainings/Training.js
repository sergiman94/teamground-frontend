import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView, Share, RefreshControl, FlatList, Image} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { argonTheme } from "../../constants";
import { Button, Icon } from "../../components/";
const { width } = Dimensions.get("screen");
import * as Progress from 'react-native-progress';
import SnackBar from 'react-native-snackbar-component'
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTime, TRAININGS_URL, USERS_URL } from "../../utils/utils.";
import ProfileTrainingDescriptionMiniature from "../../components/ProfileTrainingDescriptionMiniature";

export default function Training (props) {
  const { navigation, route } = props;
  const share_base_url = "https://teamground.web.app/confirm-training?"
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Hello')
  const [snackbarColor, setSnackbarColor] = useState('#93C46F')
  const [titleMarginTop, setTitleMarginTop] = useState(0)
  const [joined, setJoined] = useState(false)
  const [training, setTraining] = useState(route.params?.training)
  const [coach, setCoach] = useState(route.params?.coach)
  const [location, setLocation] = useState(route.params?.location)
  const [trainingHost, setTrainingHost] = useState(false)
  const [role, setRole] = useState(null)
  const [trainingCanceled, setTrainingCanceled] = useState(route.params?.training.status === "canceled" ? "CANCELADO" : null)
  const [trainingOutdated, setTrainingOutdated] = useState(route.params?.training.status === "outdated" ? "OUTDATED" : null)
  const [refreshing, setRefreshing] = useState(false);
  const [trainingHostData, setTrainingHostData] = useState(null)
  const [trainingPlayers, setTrainingPlayers] = useState([])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadTraining(), loadUserConfirmed(), loadRole()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadTraining = async () => {
    let myTraining = (await axios.get(`${TRAININGS_URL}/${training.key}`)).data
    setTraining(myTraining.data)
  }

  const loadTrainingPlayers = async () => {
    let requests = []
    for (let i = 0; i < training.players.length; i++) {
      const trainingPlayerKey = training.players[i];
      requests.push((await axios.get(`${USERS_URL}/${trainingPlayerKey}`)).data)
    }
    let playersData = (await Promise.allSettled(requests)).flatMap(result => result.value ? result.value.data : null)
    setTrainingPlayers(playersData)
  } 

  const loadTrainingHostData = async () => {
    let tHostData = (await axios.get(`${TRAININGS_URL}/${training.coach}`)).data
    setTrainingHostData(tHostData.data)
  }

  const loadUserConfirmed = async () => {
    let userID = await AsyncStorage.getItem('@user_id')
    if (userID === training.coach) {
      setTrainingHost(true)
    } else {
      training.players.map(player => {
        if (player === userID) setJoined(true)
      })
    }
  }

  const loadRole = async () => {
    let role = AsyncStorage.getItem('@user_role')
    setRole(role)
  }

  useEffect(() => {
    loadRole()
    loadUserConfirmed()
    loadTrainingHostData()
    loadTrainingPlayers()
  }, [])

  const handleJoinButton = async (training) => {
    let userID = await AsyncStorage.getItem("@user_id");
    if (userID) {
      setShowProgressBar(true);

      let body = {
        newPlayerId: userID,
      };

      if (trainingHost) {
        /** FOR TRAINING HOST */
        await axios
          .put(`${TRAININGS_URL}/cancel/${training.key}`, body)
          .then(async (res) => {
            loadTraining();
            loadUserConfirmed();
            loadTrainingHostData()
            loadTrainingPlayers()

            setShowProgressBar(false);
            setSnackbarMessage("Has cancelado este partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);

            setTrainingCanceled("CANCELADO");
          })
          .catch((error) => {
            console.log(error);
            setShowProgressBar(false);
            setSnackbarColor("#BB6556");
            setSnackbarMessage("No fue posible cancelar el partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);
          });

        setTimeout(() => {
          setShowSnackbar(false);
          setTitleMarginTop(0);
        }, 2500);
      } else if (joined) {
        /*** FOR PLAYER JOINED */
        await axios
          .put(`${TRAININGS_URL}/leave/${training.key}`, body)
          .then(async (res) => {
            loadTraining();
            loadUserConfirmed();
            loadTrainingHostData()
            loadTrainingPlayers()

            setShowProgressBar(false);
            setSnackbarMessage("te has salido de este partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);

            training.players = training.players.filter(
              (player) => player !== userID
            );
          })
          .catch((error) => {
            console.log(error);
            setShowProgressBar(false);
            setSnackbarColor("#BB6556");
            setSnackbarMessage("No fue posible salirse el partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);
          });

        setTimeout(() => {
          setShowSnackbar(false);
          setTitleMarginTop(0);
        }, 2500);
      } else if (!joined) {
        /** FOR PLAYER NOT JOINED */
        await axios
          .put(`${TRAININGS_URL}/join/${training.key}`, body)
          .then(async (res) => {
            loadTraining();
            loadUserConfirmed();
            loadTrainingHostData()
            loadTrainingPlayers()

            setShowProgressBar(false);
            setSnackbarMessage("Te uniste al partido !");
            setShowSnackbar(true);
            setTitleMarginTop(40);

            training.players.push(userID);
          })
          .catch((error) => {
            console.log(error);
            setShowProgressBar(false);
            setSnackbarColor("#BB6556");
            setSnackbarMessage("No fue posible unirte al partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);
          });

        setTimeout(() => {
          setShowSnackbar(false);
          setTitleMarginTop(0);
        }, 2500);
      } else {
      }
    } else {
      navigation.navigate("AuthenticationHandler")
    }
  };

  const handleShareButton = async () => {
    let shareURL = `${share_base_url}${training.key}`
    try {
      const result = await Share.share({
        message: shareURL
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const renderComponent = () => {
    let showProgres = showProgressBar
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.products}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Block flex style={{ marginTop: 100, padding: 10 }}>
          {showProgres ? (
            <Progress.Bar width={width - 50} indeterminate={true} />
          ) : (
            <></>
          )}

          <SnackBar
            visible={showSnackbar}
            position={"top"}
            backgroundColor={snackbarColor}
            containerStyle={{ borderRadius: 12 }}
            textMessage={snackbarMessage}
          />

          {/* title */}
          <Text
            style={{
              marginTop: titleMarginTop,
              marginBottom: 0,
              fontFamily: "open-sans-bold",
            }}
            size={24}
            color={argonTheme.COLORS.WHITE}
          >
            Entrenamiento {training.date}
          </Text>

          <Text
            style={{ marginBottom: 15, fontFamily: "open-sans-bold" }}
            size={20}
            color={argonTheme.COLORS.WHITE}
          >
            {formatTime(training.hour)}
          </Text>

          <Block flex row style={{ marginTop: 12 }}>
            <Icon
              name="map-marker"
              family="Font-Awesome"
              size={20}
              color={"#96A7AF"}
            />
            <Text
              size={16}
              style={{
                marginTop: titleMarginTop,
                marginBottom: 0,
                fontFamily: "open-sans-bold",
                left:8
              }}
              color={argonTheme.COLORS.WHITE}
            >
              {training.field ? location.field : training.location || "-"}
            </Text>
          </Block>

          {/* join status */}
          {trainingHost ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              small
              color={trainingCanceled ? "warning" : "success"}
            >
              {trainingCanceled ? "CANCELADO" : "ANFITRION"}
            </Button>
          ) : joined ? (
            <Block flex row>
              <Button
                textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                small
                color={"success"}
              >
                UNIDO
              </Button>
            </Block>
          ) : trainingCanceled ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
              small
              color={"success"}
            >
              CANCELADO
            </Button>
          ) : (
            <></>
          )}

          {/* match booking confirmed */}
          {training.field && training.confirmedAction === false ? (
            <Button
              style={{ width: 210, backgroundColor: "#FFBC25" }}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
              small
            >
              Cancha pendiente por confirmar
            </Button>
          ) : (
            <></>
          )}

          <ProfileTrainingDescriptionMiniature item={coach} host />

          {trainingCanceled || trainingOutdated ? (
            <></>
          ) : (
            <Block row style={{ marginLeft: 10 }}>
              <Block flex center style={{ marginLeft: 3 }}>
                <Button
                  textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                  center
                  color={
                    trainingHost ? "warning" : !joined ? "success" : "warning"
                  }
                  style={styles.optionsButton}
                  onPress={(event) => handleJoinButton(training)}
                >
                  {trainingHost ? "CANCELAR" : !joined ? "UNIRSE" : "SALIRSE"}
                </Button>
              </Block>
              <Block flex={1.25} center style={{ marginLeft: 20 }}>
                <Button
                  style={{ backgroundColor: "#30444E" }}
                  textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                  center
                  color="default"
                  onPress={() => handleShareButton()}
                >
                  COMPARTIR
                </Button>
              </Block>
            </Block>
          )}

          {/* training players list */}
          <Block style={styles.membersContainer}>
            <Text style={styles.membersTextTitle}>Jugadores</Text>
            <View style={styles.gridContainer}>
              <FlatList
                data={trainingPlayers}
                renderItem={({ item }) => (
                  <View style={{ flex: 1, flexDirection: "column", margin: 1 }}>
                    <Image
                      style={styles.memberImage}
                      source={{ uri: item.image }}
                    />
                    <Text style={styles.membersListTitle}>
                      {item.displayName}
                    </Text>
                  </View>
                )}
                //Setting the number of column
                numColumns={4}
                keyExtractor={(item, index) => index}
              />
            </View>
          </Block>
        </Block>
      </ScrollView>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {renderComponent()}
    </Block>
  );
}

const styles = StyleSheet.create({
  deals: {
    width,
    backgroundColor: "#22343C" 
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  container: {
    marginTop: 20,
    backgroundColor: theme.COLORS.WHITE,
    borderRadius: 20,
  },
  spinner: {
    marginBottom: 50
  },
  membersContainer: {
    width: "100%",
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE * 1.5,
    backgroundColor: "#30444E",
    padding: 12,
    borderRadius: 12,
  },
  membersListTitle: {
    marginBottom: 15,
    marginLeft: 24,
    fontFamily: "open-sans-bold",
    color: "#ffffff",
    fontSize: 12,
  },
  membersTextTitle: {
    marginBottom: 15,
    fontFamily: "open-sans-bold",
    marginHorizontal: 12,
    marginTop: 8,
    color: "#ffffff",
    fontSize: 20,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    top: 8,
    left: 16,
    padding: 12,
    marginBottom: 20,
  },
  gridContainer: {
    padding: 4,
    flex: 1,
  },
});

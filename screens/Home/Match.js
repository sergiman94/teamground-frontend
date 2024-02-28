import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView, Share, RefreshControl } from "react-native";
import { Block, theme, Text } from "galio-framework";
import { argonTheme } from "../../constants";
import { Button } from "../../components/";
const { width } = Dimensions.get("screen");
import LineUp from "./LineUp";
import * as Progress from 'react-native-progress';
import SnackBar from 'react-native-snackbar-component'
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BOOKINGS_URL, formatTime, JOIN_USER_TO_MATCH_URL, MATCHES_URL, USERS_URL } from "../../utils/utils.";
import ProfileMatchMiniature from "../../components/ProfileMatchMiniature";
import MatchDescriptionCard from "../../components/MatchDescriptionCard";
import MatchConfirmedPlayersCard from "../../components/MatchConfirmedPlayersCard";

export default function Match(props) {
  const { navigation, route } = props;
  const share_base_url = "https://teamground.web.app/confirm?"
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('Hello')
  const [snackbarColor, setSnackbarColor] = useState('#93C46F')
  const [titleMarginTop, setTitleMarginTop] = useState(0)
  const [joined, setJoined] = useState(false)
  const [match, setMatch] = useState(route.params?.match)
  const [field, setField] = useState(route.params?.field)
  const [matchHost, setMatchHost] = useState(false)
  const [role, setRole] = useState(null)
  const [homeTeam, setHomeTeam] = useState([])
  const [awayTeam, setAwayTeam] = useState([])
  const [matchCanceled, setMatchCanceled] = useState(route.params?.match.status === "canceled" ? "CANCELADO" : null)
  const [matchOutdated, setMatchOutdated] = useState(route.params?.match.status === "outdated" ? "OUTDATED" : null)
  const [matchFull, setMatchFull] = useState(route.params?.match.confirmedPlayers.length < Number(route.params?.match.players) ? null : 'FULL')
  const [refreshing, setRefreshing] = useState(false);
  const [matchHostData, setMatchHostData] = useState(null)
  const [matchBooking, setMatchBooking] = useState(null)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadMatch(), loadMatchBooking(), loadUserConfirmed(), loadRole()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadMatch = async () => {
    let myMatch = (await axios.get(`${MATCHES_URL}/${match.key}`)).data
    setMatch(myMatch.data)
  }

  const loadMatchBooking = async () => { 
    let matchBookingData = (await axios.get(`${BOOKINGS_URL}/match/${match.key}`)).data
    setMatchBooking(matchBookingData.data)
  }

  const loadMatchHostData = async () => {
    let mHostData = (await axios.get(`${USERS_URL}/${match.organizer}`)).data
    setMatchHostData(mHostData.data)
  }

  const loadUserConfirmed = async () => {
    let userID = await AsyncStorage.getItem('@user_id')
    if (userID === match.organizer) {
      setMatchHost(true)
    } else {
      match.confirmedPlayers.map(player => {
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
    loadMatchBooking()
    loadUserConfirmed()
    loadMatchHostData()
  }, [])

  const handleJoinButton = async (match) => {
    let userID = await AsyncStorage.getItem("@user_id");
    if (userID) {
      setShowProgressBar(true);

      let body = {
        newPlayerId: userID,
      };

      if (matchHost) {
        /** FOR MATCH HOST */
        await axios
          .put(`${MATCHES_URL}/cancel/${match.key}`, body)
          .then(async (res) => {
            loadMatch();
            loadMatchBooking()
            loadUserConfirmed();

            setShowProgressBar(false);
            setSnackbarMessage("Has cancelado este partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);

            setMatchCanceled("CANCELADO");
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
          .put(`${MATCHES_URL}/leave/${match.key}`, body)
          .then(async (res) => {
            loadMatch();
            loadMatchBooking()
            loadUserConfirmed();

            setShowProgressBar(false);
            setSnackbarMessage("te has salido de este partido");
            setShowSnackbar(true);
            setTitleMarginTop(40);

            match.confirmedPlayers = match.confirmedPlayers.filter(
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
          .put(`${JOIN_USER_TO_MATCH_URL}/${match.key}`, body)
          .then(async (res) => {
            loadMatch();
            loadMatchBooking()
            loadUserConfirmed();

            setShowProgressBar(false);
            setSnackbarMessage("Te uniste al partido !");
            setShowSnackbar(true);
            setTitleMarginTop(40);

            match.confirmedPlayers.push(userID);
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
    let shareURL = `${share_base_url}${match.key}`
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
            Partido {match.date}
          </Text>

          <Text
            style={{ marginBottom: 15, fontFamily: "open-sans-bold" }}
            size={20}
            color={argonTheme.COLORS.WHITE}
          >
            {formatTime(match.hour)}
          </Text>

          {/* match
           status */}
          {matchHost ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              small
              color={matchCanceled ? "warning" : "success"}
            >
              {matchCanceled ? "CANCELADO" : "ANFITRION"}
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
          ) : matchCanceled ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
              small
              color={"warning"}
            >
              CANCELADO
            </Button>
          ) : matchOutdated ? (
            <Button
              style={{width: 150}}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
              small
              color={"warning"}
            >
              PARTIDO TERMINADO
            </Button>
          ) : (
            <></>
          )}

          {/* match full */}
          {matchFull ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
              small
              color={"warning"}
            >
              FULL
            </Button>
          ) : (
            <></>
          )}

          {/* match booking confirmed */}
          {matchBooking && !matchOutdated && matchBooking.confirmedAction === false ? (
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

          {/* show match host */}
          <ProfileMatchMiniature item={matchHostData} host />

          {/* match info */}
          <MatchDescriptionCard item={match} field={field}/>

          {matchCanceled || matchOutdated || matchFull ? (
            <></>
          ) : (
            <Block row style={{ marginLeft: 10 }}>
              <Block flex center style={{ marginLeft: 3 }}>
                <Button
                  textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                  center
                  color={
                    matchHost ? "warning" : !joined ? "success" : "warning"
                  }
                  style={styles.optionsButton}
                  onPress={(event) => handleJoinButton(match)}
                >
                  {matchHost ? "CANCELAR" : !joined ? "UNIRSE" : "SALIRSE"}
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

          {/* line up */}
          <Block style={styles.container}>
            <LineUp match={match} />
          </Block>

          {/* confirmed players */}
          {match.confirmedPlayers.length > 1 ? (
            <Block>
              <MatchConfirmedPlayersCard
                confirmedPlayers={match.confirmedPlayers}
              />
            </Block>
          ) : (
            <></>
          )}
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
});

import React, { useEffect, useState } from "react";
import { StyleSheet, Image, TouchableWithoutFeedback } from "react-native";
import { Icon } from ".";
import { Block, Text, theme } from "galio-framework";
import { Button } from "../components";
import { argonTheme } from "../constants";
import { FIELDS_URL, formatTime, USERS_URL } from "../utils/utils.";
import ProfileTrainingMiniature from "./ProfileTrainingMiniature";
import axios from "axios";

export default function TrainingCard(props) {
  const { navigation, item } = props;
  const [playersImages, setPlayersImages]  = useState([])
  const [coach, setCoach] = useState(null)
  const [location, setLocation] = useState(null)

  const loadPlayersImages = async () => {
    let requests = []
    for (let i = 0; i < item.players.length; i++) {
      const element = item.players[i];
      requests.push((await axios.get(`${USERS_URL}/${element}`)).data.data)
    }
    let imgs = (await Promise.allSettled(requests)).flatMap((result) => result.value ? result.value.image : null)
    setPlayersImages(imgs)
  }

  const loadLocationData = async () => {
    let locationData = (await axios.get(`${FIELDS_URL}/${item.field}`)).data.data
    setLocation(locationData)
  }

  const loadCoachData = async () => {
    let coachData = (await axios.get(`${USERS_URL}/${item.coach}`)).data.data
    setCoach(coachData)
  }

  const redirectToTraining = () => { 
    navigation.navigate("Training", { training: item, coach: coach, location: location })
  }

  useEffect(() => {
    loadPlayersImages()
    loadCoachData()
    loadLocationData()
  }, [])

  return (
    <Block row={false} card flex style={styles.card}>
      <Block>
        <Block flex space="between" style={styles.cardDescription}>
          <Block flex row>
            {/* left side */}
            <Block left style={styles.leftContainer}>
              {/* training date */}
              <Block flex row>
                <Icon
                  name="calendar"
                  family="Font-Awesome"
                  size={16}
                  color={"#96A7AF"}
                />
                <Text
                  size={14}
                  style={styles.cardTitle}
                  color={argonTheme.COLORS.WHITE}
                >
                  {item.date}
                </Text>
              </Block>

              {/* training time */}
              <Block flex row style={{ marginTop: 12 }}>
                <Icon
                  name="clock-o"
                  family="Font-Awesome"
                  size={16}
                  color={"#96A7AF"}
                />
                <Text
                  size={14}
                  style={styles.cardTitle}
                  color={argonTheme.COLORS.WHITE}
                >
                  {formatTime(item.hour)}
                </Text>
              </Block>

              {/* training location or field */}
              {item.location ? (
                <>
                  <Block flex row style={{ marginTop: 12 }}>
                    <Icon
                      name="map-marker"
                      family="Font-Awesome"
                      size={16}
                      color={"#96A7AF"}
                    />
                    <Text
                      size={14}
                      style={styles.cardTitle}
                      color={argonTheme.COLORS.WHITE}
                    >
                      {item.location || "-"}
                    </Text>
                  </Block>
                </>
              ) : (
                <>
                  <Block flex row style={{ marginTop: 12 }}>
                    <Icon
                      name="map-marker"
                      family="Font-Awesome"
                      size={16}
                      color={"#96A7AF"}
                    />
                    <Text
                      size={14}
                      style={styles.cardTitle}
                      color={argonTheme.COLORS.WHITE}
                    >
                      {location ? location.field : "-"}
                    </Text>
                  </Block>
                </>
              )}

              {/* players count */}
              <Block flex row style={{ marginTop: 12 }}>
                <Icon
                  name="male"
                  family="Font-Awesome"
                  size={16}
                  color={"#96A7AF"}
                />
                <Text
                  size={14}
                  style={styles.cardTitle}
                  color={argonTheme.COLORS.WHITE}
                >
                  {item.players.length}
                </Text>
              </Block>

              {/* players joined   */}
              <Block flex row style={{ marginTop: 8, marginLeft: 4 }}>
                {playersImages.map(
                  (player, index) =>
                    index < 5 && (
                      <Image
                        source={{ uri: player }}
                        style={styles.playersMiniatureImage}
                      />
                    )
                )}
              </Block>
            </Block>

            {/* right side */}
            <Block right style={styles.rightContainer}>
              <ProfileTrainingMiniature item={coach} />
            </Block>
          </Block>

          {/* canceled badge */}
          {item.status === "canceled" ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              style={{ marginTop: 12, marginLeft: 0 }}
              small
              color={"warning"}
            >
              CANCELADO
            </Button>
          ) : (
            <></>
          )}

          {/* outdated badge */}
          {item.status === "outdated" ? (
            <Button
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              style={{ marginTop: 12, marginLeft: 0 }}
              small
              color={"warning"}
            >
              TERMINADO
            </Button>
          ) : (
            <></>
          )}

          {/* pending confirmation */}
          {item.field && item.confirmedAction === false ? (
            <Button
              style={styles.pendingButton}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              small
              shadowless
            >
              Cancha pendiente por confirmar
            </Button>
          ) : (
            <></>
          )}
        </Block>

        {/* redirect to training description */}
        <TouchableWithoutFeedback onPress={redirectToTraining}>
          <Block flex space="between" style={{ marginTop: 8, left: 6 }}>
            <Block flex row>
              <Text
                style={{ fontFamily: "open-sans-bold" }}
                size={12}
                muted={false}
                color={"#FFFFFF"}
                bold
              >
                {"Ver detalles del entreno"}
              </Text>
              <Icon
                name="external-link-square"
                style={{
                  marginTop: 2,
                  fontFamily: "open-sans-bold",
                  color: "#FFFFFF",
                  left: 8,
                }}
                family="Font-Awesome"
                size={12}
                color={"#FFFFFF"}
              />
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#30444E",
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 4,
    padding: 12,
  },
  leftContainer: {
    marginTop: 12,
    flex: 0.5,
  },
  rightContainer: {
    marginLeft: "auto",
    flex: 0.5,
    top: 20,
  },
  cardTitle: {
    color: "#ffffff",
    fontFamily: "open-sans-regular",
    fontSize: 16,
    left: 8,
  },
  pendingButton: {
    backgroundColor: "#FFBC25",
    width: 180,
    height: 20,
    right: 6,
    bottom: 2,
    top: 2
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  imageContainer: {},
  image: {},
  horizontalImage: {
    height: 122,
    width: "auto",
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  fullImage: {
    height: 215,
  },
  playersMiniatureImage: {
    width: 20,
    height: 20,
    marginLeft: -4,
    borderRadius: 20 / 2,
  }
});

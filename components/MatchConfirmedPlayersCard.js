import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
// butoane text mai gros ca la register screen
import { Button } from "../components/";
import { argonTheme } from "../constants/";
import axios from "axios";
import { USERS_URL } from "../utils/utils.";

const { width } = Dimensions.get("screen");

export default function MatchConfirmedPlayersCard(props) {
  const confirmedPlayers = props && props.confirmedPlayers ? props.confirmedPlayers : []
  const [players, setPlayers] = useState([])

  const loadPlayersData = async () => { 
    let promises = confirmedPlayers.map(async (player) =>  (await axios.get(`${USERS_URL}/${player}`)).data.data)
    let playersData = (await Promise.allSettled(promises)).flatMap(result => result.value ? result.value : [])
    setPlayers(playersData)
  } 

  useEffect(() => { 
    loadPlayersData()
  }, [])

  return (
    <Block>
      <Block card style={styles.container}>
        <Text
          style={{ marginBottom: 15, fontFamily: "open-sans-bold", marginHorizontal: 12, marginTop: 8}}
          size={20}
          color={argonTheme.COLORS.WHITE}
        >
          Jugadores 
        </Text>

        {players.map((item) => (
          <Block card flex row style={styles.card}>
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("PlayerProfile", { playerProfile: item })
              }
            >
              <Block
                flex
                row
                style={[styles.imageContainer, styles.verticalStyles]}
              >
                {/* IMAGE */}
                <Image
                  source={item ? { uri: item.image } : Images.ProfilePicture}
                  style={styles.horizontalImage}
                />

                {/* NAME */}
                <Block right={false} style={{ marginTop: 0, marginLeft: 20 }}>
                  {/* name text */}
                  <Text
                    style={{ fontFamily: "open-sans-bold" }}
                    size={16}
                    // muted={!ctaColor}
                    color={"#FFFFFF"}
                    bold
                  >
                    {item ? item.displayName : " - "}
                  </Text>

                  {/* username */}
                  <Block flex row style>
                    <Text
                      style={{
                        marginTop: 2,
                        marginLeft: 0,
                        fontFamily: "open-sans-regular",
                      }}
                      size={16}
                      // muted={!ctaColor}
                      color={"#96A7AF"}
                    >
                      @{item ? item.username : " - "}
                    </Text>
                  </Block>
                </Block>
              </Block>
            </TouchableWithoutFeedback>
          </Block>
        ))}
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE * 1.5,
    backgroundColor: "#30444E",
    padding: 12
  },
  card: {
    marginVertical: theme.SIZES.BASE - 8,
    borderWidth: 0, // use this for visual debug
    width: '100%', 
    minHeight: 0,
    marginBottom: 0,
    backgroundColor: '#2A3C44',
    padding: 20
  },
  cardTitle: {
   
    paddingBottom: 6
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    
  },
  image: {
    width: 50, height: 50, borderRadius: 50/ 2
  },
  horizontalImage: {
    width: 50, height: 50, borderRadius: 50/ 2
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  }
});

import axios from "axios";
import React, { Component, useEffect, useState } from "react";
import { Text, View, StyleSheet, Image, ImageBackground } from "react-native";
import { Images } from "../../constants";
import { USERS_URL } from "../../utils/utils.";

const cardYellow = require("../../assets/imgs/card-yellow.png");
const cardRed = require("../../assets/imgs/card-red.png");
const refresh = require("../../assets/imgs/refresh.png");
const field = require("../../assets/imgs/footballfield.jpeg");
//const field = require('../../assets/imgs/clear-field.png')

export default function LineUp(props) {
  let homeMockTeam = [
    [
      {
        number: 1,
        name: "Patricio",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
    [
      {
        number: 21,
        name: "Soares",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 3,
        name: "Pepe",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 6,
        name: "Fonte",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 5,
        name: "Guerriero",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
    [
      {
        number: 14,
        name: "Calvalho",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 8,
        name: "Mountinho",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 11,
        name: "Silva",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 17,
        name: "Guedes",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
    [
      {
        number: 16,
        name: "Fernandes",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 7,
        name: "Cristiano Ronaldo",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
  ];

  let awayMockTeam = [
    [
      {
        number: 1,
        name: "Neuer",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
    [
      {
        number: 21,
        name: "Varane",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 3,
        name: "Ramos",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 6,
        name: "Mendy",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 5,
        name: "Marcelo",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
    [
      {
        number: 14,
        name: "Modric",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 8,
        name: "Xavi",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 11,
        name: "Zidane",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 17,
        name: "Messi",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
    [
      {
        number: 16,
        name: "Neymar",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
      {
        number: 7,
        name: "Suarez",
        image: 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'
      },
    ],
  ];

  let homeTemplate = {
    home: "",
    module: "",
    team: homeMockTeam,
    home_team_events: [
      // {
      //   id: 203,
      //   type_of_event: "red-card",
      //   player: "Silva",
      //   time: "3'",
      // },
      // {
      //   id: 210,
      //   type_of_event: "yellow-card",
      //   player: "Fernandes",
      //   time: "64'",
      // },
      // {
      //   id: 210,
      //   type_of_event: "yellow-card",
      //   player: "Fonte",
      //   time: "64'",
      // },
      // {
      //   id: 206,
      //   type_of_event: "substitution-in",
      //   player: "Fonte",
      //   time: "31'",
      // },
    ],
  };

  let awayTemplate = {
    home: "",
    module: "",
    team: awayMockTeam,
    away_team_events: [
      // {
      //   id: 210,
      //   type_of_event: "yellow-card",
      //   player: "De Gea",
      //   time: "12'",
      // },
      // {
      //   id: 206,
      //   type_of_event: "substitution-in",
      //   player: "Iniesta",
      //   time: "31'",
      // },
      // {
      //   id: 206,
      //   type_of_event: "substitution-in",
      //   player: "Costa",
      //   time: "32'",
      // },
      // {
      //   id: 206,
      //   type_of_event: "red-card",
      //   player: "Silva",
      //   time: "31'",
      // },
    ],
  };

  const [home, setHome] = useState(homeTemplate);
  const [away, setAway] = useState(awayTemplate);

  // TODO: optimization (promise.all - promise.race) - best logic way
  const loadConfirmedPlayers = async () => {
    const match = props.match;
    let confirmedPlayers = match.confirmedPlayers || match.players;
    let modality = match.modality;

    if (modality === "5-5") {
      let homeTeamTemplate = [
        [
          {
            number: 1,
            name: null,
          },
        ],
        [
          {
            number: 10,
            name: null,
          },
          {
            number: 2,
            name: null,
          },
        ],
        [
          {
            number: 5,
            name: null,
          },
          {
            number: 9,
            name: null,
          },
        ],
      ];

      let awayTeamTemplate = [
        [
          {
            number: 1,
            name: null,
          },
        ],
        [
          {
            number: 6,
            name: null,
          },
          {
            number: 11,
            name: null,
          },
        ],
        [
          {
            number: 23,
            name: null,
          },
          {
            number: 7,
            name: null,
          },
        ],
      ];

      let promiseaArr = confirmedPlayers.map(
        async (playerKey) => await axios.get(`${USERS_URL}/${playerKey}`)
      );
      let playersData = await Promise.allSettled(promiseaArr)
        .then((data) => data)
        .catch((err) => err);
      let homeCounter = 0;
      let awayCounter = 0;

      if (playersData.length > 5) {
        // divide teams properly
        let homeTeam = playersData.filter((player, index) => index < 5);
        let awayTeam = playersData.filter((player, index) => index > 4);

        //set teams players for home
        for (let i = 0; i < homeTeamTemplate.length; i++) {
          let container = homeTeamTemplate[i];
          for (let j = 0; j < container.length; j++) {
            let element = container[j];
            if (homeTeam[homeCounter]) {
              element = element.name === null && homeTeam[homeCounter].value.data.data.displayName ? (element.name = homeTeam[homeCounter].value.data.data.displayName, element.image = homeTeam[homeCounter].value.data.data.image) : (element.name = null, element.image = null);
              homeCounter++;
            }
          }
        }

        //set teams players for away
        for (let i = 0; i < awayTeamTemplate.length; i++) {
          let container = awayTeamTemplate[i];
          for (let j = 0; j < container.length; j++) {
            let element = container[j];
            if (awayTeam[awayCounter]) {
              element = element.name === null && awayTeam[awayCounter].value.data.data.displayName ? (element.name = awayTeam[awayCounter].value.data.data.displayName, element.image = awayTeam[awayCounter].value.data.data.image) : (element.name = null, element.image = null);
              awayCounter++;
            }
          }
        }
      } else {
        // divide teams properly
        let homeTeam = playersData;

        //set teams players for home
        for (let i = 0; i < homeTeamTemplate.length; i++) {
          let container = homeTeamTemplate[i];
          for (let j = 0; j < container.length; j++) {
            let element = container[j];
            if (homeTeam[homeCounter]) {
              element = element.name === null && homeTeam[homeCounter].value.data.data.displayName ? (element.name = homeTeam[homeCounter].value.data.data.displayName, element.image = homeTeam[homeCounter].value.data.data.image) : (element.name = null, element.image = null);
              homeCounter++;
            }
          }
        }
      }

      let home55 = {
        home: "",
        module: "",
        team: homeTeamTemplate,
        home_team_events: [],
      };

      let away55 = {
        home: "",
        module: "",
        team: awayTeamTemplate,
        away_team_events: [],
      };

      setHome(home55);
      setAway(away55);
    } else if (modality == "11-11") {
      let homeTeamTemplate = [
        [
          {
            number: 1,
            name: null,
          },
        ],
        [
          {
            number: 21,
            name: null,
          },
          {
            number: 3,
            name: null,
          },
          {
            number: 6,
            name: null,
          },
          {
            number: 5,
            name: null,
          },
        ],
        [
          {
            number: 14,
            name: null,
          },
          {
            number: 8,
            name: null,
          },
          {
            number: 11,
            name: null,
          },
          {
            number: 17,
            name: null,
          },
        ],
        [
          {
            number: 16,
            name: null,
          },
          {
            number: 7,
            name: null,
          },
        ],
      ];

      let awayTeamTemplate = [
        [
          {
            number: 1,
            name: null,
          },
        ],
        [
          {
            number: 12,
            name: null,
          },
          {
            number: 8,
            name: null,
          },
          {
            number: 5,
            name: null,
          },
          {
            number: 29,
            name: null,
          },
        ],
        [
          {
            number: 11,
            name: null,
          },
          {
            number: 10,
            name: null,
          },
          {
            number: 7,
            name: null,
          },
          {
            number: 20,
            name: null,
          },
        ],
        [
          {
            number: 9,
            name: null,
          },
          {
            number: 7,
            name: null,
          },
        ],
      ];

      let promiseaArr = confirmedPlayers.map(
        async (playerKey) => await axios.get(`${USERS_URL}/${playerKey}`)
      );
      let playersData = await Promise.allSettled(promiseaArr)
        .then((data) => data)
        .catch((err) => err);
      let homeCounter = 0;
      let awayCounter = 0;

      if (playersData.length > 11) {
        // divide teams properly
        let homeTeam = playersData.filter((player, index) => index < 11);
        let awayTeam = playersData.filter((player, index) => index > 10);

        //set teams players for home
        for (let i = 0; i < homeTeamTemplate.length; i++) {
          let container = homeTeamTemplate[i];
          for (let j = 0; j < container.length; j++) {
            let element = container[j];
            if (homeTeam(homeCounter)) {
              element = element.name === null && homeTeam[homeCounter].value.data.data.displayName ? (element.name = homeTeam[homeCounter].value.data.data.displayName, element.image = homeTeam[homeCounter].value.data.data.image) : (element.name = null, element.image = null);
              homeCounter++;
            }
          }
        }

        // set teams players for away
        for (let i = 0; i < awayTeamTemplate.length; i++) {
          let container = awayTeamTemplate[i];
          for (let j = 0; j < container.length; j++) {
            let element = container[j];
            if (awayTeam[awayCounter]) {
              element = element.name === null && awayTeam[awayCounter].value.data.data.displayName ? (element.name = awayTeam[awayCounter].value.data.data.displayName, element.image = awayTeam[awayCounter].value.data.data.image) : (element.name = null, element.image = null);
              awayCounter++;
            }
          }
        }
      } else {
        // divide teams properly
        let homeTeam = playersData;

        //set teams players for home
        for (let i = 0; i < homeTeamTemplate.length; i++) {
          let container = homeTeamTemplate[i];
          for (let j = 0; j < container.length; j++) {
            let element = container[j];
            if (homeTeam[homeCounter]) {
              element = element.name === null && homeTeam[homeCounter].value.data.data.displayName ? (element.name = homeTeam[homeCounter].value.data.data.displayName, element.image = homeTeam[homeCounter].value.data.data.image) : (element.name = null, element.image = null);
              homeCounter++;
            }
          }
        }
      }

      homeCounter = 0;
      awayCounter = 0;

      let home11 = {
        home: "",
        module: "",
        team: homeTeamTemplate,
        home_team_events: [],
      };

      let away11 = {
        home: "",
        module: "",
        team: awayTeamTemplate,
        away_team_events: [],
      };

      setHome(home11);
      setAway(away11);
    }
  };

  useEffect(() => {
    loadConfirmedPlayers();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={field}
        style={{
          width: null,
          height: null,
          flex: 1,
        }}
        imageStyle={{ borderRadius: 18 }}
      >
        <View style={{ backgroundColor: "rgba(52, 52, 52, 0.45)", flex: 1}}
        >
          {/* home team */}
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(204, 70, 43, 0)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    marginLeft: 20,
                  },
                ]}
              >
                {home.module}
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    position: "absolute",
                    right: 20,
                  },
                ]}
              >
                {home.name}
              </Text>
            </View>

            {/* each individual player - yellow or red cards */}
            {home.team.map((data, i) => (
              <View key={"h" + i} style={styles.rowHome}>
                {data.map((d, j) => (
                  <View key={"he" + j} style={styles.el}>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      {home.home_team_events.map(
                        (el, z) =>
                          d.name == el.player &&
                          el.type_of_event == "yellow-card" && (
                            <Image
                              key={"hy" + z}
                              source={cardYellow}
                              style={{
                                width: 12,
                                height: 15,
                                position: "absolute",
                                left: -12,
                              }}
                            />
                          )
                      )}
                      {home.home_team_events.map(
                        (el, z) =>
                          d.name == el.player &&
                          el.type_of_event == "red-card" && (
                            <Image
                              key={"hr" + z}
                              source={cardRed}
                              style={{
                                width: 12,
                                height: 15,
                                position: "absolute",
                                left: -12,
                              }}
                            />
                          )
                      )}
                      <View style={styles.playHome}>
                        {/* individual player */}
                        {/* <Text style={styles.text}>{d.number}</Text> */}
                        {d.image ? <Image
                          key={"hs"}
                          source={{uri: d.image || 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'}}
                          style={styles.playerImage}
                        /> : <></> }
                      </View>
                      {home.home_team_events.map(
                        (el, z) =>
                          d.name == el.player &&
                          el.type_of_event == "substitution-in" && (
                            <Image
                              key={"hs" + z}
                              source={refresh}
                              style={{
                                width: 12,
                                height: 12,
                                position: "absolute",
                                right: -14,
                              }}
                            />
                          )
                      )}
                    </View>
                    {d.name ? <Text style={styles.text}>{d.name || '-'}</Text> : <></>}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* away team */}
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(43, 99, 204, 0)",
              paddingTop: 55,
            }}
          >
            {/* each individual player - yellow or red cards */}
            {away.team.reverse().map((data, i) => (
              <View key={"a" + i} style={styles.rowAway}>
                {data.map((d, j) => (
                  <View key={"ae" + j} style={styles.el}>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      {away.away_team_events.map(
                        (el, z) =>
                          d.name == el.player &&
                          el.type_of_event == "yellow-card" && (
                            <Image
                              key={"ay" + z}
                              source={cardYellow}
                              style={{
                                width: 12,
                                height: 15,
                                position: "absolute",
                                left: -12,
                              }}
                            />
                          )
                      )}
                      {away.away_team_events.map(
                        (el, z) =>
                          d.name == el.player &&
                          el.type_of_event == "red-card" && (
                            <Image
                              key={"ar" + z}
                              source={cardRed}
                              style={{
                                width: 12,
                                height: 15,
                                position: "absolute",
                                left: -12,
                              }}
                            />
                          )
                      )}
                      <View style={styles.playAway}>
                        {/* individual player */}
                        {/* <Text style={styles.text}>{d.number}</Text> */}
                        {d.image ? <Image
                          key={"hs"}
                          source={{uri: d.image || 'https://southernplasticsurgery.com.au/wp-content/uploads/2013/10/user-placeholder.png'}}
                          style={styles.playerImage}
                        /> : <></> }
                      </View>
                      {away.away_team_events.map(
                        (el, z) =>
                          d.name == el.player &&
                          el.type_of_event == "substitution-in" && (
                            <Image
                              key={"as" + z}
                              source={refresh}
                              style={{
                                width: 12,
                                height: 12,
                                position: "absolute",
                                right: -14,
                              }}
                            />
                          )
                      )}
                    </View>
                    {d.name ? <Text style={styles.text}>{d.name || '-'}</Text> : <></>}
                  </View>
                ))}
              </View>
            ))}

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={[
                  styles.text,
                  {
                    marginLeft: 20,
                  },
                ]}
              >
                {away.module}
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    position: "absolute",
                    right: 20,
                  },
                ]}
              >
                {away.name}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
  },
  rowHome: {
    flex: 1,
    flexDirection: "row",
  },
  rowAway: {
    flex: 1,
    flexDirection: "row",
  },
  el: {
    flexGrow: 1,
    alignItems: "center",
    marginTop: 4
  },
  playHome: {
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0,
    // borderColor: "rgb(244, 67, 54)",
    // backgroundColor: "rgba(244, 67, 54,0.5)",
  },
  playAway: {
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0,
    // borderColor: "rgb(3, 169, 244)",
    // backgroundColor: "rgba(3, 169, 244,0.5)",
  },
  text: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },
  playerImage: {
    justifyContent: "center",
    width: 30,
    height: 30,
    position: "absolute",
    borderRadius: 15,
  },
});

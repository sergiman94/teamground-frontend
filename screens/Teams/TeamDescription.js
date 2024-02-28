import React, {useEffect, useState} from "react";
import { StyleSheet, Dimensions, ScrollView, Image, Text, TouchableWithoutFeedback, View, FlatList } from "react-native";
import { Block, theme, Button } from "galio-framework";
import { Icon } from "../../components";
import ProfileTeamCoachMiniature from "../../components/ProfileTeamCoachMiniature";
import axios from "axios";
import { TEAMS_URL, USERS_URL } from "../../utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SnackBar from "react-native-snackbar-component";
const { width } = Dimensions.get("screen");
import { v4 as uuidv4 } from "uuid";
const cardWidth = width - theme.SIZES.BASE * 2;

export default function TeamDescription(props) {
  const { navigation, route } = props;
  const [team, setTeam] = useState(route.params?.team)
  const [coach, setCoach] = useState(route.params?.team.coach)
  const [members, setMembers] = useState(route.params?.team.members)
  const [joinButtonLoading, setJoinButtonLoading] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [isUserJoined, setIsUserJoined] = useState(false)
  const [currentUser, setCurrentUser] =  useState(null)
  const [reload, setReload] = useState(false)

  const renderCards = () => {
    return (
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
              snapToInterval={cardWidth + theme.SIZES.BASE * 0.375}
              contentContainerStyle={{
                paddingHorizontal: 0,
              }}
            >
              {team.media.length &&
                team.media.map((item, index) => (
                  <TouchableWithoutFeedback
                    style={{ zIndex: 3 }}
                    key={`product-${uuidv4()}`}
                    onPress={() =>
                      navigation.navigate("Gallery", { images: team.media, index })
                    }
                  >
                    <Block center style={styles.productItem}>
                      <Image
                        resizeMode="cover"
                        style={styles.productImage}
                        source={item ? { uri: item } : Images.ProfilePicture}
                      />
                    </Block>
                  </TouchableWithoutFeedback>
                ))}
            </ScrollView>
          </Block>
        </Block>
      </Block>
    );
  };

  const loadCoach = async () => {
    const coachData = (await axios.get(`${USERS_URL}/${route.params?.team.coach}`)).data
    setCoach(coachData.data)
  }

  const loadTeam = async () => {
    let teamData = (await axios.get(`${TEAMS_URL}/${team.key}`)).data
    setTeam(teamData.data)
  }

  const loadMembers = async () => {
    setJoinButtonLoading(true)
    let currentUserKey = await AsyncStorage.getItem("@user_id")
    setCurrentUser(currentUserKey)

    let isUserJoined = team.members.filter(member => member === currentUserKey).length > 0
    let membersRequests = []
    for (let i = 0; i < team.members.length; i++) {
      const memberKey = team.members[i];
      membersRequests.push((await axios.get(`${USERS_URL}/${memberKey}`)).data)
    }
    let membersData = (await Promise.allSettled(membersRequests)).flatMap(result => result.value ? result.value.data : null)

    setIsUserJoined(isUserJoined)
    setMembers(membersData)
    setJoinButtonLoading(false)
  }

  const handleJoinTeam = async () => {
    setJoinButtonLoading(true);
    let userKey = await AsyncStorage.getItem("@user_id");

    let joinedAlready = team.members.filter(member => member === userKey).length > 0

    if (joinedAlready) {
      setJoinButtonLoading(false);
      setShowSnackbar(true);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("Ya estas unido a este equipo ");
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1200);

      return
    }

    await axios
      .put(`${TEAMS_URL}/join/${team.key}/${userKey}`)
      .then(async () => {
        setIsUserJoined(true)
        setJoinButtonLoading(false);

        setShowSnackbar(true);
        setSnackbarColor("#93C46F");
        setSnackbarMessage("Te has unido a este equipo  ");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1200);
      })
      .catch((e) => {
        console.log(e);
        setJoinButtonLoading(false);
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("Ups! no pudimos unirte a este equipo");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1200);
      });
      setIsUserJoined(true)
  };

  const handleLeaveTeam = async () => {
    setJoinButtonLoading(true);
    let userKey = await AsyncStorage.getItem("@user_id");

    await axios
      .put(`${TEAMS_URL}/leave/${team.key}/${userKey}`)
      .then(async () => {
        setIsUserJoined(false)
        setJoinButtonLoading(false);

        setShowSnackbar(true);
        setSnackbarColor("#93C46F");
        setSnackbarMessage("Te has salido a este equipo ");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1200);

      })
      .catch((e) => {
        console.log(e);
        setJoinButtonLoading(false);
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("Ups! no pudiste salirte a este equipo");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1200);
      });
      setIsUserJoined(false)
  };

  useEffect(() => {
    loadCoach()
    loadMembers()
  }, [])

  useEffect(() => { 
    loadMembers()
    loadTeam()
  }, [reload])

  const render = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.products}
      >
        <>
          {/* header and basic info */}
          <Block flex row style={styles.container}>
            <SnackBar
              visible={showSnackbar}
              position={"top"}
              backgroundColor={snackbarColor}
              textMessage={snackbarMessage}
            />
            {/* team image */}
            <Block flex style={styles.cardDescription}>
              <Image
                source={{ uri: team.image }}
                style={styles.horizontalImage}
              />
            </Block>

            {/* name and location */}
            <Block style={{ flex: 2 }}>
              {/* NAME */}
              <Text size={36} style={styles.cardTitle}>
                {team.name}
              </Text>

              {/* location and address */}
              <Block flex row style={{ marginTop: 8 }}>
                <Icon
                  style={{ top: 24 }}
                  name="map-marker"
                  family="Font-Awesome"
                  size={16}
                  color={"#3DD598"}
                />
                <Text size={32} style={styles.cardSubTitle}>
                  {team.address} - {team.location}
                </Text>
              </Block>

              {/** user joined badge */}
              {isUserJoined && currentUser && currentUser !== team.coach  ? (
                <Button
                  textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                  style={{ width: 80, height: 20, bottom: 8, right: 4 }}
                  shadowless
                  small
                  color={"success"}
                >
                  {"Unido"}
                </Button>
              ) : (
                <></>
              )}
            </Block>
          </Block>

          {/* team description */}
          <Block>
            <Text size={14} style={styles.cardDescription}>
              {team.description}
            </Text>
          </Block>

          {/* team trainings and join team */}
          <Block flex row>
            {/* go to team trainings */}
            <TouchableWithoutFeedback
              style={styles.goToTrainings}
              onPress={() => navigation.navigate("Trainings", { team: team })}
            >
              <Block flex row style={styles.goToTrainingsContainer}>
                <Text
                  style={{
                    fontFamily: "open-sans-bold",
                    fontSize: 12,
                    color: "#FFFFFF",
                  }}
                  small
                  color={"#30444E"}
                  shadowless
                >
                  {"Entrenamientos"}
                </Text>
                <Icon
                  name="external-link-square"
                  style={{
                    fontFamily: "open-sans-bold",
                    color: "#FFFFFF",
                    left: 8,
                  }}
                  family="Font-Awesome"
                  size={12}
                  color={"#FFFFFF"}
                />
              </Block>
            </TouchableWithoutFeedback>

            {/* join team */}
            {currentUser && currentUser !== team.coach ? (
              <Button
                style={styles.joinContainer}
                textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                onPress={() => {
                  isUserJoined ? handleLeaveTeam() : handleJoinTeam();
                }}
                shadowless
                color={isUserJoined ? "warning" : "#3ED598"}
                loading={joinButtonLoading}
              >
                {isUserJoined
                  ? "Salirse de este equipo"
                  : "Unirse a este equpo"}
              </Button>
            ) : (
              <>
                <TouchableWithoutFeedback
                  style={styles.goToTrainings}
                  onPress={() =>
                    navigation.navigate("Trainings", { team: team })
                  }
                >
                  <Block flex row style={styles.joinContainer}></Block>
                </TouchableWithoutFeedback>
              </>
            )}
          </Block>

          {/* coach info */}
          <Block style={{ marginTop: 8 }}>
            <ProfileTeamCoachMiniature item={coach} />
          </Block>

          {/* team media */}
          {team.media.length ? <>{renderCards()}</> : <></>}

          {/* team members list */}
          <Block style={styles.membersContainer}>
            <Text style={styles.membersTextTitle}>Jugadores</Text>
            <View style={styles.gridContainer}>
              <FlatList
                data={members}
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
        </>
      </ScrollView>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {render()}
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
  },
  deals: {
    width,
    backgroundColor: "#22343C",
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  cardDescription: {
    flex: 0.5,
    padding: 5,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    top: 8,
    left: 8,
    borderRadius: 13,
  },
  cardTitle: {
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 24,
    top: 24,
  },
  cardDescription: {
    color: "#ffffff",
    fontFamily: "open-sans-regular",
    fontSize: 14,
    marginVertical: 12,
  },
  cardSubTitle: {
    color: "#96A7AF",
    fontFamily: "open-sans-regular",
    fontSize: 12,
    left: 4,
    top: 24,
  },
  group: {
    paddingTop: theme.SIZES.BASE,
  },
  productImage: {
    width: cardWidth - 200,
    height: 250,
    borderRadius: 20,
  },
  goToTrainings: {
    flex: 1,
    width: 100,
    height: 40,
    padding: 8,
    right: 4,
  },
  join: {
    flex: 1,
    width: 100,
    height: 40,
    padding: 8,
    right: 4,
    backgroundColor: '#40DF9F'
  },
  goToTrainingsContainer: { 
    alignItems: 'center',
    backgroundColor: '#30444E',
    height: 32,
    top: 4, 
    padding: 8, 
    borderRadius: 4, 
    width: 112
  }, 
  joinContainer: { 
    alignItems: "center",
    // backgroundColor: "#3ED598",
    fontFamily: "open-sans-bold",
    height: 32,
    marginLeft: 12,
    bottom: 4,
    padding: 8,
    borderRadius: 4,
    width: 200,
    fontSize: 10
  }, 
  productItem: {
    width: cardWidth - theme.SIZES.BASE * 5,
    marginRight: -100,
    right: 64,
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

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Text,
  TouchableWithoutFeedback,
  View,
  FlatList,
  RefreshControl,
} from "react-native";
import { Block, Button, theme } from "galio-framework";
import { argonTheme } from "../../constants";
const { width } = Dimensions.get("screen");
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { TEAMS_URL, USERS_URL } from "../../utils/utils.";
import { Icon } from "../../components";
import ProfileTeamCoachMiniature from "../../components/ProfileTeamCoachMiniature";
import { v4 as uuidv4 } from "uuid";
const Rocket = require("../../assets/rocket.png");
const cardWidth = width - theme.SIZES.BASE * 2;

export default function MyTeam(props) {
  const { navigation, route } = props;
  const [user, setUser] = useState(null);
  const [reload, setReload] = useState(
    route.params ? route.params.reload : null
  );
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadProfile()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

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

  const checkUser = async () => {
    let userID = await AsyncStorage.getItem("@user_id");
    if (!userID) {
      navigation.navigate("AuthenticationHandler");
    }
  };

  const handleTeamCreationButton = () => {
    checkUser();
    navigation.navigate("CreateMyTeam", { user: user });
  };

  const loadProfile = async () => {
    let userId = await AsyncStorage.getItem("@user_id");
    let userData = await axios
      .get(`${USERS_URL}/${userId}`)
      .then((response) => response.data.data);
    setUser(userData);

    if (userData.team) {
      let teamData = await axios
        .get(`${TEAMS_URL}/${userData.team}`)
        .then((response) => response.data.data);
      setTeam(teamData);
      let membersCall = [];
      for (let i = 0; i < teamData.members.length; i++) {
        const member = teamData.members[i];
        membersCall.push(axios.get(`${USERS_URL}/${member}`));
      }
      let membersData = (await Promise.allSettled(membersCall)).flatMap(
        (result) => (result.value ? result.value.data.data : null)
      );
      setTeamMembers(membersData);
    }
  };

  useEffect(() => {
    checkUser();
  });

  useEffect(() => {
    checkUser();
    loadProfile();
  }, []);

  useEffect(() => {
    checkUser();
    loadProfile();
  }, [reload]);

  const render = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.products}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {team ? (
          <>
            <Button
              style={{ width: 80, height: 30 }}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              small
              onPress={() => navigation.navigate("EditMyTeam", { team: team })}
              color={"success"}
              shadowless
            >
              {"Editar Equipo"}
            </Button>

            {/* header and basic info */}
            <Block flex row style={styles.container}>
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
              </Block>
            </Block>

            {/* team description */}
            <Block>
              <Text size={14} style={styles.cardDescription}>
                {team.description}
              </Text>
            </Block>

            {/* buttons - create/view trainings */}
            <Block flex row>
              {/* go to team trainings */}
              <TouchableWithoutFeedback
                style={styles.goToTrainings}
                onPress={() =>
                  navigation.navigate("MyTrainings", { team: team })
                }
              >
                <Block flex row style={styles.goToTrainingsContainer}>
                  <Text
                    style={{
                      fontFamily: "open-sans-bold",
                      fontSize: 10,
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

              {/* create training */}
              <TouchableWithoutFeedback
                style={styles.createTrainings}
                onPress={() =>
                  navigation.navigate("CreateTraining", { team: team })
                }
              >
                <Block flex row style={styles.createTrainingsContainer}>
                  <Text
                    style={{
                      fontFamily: "open-sans-bold",
                      fontSize: 10,
                      color: "#FFFFFF",
                    }}
                    small
                    color={"#30444E"}
                    shadowless
                  >
                    {"Crear entreno"}
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
            </Block>

            {/* coach info */}
            <Block style={{ marginTop: 8 }}>
              <ProfileTeamCoachMiniature item={user} />
            </Block>

            {/* team media */}
            {team.media.length ? <>{renderCards()}</> : <></>}

            {/* team members list */}
            <Block style={styles.membersContainer}>
              <Text style={styles.membersTextTitle}>Jugadores</Text>
              <View style={styles.gridContainer}>
                <FlatList
                  data={teamMembers}
                  renderItem={({ item }) => (
                    <View
                      style={{ flex: 1, flexDirection: "column", margin: 1 }}
                    >
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
        ) : (
          <>
            <Block style={styles.holderContainer}>
              <Image source={Rocket} style={styles.rocketImage} />
              <Text style={styles.holderTitle}>Crea tu equipo</Text>
              <Text style={styles.holderDescription}>
                Puedes reservar partidos y crear entrenos para tu propia
                comunidad, en una cancha o en un lugar donde indiques para que todos
                puedan ir a jugar !
              </Text>
            </Block>
            <Block
              style={{
                alignSelf: "center",
                borderColor: "#475E69",
                width: "100%",
                borderWidth: StyleSheet.hairlineWidth,
                marginTop: 90,
              }}
            />
            <Block>
              <Button
                style={styles.createButton}
                textStyle={{ fontFamily: "open-sans-bold", fontSize: 14 }}
                small
                color={"success"}
                shadowless
                onPress={handleTeamCreationButton}
              >
                {"Crear Equipo"}
              </Button>
            </Block>

            <Block
              style={{
                opacity: 100,
                alignSelf: "center",
                borderColor: "#475E69",
                width: "100%",
                borderWidth: StyleSheet.hairlineWidth,
                marginTop: 70,
              }}
            />
          </>
        )}
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
  holderContainer: {
    top: 20, 
    alignSelf: 'center', 
  },
  deals: {
    width,
    backgroundColor: "#22343C",
  },
  rocketImage: {
    width: 300,
    height: 300,
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
  createTrainings: {
    flex: 1,
    width: 100,
    height: 40,
    padding: 8,
    right: 4,
  },
  goToTrainingsContainer: {
    alignItems: "center",
    backgroundColor: "#30444E",
    width: 0,
    height: 32,
    top: 4,
    padding: 8,
    borderRadius: 4,
    width: 112,
  },
  createTrainingsContainer: {
    alignItems: "center",
    backgroundColor: "#30444E",
    height: 32,
    marginLeft: 12,
    top: 4,
    padding: 8,
    borderRadius: 4,
    width: 112,
  },
  membersTextTitle: {
    marginBottom: 15,
    fontFamily: "open-sans-bold",
    marginHorizontal: 12,
    marginTop: 8,
    color: "#ffffff",
    fontSize: 20,
  },
  membersListTitle: {
    marginBottom: 15,
    marginLeft: 16,
    fontFamily: "open-sans-bold",
    color: "#ffffff",
    fontSize: 12,
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
  holderTitle: { 
    top: 20, 
    alignSelf: 'center',
    fontFamily: "open-sans-bold",
    fontSize: 24,
    color: argonTheme.COLORS.WHITE
  },
  holderDescription: { 
    paddingHorizontal: 16,
    top: 32, 
    textAlign: 'justify',
    alignSelf: 'center',
    fontFamily: "open-sans-regular",
    fontSize: 18,
    color: "#96A7AF"
  },
  createButton: {
    width: 150, 
    height: 38,
    alignSelf: 'center',
    top: 32
  }
});

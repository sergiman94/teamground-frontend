import React from "react";
import {
  Animated,
  FlatList,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback, Image
} from "react-native";
import { Block, Text, Input, theme } from "galio-framework";
const { width } = Dimensions.get("screen");
import { argonTheme } from "../../constants/";
import { Icon, Button } from "../../components/";
import axios from "axios";
import { BOOKINGS_URL, formatTime } from "../../utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class SearchBookings extends React.Component {
  state = {
    results: [],
    search: "",
    active: false,
    role: "player"
  };
  animatedValue = new Animated.Value(0);
  animate() {
    this.animatedValue.setValue(0);
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }

 async componentDidMount() {
    let role = await AsyncStorage.getItem('@user_role')
    this.setState({role: role})
  }

  handleSearchChange = async search => {
    let userId = await AsyncStorage.getItem('@user_id')
    let results = await (await axios.get(`${BOOKINGS_URL}/active/${userId}?data=${search}`)).data.data
    this.setState({ results, search });
    this.animate();
  };

  renderSearch = () => {
    const { search } = this.state;
    const iconSearch = search ? (
      <TouchableWithoutFeedback onPress={() => this.setState({ search: "" })}>
        <Icon
          size={16}
          color={theme.COLORS.MUTED}
          name="magnifying-glass"
          family="entypo"
        />
      </TouchableWithoutFeedback>
    ) : (
      <Icon
        size={16}
        color={theme.COLORS.MUTED}
        name="magnifying-glass"
        family="entypo"
      />
    );

    return (
      <Input
        right
        color="white"
        autoFocus={true}
        autoCorrect={false}
        autoCapitalize="none"
        iconContent={iconSearch}
        defaultValue={search}
        style={[styles.search, this.state.active ? styles.shadow : null]}
        placeholder="Que estas buscando ?"
        onFocus={() => this.setState({ active: true })}
        onBlur={() => this.setState({ active: false })}
        onChangeText={this.handleSearchChange}
      />
    );
  };

  renderNotFound = () => {
    return (
      <Block style={styles.notfound}>
        <Text style={{ fontFamily: 'open-sans-bold' }} size={18} color={argonTheme.COLORS.WHITE}>
          No encontramos resultados para "<Text bold>{this.state.search}</Text>" 
        </Text>
      </Block>
    );
  };

  renderBookings = (item) => {
    const { navigation } = this.props;
    return (
      <Block>
        <Block card shadow style={styles.product}>
          <Block flex row>
            <TouchableWithoutFeedback
              onPress={() => navigation.navigate("Product", { product: item })}
            >
              <Block style={styles.imageHorizontal}>
                <Image
                  source={{ uri: item.image }}
                  style={{
                    height: theme.SIZES.BASE * 5,
                    marginTop: -theme.SIZES.BASE,
                    borderRadius: 3,
                  }}
                />
              </Block>
            </TouchableWithoutFeedback>
            <Block flex style={styles.productDescription}>
              <Text
                size={14}
                style={styles.productTitle}
                color={argonTheme.COLORS.TEXT}
              >
                {item.title}
              </Text>

              <Block flex row space="between">
                <Block bottom>
                  {item.confirmedAction ? <Text
                    style={{
                      marginBottom: 20,
                      fontFamily: "open-sans-regular",
                    }}
                    size={theme.SIZES.BASE * 0.75}
                    color={argonTheme.COLORS[item.confirmed ? "SUCCESS" : "ERROR"]}
                  >
                    {item.confirmed ? "Confirmada" : "Rechazada"}
                  </Text> : <></> }
                </Block>
                <Block bottom>
                  <Text
                    style={{ fontFamily: "open-sans-regular" }}
                    size={theme.SIZES.BASE * 0.75}
                    color={argonTheme.COLORS.ACTIVE}
                  ></Text>
                </Block>
              </Block>
            </Block>
          </Block>
          <Block flex row space="between" style={styles.options}>

            <Block>
              <Text
                style={{ marginTop: 14, fontFamily: "open-sans-regular" }}
                size={theme.SIZES.BASE * 0.75}
                color={argonTheme.COLORS.ACTIVE}
              >
                {item.date}
              </Text>
              <Text
                style={{ marginTop: 14, fontFamily: "open-sans-regular" }}
                size={theme.SIZES.BASE * 0.75}
                color={argonTheme.COLORS.ACTIVE}
              >
                {formatTime(item.time)}
              </Text>
            </Block>
            {this.state.role !== 'field' ? 
              <Block>

                <Button
                  small
                  shadowless
                  textStyle={styles.optionsButtonText}
                  style={styles.optionsButton}
                  onPress={() => handleBookingDescription(item)}
                >
                  Ver Reserva
                </Button>

                {item.status === 'canceled' ? <>
                  <Button
                    textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                    small
                    color={"warning"}
                  >
                    CANCELADO
                  </Button>
                </> : <></>}

                {item.status === 'outdated' ? <>
                  <Button
                    textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                    small
                    color={"warning"}
                  >
                    TERMINADO
                  </Button>
                </> : <></>}

              </Block>
            
            : <></>}
          </Block>
          {this.state.role !== 'player' && !item.confirmedAction ? <>
            <Button
              small
              shadowless
              color="success"
              textStyle={styles.optionsButtonText}
              style={styles.optionsButton}
              onPress={() => handleBookingConfirmation("true", item.key)}
            >
              Confirmar Reserva
            </Button>

            <Button
              small
              shadowless
              color="error"
              textStyle={styles.optionsButtonText}
              style={styles.optionsButton}
              onPress={() => handleBookingConfirmation("false", item.key)}
            >
              Confirmar Reserva
            </Button>
          </> : <></>}
        </Block>
      </Block>
    );
  };

  renderResult = result => {
    const opacity = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp"
    });

    return (
      <Animated.View
        style={{ width: width - theme.SIZES.BASE * 2, opacity }}
        key={`result-${result.title}`}
      >
        <Block>
        <Block card shadow style={styles.product}>
          <Block flex row>
            <TouchableWithoutFeedback>
              <Block style={styles.imageBookingHorizontal}>
                <Image
                  source={{ uri: result.image }}
                  style={{
                    height: theme.SIZES.BASE * 5,
                    marginTop: -theme.SIZES.BASE,
                    borderRadius: 3,
                  }}
                />
              </Block>
            </TouchableWithoutFeedback>
            <Block flex style={styles.productDescription}>
              <Text
                style={{ marginTop: 14, fontFamily: "open-sans-bold" }}
                size={16}
                color={argonTheme.COLORS.WHITE}
              >
                {result.title}
              </Text>

              <Block flex row space="between">
                <Block bottom>
                  {result.confirmedAction ? <Button
                      style={{ width: 70, height: 30, right: 6 }}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                      small
                      color={result.confirmed ? "success" : "error"}
                      shadowless
                    >
                      {result.confirmed ? "Confirmada" : "Rechazada"}
                    </Button> : <></> }
                </Block>
                <Block bottom>
                  <Text
                    style={{ fontFamily: "open-sans-regular" }}
                    size={theme.SIZES.BASE * 0.75}
                    color={argonTheme.COLORS.WHITE}
                  ></Text>
                </Block>
              </Block>
            </Block>
          </Block>
          <Block flex row space="between" style={styles.options}>

          <Block>
              <Text
                style={{ marginTop: 14, fontFamily: "open-sans-regular" }}
                size={16}
                color={argonTheme.COLORS.WHITE}
              >
                {result.date}
              </Text>
              <Text
                style={{ marginTop: 14, fontFamily: "open-sans-regular" }}
                size={16}
                color={argonTheme.COLORS.WHITE}
              >
                {formatTime(result.time)}
              </Text>
            </Block>
            {this.state.role !== 'field' ? 
              <Block>
                <Button
                  small
                  shadowless
                  color="default"
                  textStyle={styles.optionsButtonText}
                  style={styles.optionsButton}
                  onPress={() => handleBookingDescription(result)}
                >
                  Ver Reserva
                </Button>

                {result.status === 'canceled' ? <>
                  <Button
                    textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                    small
                    color={"warning"}
                  >
                    CANCELADO
                  </Button>
                </> : <></>}

                {result.status === 'outdated' ? <>
                  <Button
                    textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                    small
                    color={"warning"}
                  >
                    TERMINADO
                  </Button>
                </> : <></>}

              </Block>
            
            : <></>}
          </Block>
          {this.state.role !== 'player' && !result.confirmedAction ? <>
            <Button
              small
              shadowless
              color="success"
              textStyle={styles.optionsButtonText}
              style={styles.optionsButton}
              onPress={() => handleBookingConfirmation("true", result.key)}
            >
              Confirmar Reserva
            </Button>

            <Button
              small
              shadowless
              color="error"
              textStyle={styles.optionsButtonText}
              style={styles.optionsButton}
              onPress={() => handleBookingConfirmation("false", result.key)}
            >
              Confirmar Reserva
            </Button>
          </> : <></>}
        </Block>
      </Block>
        
      </Animated.View>
    );
  };

  renderResults = () => {
    const { results, search } = this.state;
    if (results.length === 0 && search) {
      return (
        <Block style={{ width: width - 40 }}>
          {this.renderNotFound()}
        </Block>
      );
    }

    return (
      <Block style={{ paddingTop: theme.SIZES.BASE * 2 }}>
        {results.map(result => this.renderResult(result))}
      </Block>
    );
  };

  render() {
    return (
      <Block flex center style={styles.searchContainer}>
        <Block center style={styles.header}>
          {this.renderSearch()}
        </Block>
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.renderResults()}
        </ScrollView>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  searchContainer: {
    width: width,
    paddingHorizontal: theme.SIZES.BASE,
    backgroundColor: "#22343C",
  },
  productTitle: {
    fontFamily: "open-sans-regular",
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6,
  },
  product: {
    width: width - 20, 
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE - 20,
    backgroundColor: "#30444E",
    borderRadius: 5
  },
  options: {
    padding: theme.SIZES.BASE / 2,
  },

  optionsButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: theme.SIZES.BASE * 0.75,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    backgroundColor: "#286053",
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: "#30444E",
    borderColor: "#30444E" 
  },
  shadow: {
    
  },
  header: {
    backgroundColor: "#22343C",
    elevation: 2,
    zIndex: 2
  },
  notfound: {
    marginVertical: theme.SIZES.BASE * 2
  },
  suggestion: {
    height: theme.SIZES.BASE * 1.5,
    marginBottom: theme.SIZES.BASE
  },
  result: {
    backgroundColor: theme.COLORS.WHITE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 0
  },
  resultTitle: {
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
  },
  resultDescription: {
    padding: theme.SIZES.BASE / 2
  },
  image: {
    overflow: "hidden",
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4
  },
  dealsContainer: {
    justifyContent: "center",
    paddingTop: theme.SIZES.BASE
  },
  deals: {
    backgroundColor: theme.COLORS.WHITE,
    marginBottom: theme.SIZES.BASE,
    borderWidth: 0
  },
  dealsTitle: {
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
  },
  dealsDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageHorizontal: {
    overflow: "hidden",
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4
  },
  imageBookingHorizontal: {
    width: theme.SIZES.BASE * 6.25,
    margin: theme.SIZES.BASE / 2,
  },
  imageVertical: {
    overflow: "hidden",
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4
  },
  productDescription: {
    padding: theme.SIZES.BASE / 2,
  },
});

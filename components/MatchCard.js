import React, { useEffect, useState } from "react";
import { StyleSheet, Image, TouchableWithoutFeedback, LogBox } from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Button, Icon } from "../components";
import { argonTheme, Images } from "../constants";
import axios from "axios";
import { FIELDS_URL, MATCHES_URL } from "../utils/utils.";

export default function MatchCard(props) {
  const { navigation, horizontal, style, withoutCta, fieldProp, home } = props;
  const [item, setItem] = useState(props.item)
  const cardContainer = !home ? [styles.card, style] : [styles.cardHome, style];
  const [field, setField] = useState({})

  const loadField = async (itemParam) => {
    const fieldData = (await axios.get(`${FIELDS_URL}/${item.field}`)).data.data
    setField(fieldData)
  }

  const handleMatchRedirection = (item) => {
    navigation.navigate("Match", { match: item, field: field })
  }

  const loadMatch = async () => {
    const matchData = (await axios.get(`${MATCHES_URL}/${item}`)).data.data
    setField(fieldProp)
    setItem(matchData)
  }

  useEffect(() => {
    if (typeof item !== 'object') {
      loadMatch()
    } else {
      loadField()
    }
  },[])

  return (
    <Block row={horizontal} card flex style={cardContainer}>
      {/* left side */}
      <Block flex space="between" style={styles.cardDescription}>
        <Block flex>
          {/* location */}
          <Block flex row>
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
              {field ? field.field : "-" }
            </Text>
          </Block>

          {/* modality */}
          <Block flex row>
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
              {item.modality}
            </Text>
          </Block>

          {/* calendar */}
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
        </Block>

        {/* badge outdated */}
        {item.status === "active" ? (
          <Button
            textStyle={{ fontFamily: "open-sans-bold", fontSize: 8 }}
            style={{ marginLeft: 0, width: 40, height: 20 }}
            small
            color={"success"}
          >
            ACTIVO
          </Button>
        ) : (
          <></>
        )}

        {/* badge canceled */}
        {item.status === "canceled" ? (
          <Button
            textStyle={{ fontFamily: "open-sans-bold", fontSize: 8 }}
            style={{ marginLeft: 0, width: 60, height: 20 }}
            small
            color={"warning"}
          >
            CANCELADO
          </Button>
        ) : (
          <></>
        )}

        {/* badge outdated */}
        {item.status === "outdated" ? (
          <Button
            textStyle={{ fontFamily: "open-sans-bold", fontSize: 8 }}
            style={{ marginLeft: 0, width: 60, height: 20 }}
            small
            color={"warning"}
          >
            TERMINADO
          </Button>
        ) : (
          <></>
        )}

        {withoutCta ? (
          <></>
        ) : (
          <TouchableWithoutFeedback
            onPress={() => handleMatchRedirection(item)}
          >
            <Block flex space="between" style={{ marginTop: 8 }}>
              <Block flex row>
                <Text
                  style={{ fontFamily: "open-sans-bold" }}
                  size={12}
                  muted={false}
                  color={"#FFFFFF"}
                  bold
                >
                  {"Ver detalles"}
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
        )}
      </Block>

      {/* right side */}
      <Block flex style={styles.imageContainer}>
        <Image
          source={ field && field.image ? { uri: field.image } : Images.CardPlaceholder }
          style={styles.horizontalImage}
        />
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

  },
  cardHome: {
    backgroundColor: "#30444E",
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 4,
    marginRight: 20,
    borderRadius: 12,
  },
  cardTitle: {
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 12,
    paddingBottom: 8,
    left: 8,
  },
  cardDescription: {
    padding: 12,
  },
  horizontalImage: {
    height: 150,
    width: 164,
  },
  fullImage: {
    height: 215,
  },
  imageContainer: {
    marginLeft: 12,
    borderRadius: 3,
    overflow: "hidden",
    borderRadius: 8
  },
  horizontalStyles: {},
});

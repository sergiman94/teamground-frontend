import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  BackHandler,
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { Card, Button, Input, Icon } from "../../components/";
import axios from "axios";
import { FIELDS_URL, MATCHES_URL, TRAININGS_URL } from "../../utils/utils.";
import { argonTheme } from "../../constants";
import DropdownComponent from "../../components/Dropdown";
const { width } = Dimensions.get("screen");
import DatePicker from "react-native-modern-datepicker";
import { Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SnackBar from "react-native-snackbar-component";

export default function CreateTraining(props) {
  const { navigation, route } = props;
  const [fieldsData, setFieldsData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [fieldValue, setFieldValue] = useState("");

  /** snackbar states */
  const [visible, setVisible] = React.useState(true);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progressBar, setProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [currentDate, setCurrentDate] = useState("");
  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [fieldInput, setFieldInput] = useState("");

  const handleCreateMatch = async (item) => {
    setButtonLoading(true);
    let days = [
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
      "Domingo",
    ];
    let months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    let date = selectedDate.split(" ")[0].replace("/", "-");
    let time = selectedDate.split(" ")[1];
    let formattedDate = new Date(date.replace("/", "-"));
    let day = days[formattedDate.getDay()];
    let dayOfMonth = formattedDate.getDate() + 1;
    let month = months[formattedDate.getMonth()];

    let finalDate = day + " " + dayOfMonth + " de " + month;

    let userID = await AsyncStorage.getItem("@user_id");
    let organizer = userID;

    let body = {
      team: route.params?.team.key,
      field: fieldValue ? fieldValue : null,
      location: fieldInput ? fieldInput : null,
      date: finalDate,
      hour: time,
      coach: organizer,
      timestamp: Math.floor(
        new Date(formattedDate).getTime() / 1000
      ).toString(),
    };

    
    if (body.field === null && body.location === null) {
      setShowSnackbar(true);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("Escribe la direccion del lugar de entrenamiento");
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1500);
    } else {
      console.log(body);
      await axios
        .post(TRAININGS_URL, body)
        .then((response) => navigation.navigate("MyTrainings", {team: { key: response.data.data.team}}))
        .catch((e) => {
          console.log(e)
          setShowSnackbar(true);
          setSnackbarColor("#BB6556");
          setSnackbarMessage("No se pudo crear el entreno");
          setTimeout(() => {
            setShowSnackbar(false);
          }, 1500);
        });
    }
    setButtonLoading(false);
  };

  /** get field value from dropdown props */
  const getFieldValue = (value) => {
    setFieldValue(value);
  };

  async function getFields() {
    let date = new Date();
    let currentDateFormat = `${date.getFullYear()}-${
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate()}`;
    setCurrentDate(currentDateFormat);

    let fieldsArr = [];
    let fields = await (await axios.get(FIELDS_URL)).data;
    if (fields.data.length > 0) {
      fields.data.map((item) => {
        let data = { label: item.field, value: item.key };
        fieldsArr.push(data);
      });
    }
    setFieldsData([{ label: "Sin Cancha", value: null }, ...fieldsArr]);
  }

  useEffect(() => {
    getFields();
  }, []);

  const renderProducts = () => {
    const { navigation, route } = props;

    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.products}
        >
          <Block flex style={{ marginTop: 100, padding: 10 }}>
            <SnackBar
              visible={showSnackbar}
              position={"top"}
              backgroundColor={snackbarColor}
              textMessage={snackbarMessage}
            />

            <Text
              style={{ marginBottom: 24, fontFamily: "open-sans-bold" }}
              size={20}
              color={argonTheme.COLORS.WHITE}
            >
              ¡ Crea tu entreno !
            </Text>

            {/* field selection */}
            <Text
              style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
              size={14}
              color={argonTheme.COLORS.WHITE}
            >
              1. Elige una cancha para el entrenamiento o escribe la direccion
              del lugar del entrenamiento
            </Text>

            {fieldsData.length && fieldValue !== null ? (
              <DropdownComponent
                handleValue={getFieldValue}
                data={fieldsData}
                placeholder={"Selecciona una cancha"}
              />
            ) : (
              <>
                <Block style={{ top: 4 }} width={width * 0.8}>
                  <Input
                    borderless
                    style={{ backgroundColor: "#30444E" }}
                    color={"#FFFFFF"}
                    placeholder="Direccion lugar del entreno"
                    onChangeText={(value) => setFieldInput(value)}
                  />
                </Block>
              </>
            )}

            {/* seleccionar fecha y hora */}
            {fieldValue !== "" ? (
              <>
                <Text
                  style={{
                    marginTop: 12,
                    marginBottom: 0,
                    fontFamily: "open-sans-regular",
                  }}
                  size={14}
                  color={argonTheme.COLORS.WHITE}
                >
                  2. Indica la fecha y hora de tu entreno
                </Text>

                <DatePicker
                  options={{
                    backgroundColor: "#30444E",
                    textHeaderColor: "#3DD598",
                    textDefaultColor: "#96A7AF",
                    selectedTextColor: "#286053",
                    mainColor: "#3DD598",
                    textSecondaryColor: "#ffffff",
                    borderColor: "#30444E",
                  }}
                  style={{ marginTop: 20 }}
                  selected={currentDate}
                  currrent={new Date()}
                  minimumDate={currentDate}
                  minuteInterval={30}
                  onSelectedChange={(date) => setSelectedDate(date)}
                />

                <Block flex center style={{ marginLeft: 3 }}>
                  <Button
                    loading={buttonLoading}
                    onPress={(item) => {
                      handleCreateMatch(item);
                    }}
                    textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                    center
                    style={{ marginTop: 24, backgroundColor: "#286053" }}
                  >
                    Confirmar
                  </Button>
                </Block>
              </>
            ) : (
              <></>
            )}
          </Block>
        </ScrollView>
      </>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {renderProducts()}
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
});

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { Button } from "../../components/";
import axios from "axios";
import { FIELDS_URL, MATCHES_URL } from "../../utils/utils.";
import { argonTheme } from "../../constants";
import DropdownComponent from "../../components/Dropdown";
const { width } = Dimensions.get("screen");
import DatePicker from "react-native-modern-datepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SnackBar from 'react-native-snackbar-component'
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'

export default function CreateMatch(props) {
  const [fieldsData, setFieldsData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [modalityValue, setModalityValue] = useState("");

  /** snackbar states */
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarColor, setSnackbarColor] = useState("#93C46F")
  const [snackbarMessage, setSnackbarMessage] = useState("this is a test message")
  const [currentDate, setCurrentDate] = useState("")
  const [buttonLoading, setButtonLoading] = React.useState(false)

  const modality = [
    { label: "5 - 5", value: "5-5:10" },
    { label: "11 - 11", value: "11-11:22" },
  ];

  const handleCreateMatch = async () => {
    setButtonLoading(true)
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

    let userID = await AsyncStorage.getItem('@user_id')
    let organizer = userID;

    let body = {
      field: fieldValue,
      players: String(modalityValue).split(":")[1],
      modality: String(modalityValue).split(":")[0],
      date: finalDate,
      hour: time,
      organizer: organizer,
      timestamp: Math.floor(new Date(formattedDate).getTime() / 1000).toString()
    };

    const { navigation } = props;
    let today = new Date()
    let matchtimestamp =  new Date(Number(body.timestamp) * 1000)
    let todayFormatted = Number(`${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`)
    let matchtimestampFormatted = Number(`${matchtimestamp.getFullYear()}${matchtimestamp.getMonth()+1}${matchtimestamp.getDate()+1}`)
    if (matchtimestampFormatted < todayFormatted) {
      setShowSnackbar(true)
      setSnackbarColor("#BB6556")
      setSnackbarMessage("La fecha seleccionada no es valida")
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1500);
    } else {
      await axios
        .post(MATCHES_URL, body)
        .then(() => navigation.navigate("Home", { reload: true, created: true}));
    }
    setButtonLoading(false)
  };

  // get field value from dropdown props
  const getFieldValue = (value) => {
    setFieldValue(value);
  };

  // get modality value from dropdown props
  const getModalityValue = (value) => {
    setModalityValue(value);
  };

  // fetch fields
  async function getFields() {
    let date = new Date()
    let currentDateFormat = `${date.getFullYear()}-${date.getMonth()+1 < 10 ? `0${date.getMonth()+1}`: date.getMonth()+1}-${date.getDate()}`
    setCurrentDate(currentDateFormat)

    let fieldsArr = [];
    let fields = await (await axios.get(FIELDS_URL)).data;
    if (fields.data.length > 0) {
      fields.data.map((item) => {
        let data = { label: item.field, value: item.key };
        fieldsArr.push(data);
      });
    }
    setFieldsData(fieldsArr);
  }

  const MyLoader = () => (
    <ContentLoader
      speed={1}
      width={width}
      height={170}
      viewBox="0 -2 300 80"
      backgroundColor="#30444E"
      foregroundColor="black"
    >
      <Rect x="20" y="8" rx="3" ry="3" width="270" height="10" />
      <Rect x="20" y="26" rx="3" ry="3" width="270" height="10" />
    </ContentLoader>
  );

  useEffect(() => {
    getFields();
  }, []);

  const renderProducts = () => {
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
              ¡ Crea tu partido !
            </Text>

            {/* field selection */}
            <Text
              style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
              size={14}
              color={argonTheme.COLORS.WHITE}
            >
              1. Selecciona la cancha en donde quieres jugar
            </Text>

            {fieldsData.length > 0 ? (
              <DropdownComponent
                handleValue={getFieldValue}
                data={fieldsData}
                placeholder={"Selecciona una cancha"}
              />
            ) : (
              <>
                <MyLoader/>
              </>
            )}

            {/* select modality */}
            {fieldValue !== "" ? (
              <Text
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  fontFamily: "open-sans-regular",
                }}
                size={14}
                color={argonTheme.COLORS.WHITE}
              >
                2. Selecciona la modalidad de tu partido
              </Text>
            ) : (
              <></>
            )}

            {fieldValue !== "" ? (
              <DropdownComponent
                handleValue={getModalityValue}
                data={modality}
                placeholder={"Selecciona una modalidad"}
              />
            ) : (
              <></>
            )}

            {/* seleccionar fecha y hora */}
            {modalityValue !== "" ? (
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
                  3. Reserva la fecha y hora de tu partido
                </Text>

                <DatePicker
                  options={{
                    backgroundColor: '#30444E',
                    textHeaderColor: '#3DD598',
                    textDefaultColor: '#96A7AF',
                    selectedTextColor: '#286053',
                    mainColor: '#3DD598',
                    textSecondaryColor: '#ffffff',
                    borderColor: '#30444E',
                    
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
                    style={{ marginTop: 24, backgroundColor: "#286053"}}

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

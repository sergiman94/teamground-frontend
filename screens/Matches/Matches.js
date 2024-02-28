import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ScrollView, RefreshControl } from "react-native";
import { Block, theme } from "galio-framework";
import MatchCard from "../../components/MatchCard";
import FieldCard from "../../components/FieldCard";
import axios from "axios";
import { FIELDS_URL, MATCHES_URL, USERS_URL } from "../../utils/utils.";
import { FloatingAction } from "react-native-floating-action";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'
import Tabs from "../../components/Tabs";
const { width } = Dimensions.get("screen");

export default function Matches(props) {
  const { navigation, route } = props;
  const [matches, setMatches] = useState([])
  const [todayMatches, setTodayMatches] = useState([])
  const [fields, setFields] = useState([])
  const [progressBar, setProgressBar] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [myMatches, setMyMatches] = useState([])
  const [fieldsCurrentPage, setFieldsCurrentPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false);
  const [tabId, setTabId] = useState("");

  const onRefresh = React.useCallback(() => {
    setFields([])
    setMatches([])
    setCurrentPage(1)
    setFieldsCurrentPage(1)
    setRefreshing(true);
    let loads = [loadMatches(), loadFields(), loadTodayMatches(), loadMyMatches()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const renderTabs = () => {
    const { navigation } = props;

    let tabs = [
      { id: "allmatches", title: "Todos" },
      { id: "todayMatches", title: "Hoy" },
      { id: "fieldsMatches", title: "Canchas" },
      { id: "myMatches", title: "Mis Partidos" },
    ];

    let tabIndex = 0;

    const defaultTab = tabs && tabs[0] && tabs[0].id;

    if (!tabs) return null;

    return (
      <Tabs
        transparent
        data={tabs || []}
        initialIndex={tabIndex || defaultTab}
        onChange={(id) => navigation.setParams({ tabId: id })}
      />
    );
  };
  
  // matches
  const loadMatches = async () => {
    setProgressBar(true)
    setFields([])
    setTodayMatches([])
    setMyMatches([])
    /** get matches from db */
    await axios.get(`${MATCHES_URL}?page=${currentPage}`).then(response => {
      setProgressBar(false)
      if (response.data.data.length > 0) {
        setMatches([...matches, ...response.data.data])
      }
    })
  };

  // fields 
  const loadFields = async () => {
    setProgressBar(true)
    setMatches([])
    setTodayMatches([])
    setMyMatches([])
    /** get fields from db */
    await axios.get(`${FIELDS_URL}?page=${fieldsCurrentPage}`).then(response => {
      setProgressBar(false)
      if (response.data.data.length > 0) {
        setFields([...fields, ...response.data.data])
      }  
    })
    
  }

  // today matches
  const loadTodayMatches = async () => {
    setMatches([])
    setFields([])
    setTodayMatches([])
    // setting up calendars
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
    let todayMatches = [];
    let date = new Date();
    let day = days[date.getDay() - 1];
    let dayOfMonth = date.getDate();
    let month = months[date.getMonth()];
    let todayDate = day + " " + dayOfMonth + " de " + month;

    // fetching matches and mapping the ones that are happening today 
    let matches = (await axios.get(MATCHES_URL)).data;
    matches.data.map((match) => {
      if (match.date === todayDate) todayMatches.push(match);
    });
    setTodayMatches(todayMatches)
  }

  // my matche
  const loadMyMatches = async () => {
    setMatches([])
    setFields([])
    setTodayMatches([])
    let userID = await AsyncStorage.getItem('@user_id')
    if (userID) {
      setCurrentPage(1)
      await loadMatches()
      let currentUserMatches = matches.filter(match => match.organizer === userID)
      console.log(currentUserMatches)
      setMyMatches(currentUserMatches)
    } else {
      navigation.navigate("AuthenticationHandler")
    }
  }

  const handleFloatingAction = async (name) => {
    if (name === "create_match") {
      const { navigation, route } = props;
      navigation.navigate("CreateMatch");
    }
  };

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  const MyLoader = () => (
    <ContentLoader
      speed={1}
      width={width - 20} height={440}
      viewBox="0 40 380 200"
      backgroundColor="#30444E"
      foregroundColor="black"
    >
      <Rect x="0" y="20" rx="2" ry="0" width="400" height="150" />
      <Rect x="0" y="120" rx="2" ry="0" width="400" height="150" />
      <Rect x="0" y="320" rx="2" ry="0" width="400" height="150" />
    </ContentLoader>
  );

  // load progress bar
  useEffect(() => {
    const {progressBar} = props
    setProgressBar(progressBar)
  }, [])

  // load matches at initialization
  useEffect(() => {
    loadMatches()
  }, [])

  // load matches for next page
  useEffect(() => {
    loadMatches()
  }, [currentPage])

  // load fields for next page
  useEffect(() => {
    loadFields()
  }, [fieldsCurrentPage])

  useEffect(() => {
    setTabId(route.params?.tabId)
    props.getComponentTitle("Partidos")
  })

  // when a tab changes 
  useEffect(() => {
    if (tabId === "allmatches") {
      setCurrentPage(1)
      loadMatches()
    } else if (tabId === "fieldsMatches") {
      setFieldsCurrentPage(1)
      loadFields()
    } else if (tabId === "todayMatches") {
      setFieldsCurrentPage(1)
      loadTodayMatches()
    } else if (tabId === "myMatches") {
      setFieldsCurrentPage(1)
      loadMyMatches()
    }
  }, [tabId])

  const renderProducts = () => {
    const actions = [
      {
        text: "Crear partido",
        icon: require("../../assets/imgs/icons/field_icon.png"),
        name: "create_match",
        position: 1,
        color: "#FF565E"
      },
    ];
  
    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.products}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              if (tabId === "allmatches") {
                setCurrentPage(currentPage + 1);
              } else {
                setFieldsCurrentPage(fieldsCurrentPage + 1);
              }
            }
          }}
          scrollEventThrottle={400}
        >
          {progressBar ? (
            <Progress.Bar
              width={width - theme.SIZES.BASE - 20}
              indeterminate={true}
            />
          ) : (
            <></>
          )}

          {/* Render tabs */}
        <Block style={styles.tabsContainer}>{renderTabs()}</Block>

          {tabId && tabId === "allmatches" ? (
            <Block flex>
              {matches.length > 0 ? (
                matches.map((match) => (
                  <MatchCard
                    item={match}
                    newUser={props.updateMatchesFromChild}
                    horizontal
                    {...props}
                  />
                ))
              ) : (
                <>
                  <MyLoader />
                </>
              )}
            </Block>
          ) : tabId && tabId === "todayMatches" ? (
            <Block flex>
              {todayMatches && todayMatches.length > 0 ? (
                todayMatches.map((todayMatch) => (
                  <MatchCard item={todayMatch} horizontal {...props}/>
                ))
              ) : (
                <>
                  <MyLoader />
                </>
              )}
            </Block>
          ) : tabId && tabId === "myMatches" ? (
            <Block flex>
              {myMatches && myMatches.length > 0 ? (
                myMatches.map((myMatch) => (
                  <MatchCard
                    item={myMatch}
                    newUser={props.updateMatchesFromChild}
                    horizontal
                    {...props}
                  />
                ))
              ) : (
                <>
                  <MyLoader />
                </>
              )}
            </Block>
          ) : (
            <Block flex>
              {fields && fields.length > 0 ? (
                fields.map((product) => (
                  <FieldCard item={product} full component="FieldsMatches" />
                ))
              ) : (
                <>
                  <MyLoader />
                </>
              )}
            </Block>
          )}
        </ScrollView>

        <FloatingAction
          actions={actions}
          style={styles.floatinBtn}
          onPressItem={(name) => handleFloatingAction(name)}
          color={"#FF565E"}
        />
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
    backgroundColor: "#22343C",
    width,
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  floatinBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FFFFFF"
  },
  tabsContainer: { 
    marginTop: 12
  }
});

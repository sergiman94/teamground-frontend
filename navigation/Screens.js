import { Animated, Dimensions, Easing } from "react-native";
// header for screens
import { Header, Icon } from "../components";
import { argonTheme, tabs } from "../constants";

import AboutScreen from "../screens/About";
import AgreementScreen from "../screens/Agreement";
import Articles from "../screens/Articles";
import Beauty from "../screens/Beauty";
import Cart from "../screens/Cart";
import Chat from "../screens/Chat";
import Elements from "../screens/Elements";
import Fashion from "../screens/Fashion";
import NotificationsScreen from "../screens/Notifications";
import PrivacyScreen from "../screens/Privacy";
import Pro from "../screens/Pro";
import Product from "../screens/Product";
import SettingsScreen from "../screens/Settings";
import Register from "../screens/Register";
import Search from "../screens/Search";
import EditPromo from "../screens/Promos/EditPromo";
import CreatePromo from "../screens/Promos/CreatePromo";
import Promos from "../screens/Promos/Promos";
import FieldMedia from "../screens/Profile/FieldProfile";
import SystemNotifications from "../screens/SystemNotifications";
import YourZone from "../screens/Home/YourZone";


import Category from "../screens/Category";
import CustomDrawerContent from "./Menu";
import Gallery from "../screens/Media/Gallery";
import Home from "../screens/Home/Home";
import PersonalNotifications from "../screens/Notifications/PersonalNotifications";
import Profile from "../screens/Profile/Profile";
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import Highlighted from "../screens/Home/Highligted";
import Match from "../screens/Home/Match";
import FieldDescription from "../screens/Field/FieldDescription";
import PlayerProfile from "../screens/Profile/PlayerProfile";
import Matches from "../screens/Matches/Matches";
import Bookings from "../screens/Bookings/Bookings";
import BookingDescription from "../screens/Bookings/BookingDescription";
import Teams from "../screens/Teams/Teams";
import TeamDescription from "../screens/Teams/TeamDescription";
import CreateMatch from "../screens/Matches/CreateMatch";
import FieldsMatches from "../screens/Matches/FieldsMatches";
import Registration from "../screens/Authentication/Registration";
import Login from "../screens/Authentication/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PostDescription from "../screens/Posts/PostDescription";
import CreatePost from "../screens/Posts/CreatePost";
import EditProfile from "../screens/Profile/EditProfile";
import Calendar from "../screens/Calendar/Calendar";
import Calendarr from "../screens/Calendar/Calendar";
import Accounts from "../screens/Accounts/Accounts";
import Fields from "../screens/Field/Fields";
import CreateBookingComment from "../screens/Bookings/CreateBookingComment";
import SearchFields from "../screens/Field/SearchFields";
import SearchMatches from "../screens/Matches/SearchMatches";
import SearchBookings from "../screens/Bookings/SearchBookings";
import CreateFieldComment from "../screens/Field/CreateFieldComment";
import SearchHome from "../screens/Home/SearchHome";
import Picture from "../screens/Media/Picture";
import MediaMultipleSelection from "../screens/Media/MediaMultipleSelection";
import FieldProfile from "../screens/Profile/FieldProfile";
import EditFieldProfile from "../screens/Profile/EditFieldProfile";
import AuthenticationHandler from "../screens/Authentication/AuthenticationHandler";
import LoginHandler from "../screens/Authentication/LoginHandler";
import Training from "../screens/Trainings/Training";
import MyTeam from "../screens/Teams/MyTeam";
import CreateMyTeam from "../screens/Teams/CreateTeam";
import EditMyTeam from "../screens/Teams/EditMyTeam";
import SearchTeams from "../screens/Teams/SearchTeams";
import NextTrainings from "../screens/Trainings/NextTrainings";
import TrainingCalendar from "../screens/Trainings/TrainingCalendar";
import TrainingHistory from "../screens/Trainings/TrainingHistory";
import CreateTraining from "../screens/Trainings/CreateTraining";
import ResetPassword from "../screens/Authentication/ResetPassword";
const { width } = Dimensions.get("screen");
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/**
 * getComponentTitle is to identify the current 
 * interface title for tab icons, search mechanisms and more
 */
function Tabs (props) {
  const [role, setRole] = useState("player")
  const refresh = (role) => {
    setRole(role)
  }
  const getComponentTitle = (title) => {
    props.getComponentTitle(title)
  }
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          borderTopWidth: 0.1,
          backgroundColor: "#30444E",
          borderColor: "#30444E",
          borderWidth: 0.5,
        },
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let iconFamily;
          if (route.name === "Home") {
            iconName = "home";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Canchas") {
            iconName = "shop";
            iconFamily = "ArgonExtra";
          } else if (route.name === "Reservas") {
            iconName = "bookmark";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Partidos") {
            iconName = "futbol-o";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Calendario") {
            iconName = "calendar";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Perfil") {
            iconName = "user";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Equipos") { 
            iconName = "group"
            iconFamily = "Font-Awesome"
          }
          // You can return any component that you like here!
          return (
            <Icon
              name={iconName}
              family={iconFamily}
              size={20}
              color={color}
              style={{ marginTop: 10 }}
            />
          );
        },
      })}
      tabBarOptions={{
        activeTintColor: "#40DF9F",
        inactiveTintColor: "#96A7AF",
        labelStyle: {
          fontFamily: "open-sans-bold",
        },
      }}
    >
      {role && role === "field" ? (
        <>
          <Tab.Screen
            name="Home"
            children={() => <Home {...props} refresh={refresh} reload={props.reload}/>}
          />
          <Tab.Screen name="Calendario" children={() => <Calendar {...props} getComponentTitle={getComponentTitle}/>} />
          <Tab.Screen name="Reservas" children={() => <Bookings {...props} getComponentTitle={getComponentTitle}/>} />
          <Tab.Screen name="Perfil" children={() => <FieldProfile {...props} getComponentTitle={getComponentTitle}/>} />
        </>
      ) : role && role === "admin" ? (
        <>
          <Tab.Screen
            name="Home"
            children={() => <Home {...props} refresh={refresh} getComponentTitle={getComponentTitle} reload={props.reload} />}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Home"
            children={() => <Home {...props} refresh={refresh} getComponentTitle={getComponentTitle} reload={props.reload} />}
          />
          <Tab.Screen name="Partidos" children={() => <Matches {...props} getComponentTitle={getComponentTitle} />}/>
          <Tab.Screen name="Canchas" children={() => <Fields {...props} getComponentTitle={getComponentTitle} />}/>
          <Tab.Screen name="Equipos" children={() => <Teams {...props} getComponentTitle={getComponentTitle} />} />
          <Tab.Screen name="Reservas" children={() => <Bookings {...props} getComponentTitle={getComponentTitle} />} />
        </>
      )}
    </Tab.Navigator>
  );
}

function TrainingTabs(props) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          borderTopWidth: 0.1,
          backgroundColor: "#30444E",
          borderColor: "#30444E",
          borderWidth: 0.5,
        },
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let iconFamily;
          if (route.name === "Proximos Entrenos") {
            iconName = "share";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Calendario") {
            iconName = "calendar";
            iconFamily = "Font-Awesome";
          } else if (route.name === "Historial") {
            iconName = "book";
            iconFamily = "Font-Awesome";
          }
          // You can return any component that you like here!
          return (
            <Icon
              name={iconName}
              family={iconFamily}
              size={20}
              color={color}
              style={{ marginTop: 10 }}
            />
          );
        },
      })}
      tabBarOptions={{
        activeTintColor: "#40DF9F",
        inactiveTintColor: "#96A7AF",
        labelStyle: {
          fontFamily: "open-sans-bold",
        },
      }}
    >
      <>
        <Tab.Screen name="Proximos Entrenos" children={() => <NextTrainings {...props}/>} />
        <Tab.Screen name="Calendario" children={() => <TrainingCalendar {...props}/>} />
        <Tab.Screen name="Historial" children={() => <TrainingHistory {...props}/>} />
      </>
    </Tab.Navigator>
  );
}

function ProfileStack (props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Perfil"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Editar Perfil"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="Notifications"
        component={PersonalNotifications}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              title="Notifications"
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />
    </Stack.Navigator>
  );
}

function MyTeamStack (props) { 
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="MyTeam"
        component={MyTeam}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="MyTeam"
              back
              white
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />
      <Stack.Screen
        name="CreateMyTeam"
        component={CreateMyTeam}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="MyTeam"
              back
              white
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />
      <Stack.Screen
        name="EditMyTeam"
        component={EditMyTeam}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="MyTeam"
              back
              white
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="MediaMultipleSelection"
        component={MediaMultipleSelection}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              transparent
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              // white
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="MyTrainings"
        component={TrainingTabs}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
        }}
      />

      <Stack.Screen
        name="CreateTraining"
        component={CreateTraining}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              // white
              // transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack(props) {
  let reload = props.route.params ? props.route.params.reload : null
  const [title, setTitle] = useState("Home")
  const getComponentTitle = (title) => {
    setTitle(title)
  }
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Home"
        children={(props) => (
          <Tabs
            {...props}
            getComponentTitle={getComponentTitle}
            reload={reload}
          />
        )}
        options={{
          header: ({ navigation, scene, route }) => (
            <Header
              title={title}
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
              route={route}
            />
          ),
        }}
      />

      <Stack.Screen
        name="Highlighted"
        component={Highlighted}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Destacados"
              back
              tabs={tabs.highlighted}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />
      <Stack.Screen
        name="Category"
        component={Category}
        options={{
          header: ({ navigation, scene }) => {
            const { params } = scene.descriptor;
            const title = (params && params.headerTitle) || "Category";
            return (
              <Header
                title={title}
                back
                navigation={navigation}
                scene={scene}
              />
            );
          },
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />

      <Stack.Screen
        name="PostDescription"
        component={PostDescription}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="CreatePost"
        component={CreatePost}
        bgColor={"#22343C"}
        titleColor={"#FFFFFF"}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="SearchHome"
        component={SearchHome}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Buscar"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/*------ profile -------*/}
      <Stack.Screen
        name="PlayerProfile"
        component={PlayerProfile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Editar Perfil"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Media ----- */}
      <Stack.Screen
        name="Picture"
        component={Picture}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              transparent
              white
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Gallery"
        component={Gallery}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              transparent
              white
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      {/* ----- Authentication ----- */}
      <Stack.Screen
        name="AuthenticationHandler"
        component={AuthenticationHandler}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />
      <Stack.Screen
        name="LoginHandler"
        component={LoginHandler}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="SimpleRegistration"
        component={Registration}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="SimpleLogin"
        component={Login}
        options={{
          headerTransparent: false,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Fields Stack ----- */}
      <Stack.Screen
        name="Fields"
        component={Fields}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Canchas"
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="SearchFields"
        component={SearchFields}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Buscar"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="FieldsMatches"
        component={FieldsMatches}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="FieldDescription"
        component={FieldDescription}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="CreateFieldComment"
        component={CreateFieldComment}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Matches Stack ----- */}
      <Stack.Screen
        name="Partido"
        component={Matches}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Partidos"
              tabs={tabs.matches}
              navigation={navigation}
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="SearchMatches"
        component={SearchMatches}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Buscar"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="Match"
        component={Match}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Partido"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="CreateMatch"
        component={CreateMatch}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Bookings Stack ----- */}
      <Stack.Screen
        name="Bookings"
        component={Bookings}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Reservas"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="SearchBookings"
        component={SearchBookings}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Buscar"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="BookingDescription"
        component={BookingDescription}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              white
              transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="CreateBookingComment"
        component={CreateBookingComment}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              // white
              // transparent
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Calendar Stack ----- */}
      <Stack.Screen
        name="Calendar"
        component={Calendarr}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Calendario"
              titleColor={"#FFFFFF"}
              bgColor={"#22343C"}
              // back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Field Profile Stack ----- */}
      <Stack.Screen
        name="FieldMedia"
        component={FieldProfile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=" Perfil"
              titleColor={"#FFFFFF"}
              bgColor={"#22343C"}
              // back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="EditFieldProfile"
        component={EditFieldProfile}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Editar Perfil"
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="MediaSelection"
        component={MediaMultipleSelection}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              transparent
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              // white
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Team Stack ----- */}
      <Stack.Screen
        name="TeamDescription"
        component={TeamDescription}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="SearchTeams"
        component={SearchTeams}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Buscar"
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      {/* ----- Training Stack ----- */}
      <Stack.Screen
        name="Trainings"
        component={TrainingTabs}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Training"
        component={Training}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="NextTrainings"
        component={NextTrainings}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="TrainingCalendar"
        component={TrainingCalendar}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              titleColor={"#FFFFFF"}
              back
              bgColor={"#22343C"}
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />

      <Stack.Screen
        name="TrainingHistory"
        component={TrainingHistory}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              back
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      {/* ----- Notifications ----- */}
      <Stack.Screen
        name="Notifications"
        component={PersonalNotifications}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              title="Notifications"
              bgColor={"#22343C"}
              titleColor={"#FFFFFF"}
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
          cardStyle: { backgroundColor: "#22343C" },
        }}
      />
    </Stack.Navigator>
  );
}

function CreateAccounts(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
    >
      <Stack.Screen
        name="Accounts"
        component={Accounts}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Cuentas"
              // back
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" },
        }}
      />

      <Stack.Screen
        name="Picture"
        component={Picture}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              transparent
              white
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="AccountsMediaSelection"
        component={MediaMultipleSelection}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              transparent
              title=""
              navigation={navigation}
              scene={scene}
            />
          ),
          headerTransparent: true,
        }}
      />
    </Stack.Navigator>
  );
}

function AppStack(props) {
  const [role, setRole] = useState("player");
  const loadRole = async () => {
    let roleStored = await AsyncStorage.getItem("@user_role");
    if (roleStored) {
      setRole(roleStored);
    }
  };

  const resetRole = () => {
    setRole("player")
    console.log('resetting role')
    const { navigation } = props;
    navigation.navigate("Home", {reload: true});
  }

  useEffect(() => {
    loadRole();
  });

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      style={{ flex: 1 }}
      drawerContent={(props) => <CustomDrawerContent {...props} role={role} reset={resetRole}/>}
      drawerStyle={{
        backgroundColor: "white",
        width: width * 0.8,
      }}
      drawerContentOptions={{
        activeTintcolor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal",
        },
      }}
      initialRouteName={role !== "field" ? "Home" : "Reservas"}
    >
      {role && role === "field" ? (
        <>
          <Drawer.Screen name="Home" component={HomeStack} />
        </>
      ) : role && role === "admin" ? (
        <>
          <Drawer.Screen name="Home" component={HomeStack} />
          <Drawer.Screen name="Cuentas" component={CreateAccounts} />
        </>
      ) : (
        <>
          <Drawer.Screen name="Home" component={HomeStack} />
          <Drawer.Screen name="Perfil" component={ProfileStack} /> 
          <Drawer.Screen name="Mi Equipo" component={MyTeamStack} /> 
        </>
      )}
    </Drawer.Navigator>
  );
}

export default function OnboardingStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false,
      }}
    >
      {/* <Stack.Screen
        name="Onboarding"
        component={Pro}
        option={{
          headerTransparent: true,
        }}
      /> */}

      <Stack.Screen
        name="Onboarding"
        component={AppStack}
        option={{
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="App"
        component={AppStack}
        option={{
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="Registration"
        component={Registration}
        options={{
          headerTransparent: false,
        }}
      />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerTransparent: false,
        }}
      />
    </Stack.Navigator>
  );
}

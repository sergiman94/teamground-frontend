import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ScrollView, Keyboard, RefreshControl } from "react-native";
import { Block, theme } from "galio-framework";
import CommentCard from "../../components/CommentCard";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native'
import { Input } from "../../components";
import axios from "axios";
import { POSTS_URL, USERS_URL } from "../../utils/utils.";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import * as Progress from 'react-native-progress';
const { width } = Dimensions.get("screen");

export function PostDescription(props) {
  const { navigation, route } = props;
  const [commentContent, setCommentContent] = useState("")
  const [postId, setPostId] = useState(`${route.params.item.key}`)
  const [progresBar, setProgressBar] = useState(false)
  const [reload, setReload] = useState(false)
  const [showingKeyboard, setShowingKeyboard] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(route.params?.item)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [reloadData()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const reloadData = async () => {
    setCommentContent("")
    let rData = await axios.get(`${POSTS_URL}/${postId}`).then(response => response.data)
    if (Object.keys(rData.data).length > 0) {
      setData(rData.data)
    }
  }

  useEffect(() => {
    reloadData()
    setReload(false)
  }, [reload])

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => setShowingKeyboard(true))
    Keyboard.addListener('keyboardDidHide', () => setShowingKeyboard(false))
  }, [])

  const handleCommentButton = async () => {
    setProgressBar(true)
   let userId = await AsyncStorage.getItem("@user_id")
   if (userId) {
    let user = await axios.get(`${USERS_URL}/${userId}`).then(response => response.data)
    let body = {
      comment: {
        name: user.data.displayName,
        userImage: user.data.image,
        content: commentContent,
        username: user.data.username,
        timestamp: Date.now(),
        owner: user.data.key,
      }
    }
    await axios.post(`${POSTS_URL}/comment/${route.params.item.key}`, body).then(response => {
      setProgressBar(false)
      setReload(true)
      setCommentContent("")
    }).catch(error => {
      console.log(error)
      setProgressBar(false)
    })
   } else {
    setProgressBar(false)
    navigation.navigate("AuthenticationHandler");
   }
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
      <Rect x="60" y="8" rx="3" ry="3" width="88" height="6" />
      <Rect x="60" y="26" rx="3" ry="3" width="52" height="6" />
      <Rect x="10" y="56" rx="3" ry="3" width="270" height="6" />
      <Rect x="10" y="72" rx="3" ry="3" width="270" height="6" />
      <Rect x="10" y="88" rx="3" ry="3" width="178" height="6" />
      <Circle cx="30" cy="20" r="20" />
    </ContentLoader>
  );

  const renderArticles = () => {
    const item = data
    return (
      <>
        {data ? (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.articles}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <Block>
                <CommentCard style={{ marginTop: 100 }} item={item} full />
              </Block>
            </ScrollView>

            {/* comment input */}
            <Block
              flex
              row
              width={width}
              height={showingKeyboard ? 360 : 100}
              style={{
                position: "absolute",
                bottom: -10,
                borderRadius: 10,
                backgroundColor: "#22343C",
              }}
            >
              {/* text input */}
              <Block
                style={{ marginLeft: 20 }}
                width={width - theme.SIZES.BASE * 6}
              >
                {progresBar ? (
                  <Progress.Bar width={width - 30} indeterminate={true} />
                ) : (
                  <></>
                )}

                <Input
                  borderless
                  style={{ backgroundColor: "#30444E" }}
                  placeholder="Escribe tu comentario"
                  value={commentContent}
                  color={"#FFFFFF"}
                  onChangeText={(value) => setCommentContent(value)}
                />
              </Block>

              {/* send comment button */}
              <Block
                style={{
                  alignSelf: "center",
                  marginLeft: "auto",
                  marginBottom: showingKeyboard ? 300 : 40,
                  marginRight: 12,
                }}
              >
                <FontAwesome.Button
                  name="paper-plane"
                  color="#3DD598"
                  size={20}
                  borderRadius="5"
                  backgroundColor="transparent"
                  onPress={() => handleCommentButton()}
                />
              </Block>
              <KeyboardSpacer />
            </Block>
          </>
        ) : (
          <>
            <MyLoader />
          </>
        )}
      </>
    );
  };

  return (
    <Block flex center style={styles.home}>
      {renderArticles()}
    </Block>
  );
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  articles: {
    width: width ,
    paddingHorizontal: 2,
  },
  floatinBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  commentInput: {
    position: "absolute",
    bottom: -10,
    // borderTopColor: "#A2D1CC",
    // borderTopWidth: 0.2,
    marginBottom: 10,
    borderRadius: 10, 
    backgroundColor: "#ffffff",
    paddingLeft: 4
  },
});

export default PostDescription;

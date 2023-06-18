import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { Modal } from 'react-native';
import { TouchableOpacity } from 'react-native';
import PostWithComments from './Comments';
import { ScrollView } from 'react-native';




const App = () => {
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);


  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://www.reddit.com/r/popular.json');
      const postsData = response.data.data.children.map((child) => child.data);
      setPosts(postsData);
    } catch (error) {
      console.log(error);
    }
  };



  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleModalClose = () => {
    setSelectedImage(null);
  };

  const renderPost = ({ item, index }) => {
    const hasNextPost = index < posts.length - 1;
    const hasImage = item.url && item.url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
    const nextPost = hasNextPost ? posts[index + 1] : null;
    const nextHasImage = nextPost && nextPost.url && nextPost.url.match(/\.(jpeg|jpg|gif|png)$/) !== null;


    if (!hasImage && !nextHasImage) {

      return (

        <View style={styles.rowContainer}>

          <View style={styles.postContainer}>
            {renderPostContentCompact(item)}
          </View>
          {nextPost && (
            <View style={styles.postContainer}>
              {renderPostContentCompact(nextPost)}
            </View>
          )}
        </View>

      );
    } else {

      return (

        <View style={styles.postContainer}>
          {renderPostContent(item)}
        </View>
      );
    }
  };

  const renderPostContent = (item) => {
    const createdTime = new Date(item.created_utc * 1000); // Convert seconds to milliseconds
    const currentTime = new Date();
    var upvotes = "";
    if (item.ups > 1000) {
      upvotes = Math.round(item.ups / 1000 * 10) / 10 + "k";
    } else {
      upvotes = item.ups;
    }
    const hoursAgo = Math.floor((currentTime - createdTime) / (1000 * 60 * 60)); // Calculate the number of hours
    return (
      <TouchableOpacity onPress={() => handlePostClick(item)}>
        <View style={styles.contentContainer}>

          <View style={styles.subredditContainer}>
            <Text style={styles.subredditName}>{item.subreddit_name_prefixed}</Text>
          </View>
          {item.url && item.url.match(/\.(jpeg|jpg|gif|png)$/) !== null && (


            <TouchableOpacity onPress={() => handleImageClick(item.thumbnail)}>
              <Image source={{ uri: item.url }} style={styles.postImage} />
            </TouchableOpacity>

          )}
          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.stats}>
            <Text style={styles.username}>{hoursAgo + "h ago" + " ↑ " + upvotes + "  ⤷ " + item.num_comments}</Text>
          </View>
        </View>
      </TouchableOpacity>

    )
  };

  const truncateText = (text) => {
    const numChars = 120;
    if (text.length <= numChars) {
      return text;
    } else {
      return text.substring(0, numChars - 3) + '...';
    }
  };

  const renderPostContentCompact = (item) => {
    const createdTime = new Date(item.created_utc * 1000); // Convert seconds to milliseconds
    const currentTime = new Date();
    const hoursAgo = Math.floor((currentTime - createdTime) / (1000 * 60 * 60)); // Calculate the number of hours
    var upvotes = "";
    if (item.ups > 1000) {
      upvotes = Math.round(item.ups / 1000 * 10) / 10 + "k";
    } else {
      upvotes = item.ups;
    }

    return (
      <View style={styles.contentContainer1}>
        <TouchableOpacity onPress={() => handlePostClick(item)}>
          <View style={styles.subredditContainer}>
            <Text style={styles.subredditName}>{item.subreddit_name_prefixed}</Text>
          </View>

          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.stats}>
            <Text style={styles.username}>{hoursAgo + "h ago" + " ↑ " + upvotes + "  ⤷ " + item.num_comments}</Text>
          </View>
          <View style={styles.stats}>
            <Text style={styles.username}>{truncateText(item.selftext)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )

  }


  const handleVote = (postId, direction) => {

  };

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
        />
      </View>
      <Modal visible={!!selectedImage} transparent={true}>
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <View style={styles.modalContainer}>

            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal visible={!!selectedPost} transparent={false}>
        <SafeAreaView style={[styles.container]}>

          {selectedPost &&
            (
              <ScrollView>


                <View style={styles.openedContainer}>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedPost(null)}>
                    <Text style={styles.modalCloseButtonText}>X Close </Text>
                  </TouchableOpacity>
                  <View >
                    <View style={styles.containerPostOpened}>
                      <Text style={styles.postTitle}>{selectedPost.title}</Text>
                      <View style={styles.subredditContainer}>
                        <Text style={styles.subredditName}>{selectedPost.subreddit_name_prefixed}</Text>
                      </View>
                      {selectedPost.url && selectedPost.url.match(/\.(jpeg|jpg|gif|png)$/) !== null && (
                        <Image source={{ uri: selectedPost.url }} style={styles.postImage} />
                      )}
                      <View style={styles.stats}>
                        <Text style={styles.username}>{selectedPost.selftext}</Text>

                      </View>
                    </View>
                    <PostWithComments postId={selectedPost.id} />

                  </View>

                </View>

              </ScrollView>

            )
          }

        </SafeAreaView>
      </Modal >

    </SafeAreaView >
  );
};
const screenWidth = Dimensions.get('window').width;
const componentWidth = screenWidth * 0.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  postContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    marginRight: 10,
    padding: 5,

    borderBottomWidth: 2,
    borderBottomColor: '#CCCCCC',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: componentWidth,
  },
  votesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteButton: {
    minWidth: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  voteButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  contentContainer: {
    flex: 1,
  },
  openedContainer: {
    flex: 1,
    margin: 20,
    overflow: 'scroll',
    maxHeight: '100%',

  },
  containerPostOpened: {
    marginTop: 4,
    marginBottom: 4,
    flex: 1,
    padding: 10,
    overflow: 'scroll',
    borderColor: '#CCCCCC',
    maxHeight: '100%',
    borderWidth: 2,
    borderRadius: 5,
  },
  subredditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subredditThumbnail: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  subredditName: {
    fontSize: 14,
    color: '#8b0000',
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 7,
    marginBottom: 7,
  },
  username: {
    fontSize: 14,
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCloseButton: {


  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#000000',
    padding: 10,
    backgroundColor: '#ffe0e0',
  },
  modalImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },


});

export default App;

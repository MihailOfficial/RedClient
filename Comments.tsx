import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

const Comment = ({ comment, level }) => {
  const { body, replies, id, author, ups, created_utc } = comment.data;
  const createdTime = new Date(created_utc * 1000); // Convert seconds to milliseconds
  const currentTime = new Date();

  const hoursAgo = Math.floor((currentTime - createdTime) / (1000 * 60 * 60)); // Calculate the number of hours
  const [subShow, setSubShow] = useState(false);

  const canRenderSubcomments = replies && replies.data && replies.data.children && replies.data.children.length > 0;


  const handleCommentPress = () => {
    setSubShow(!subShow);
  };

  if (comment == null) {
    return (<></>)
  }

  return (
    <TouchableOpacity onPress={handleCommentPress}>
      <View style={{
        marginLeft: 5 * level,
        padding: 5,
        border: 5,
        borderLeftWidth: 2,
        borderColor: '#CCCCCC',
        marginBottom: 5,
        marginTop: 5,
      }}>
        <Text style={{ color: '#003b06', marginBottom: 5, }} >{author + " ↑ " + ups + "  " + hoursAgo + "h ago"} </Text>
        <Text>{body}</Text>
        {subShow && canRenderSubcomments && (
          <View style={{ marginLeft: 10 }}>
            {replies.data.children.map(child => (
              <Comment
                key={child.data.id}
                comment={child}
                level={level + 1}
              />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity >
  );
};

const PostWithComments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`https://www.reddit.com/comments/${postId}.json`);
      const data = await response.json();

      // Extract the comments from the API response
      const postComments = data[1]?.data?.children || [];
      setComments(postComments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View>
      <Text style={{ fontWeight: "500" }}>Comments</Text>
      <ScrollView >
        {comments.map(comment => (

          <Comment
            key={comment.data.id}
            comment={comment}
            level={0}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    border: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    marginBottom: 5,
  },
  containerSub: {
    marginLeft: 10,
    padding: 10,
    border: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    marginBottom: 5,
  },

});

export default PostWithComments;

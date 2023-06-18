import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import fetch from 'node-fetch';
import axios from 'axios';


const Comment = ({ comment, level, postid }) => {
  if (!comment || !comment.data) {
    return null;
  }

  const { body, replies, id, author, ups, created_utc } = comment.data;
  const createdTime = new Date(created_utc * 1000); // Convert seconds to milliseconds
  const currentTime = new Date();

  const hoursAgo = Math.floor((currentTime - createdTime) / (1000 * 60 * 60)); // Calculate the number of hours
  const [subShow, setSubShow] = useState(false);
  const [showMoreSubcomments, setShowMoreSubcomments] = useState(false);
  const [subcomments, setSubcomments] = useState(replies?.data?.children);
  const canRenderSubcomments = replies && replies.data && replies.data.children && replies.data.children.length > 0;
  const [showButton, setShowButton] = useState(true);

  const handleCommentPress = () => {
    setSubShow(!subShow);
  };

  const handleLoadMoreSubcomments = async (child) => {
    const childids = child.data.children.join(',');
    //console.log(childids);

    setShowButton(false)

    try {
      const accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNjg3MjE2Mjc5LjcxNTI3MSwiaWF0IjoxNjg3MTI5ODc5LjcxNTI3MCwianRpIjoiYXhwbURNSWk4eFFPTjJRZkJqeDhaRE5TNmJFN2dnIiwiY2lkIjoiUDYyNkFsTEhqT2xocGtuY09RSDNsdyIsImxpZCI6InQyX3NxcTJ3OXYiLCJhaWQiOiJ0Ml9zcXEydzl2IiwibGNhIjoxNTE2MzgzOTAwMzkzLCJzY3AiOiJlSnlLVnRKU2lnVUVBQURfX3dOekFTYyIsImZsbyI6OX0.gMZjCLWSiqqS0aRoCZ0BmVVEWI849sp7v_w2-oa2b_IsontZg4a6VM350raFOSwgg4-GsHbr_uCUs-qF8eTnCg3cAU6L3Xca8BDayJm7g52xF_SpUq37W1cnOZeHrBK0xg_n9C4MLbyG8PtOxERrq5YYo80AT5qxEId-U1jUP2LzWmFku-l9fCfgcSgmzIfkQHbnzIjayF80FlJq7xA-O1uUGos1Z54nCGtjlbyksq5NFThuwScCUs1Q1CvuP8rKWTp8LxPR7p0UZ65XZvnWXikg38KAIAxZD2_kVg6kPaBYUUNHOOEW4Bgmn9Fr3jTmVIqu1ESMXkKBw9flKyKHTw';

      const response = await fetch('https://oauth.reddit.com/api/morechildren', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: `api_type=json&link_id=t3_${postid}&children=${childids}`,
      });

      console.log(response.status);
      const data = await response.json();

      // Extract the new subcomments from the API response
      const newSubcomments = data.json.data.things;
      // Update the state with the new subcomments
      setSubcomments(subcomments => [...subcomments, ...newSubcomments]);


    } catch (error) {
      console.error('Error fetching more subcomments:', error);
    }

    setShowMoreSubcomments(true);

  };

  const colors = [
    '#CCCCCC', // Light Grey
    '#999999', // Medium Grey
    '#666666', // Dark Grey
    '#333333', // Even Darker Grey
    '#222222', // Very Dark Grey
    '#111111', // Almost Black
    '#000000', // Black
  ];




  return (
    <TouchableOpacity onPress={handleCommentPress}>
      <View>
        <View
          style={{
            marginLeft: 7 * level,
            padding: 5,
            borderLeftWidth: 3,
            borderColor: colors[level % colors.length],
            marginBottom: 5,
            marginTop: 5,
            borderRadius: 2,
            color: '#CCCCCC'
          }}
        >
          <Text style={{ color: '#003b06', marginBottom: 5 }}>
            {author} ↑ {ups} {hoursAgo}h ago
          </Text>
          <Text>{body}</Text>
        </View>
        {subShow && canRenderSubcomments && (
          <View>
            {subcomments?.map(child => (
              child && child.data.author && child.data.kind !== 'more' ? (
                <Comment
                  key={child.data.id}
                  comment={child}
                  level={level + 1}
                  postid={postid}
                />
              ) : (
                child.kind === 'more' & showButton ? (
                  <TouchableOpacity onPress={() => handleLoadMoreSubcomments(child)}>
                    <View
                      style={{
                        padding: 5,
                        marginLeft: 4,
                        marginBottom: 5,
                        marginTop: 5,
                        backgroundColor: "#Ececec",
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: '#696969', marginTop: 5, textAlign: 'center', fontWeight: 500 }}>Show more replies</Text>
                    </View>
                  </TouchableOpacity>
                ) : null
              )
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
      const response = await fetch(`https://www.reddit.com/comments/${postId}.json?showmore=true`);
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
            postid={postId}
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

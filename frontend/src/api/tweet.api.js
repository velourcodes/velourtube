import api from './axios';

// Create Tweet
export const createTweet = (data) => {
    return api.post('/tweet/create-tweet', data);
};

// Get User Tweets
export const getUserTweets = () => {
    return api.get('/tweet/get-user-tweets');
};

// Update Tweet
export const updateTweet = (tweetId, data) => {
    return api.patch(`/tweet/update-tweet/${tweetId}`, data);
};

// Delete Tweet
export const deleteTweet = (tweetId) => {
    return api.delete(`/tweet/delete-tweet/${tweetId}`);
};

// Delete All Tweets By User
export const deleteAllTweetsByUser = () => {
    return api.delete('/tweet/delete-all-tweets-by-user');
};

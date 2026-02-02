import api from './axios';

// Toggle Subscription
export const toggleSubscription = (channelId) => {
    return api.post(`/subscription/toggle-subscription/${channelId}`);
};

// Get User Channel Subscribers
export const getUserChannelSubscribers = (channelId) => {
    return api.get(`/subscription/get-user-channel-subscribers/${channelId}`);
};

// Get Subscribed Channels
export const getSubscribedChannels = (subscriberId) => {
    return api.get(`/subscription/get-subscribed-channels/${subscriberId}`);
};

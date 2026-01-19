# VideoTube v1.0.0

# What is this API?
  VideoTube **(developed by Mohammad Affan Siddiqi aka @velourcodes)** is a hybrid API implementing basic YouTube and Twitter functionalities. Well its not just basic CRUD but includes what are production grade backend 
  practices including:
  - Aggregation pipelines (to transform and bend the data as per my backend developer's choice),
  - Abstracting secure data like tokens, passwords and public_id(s) from frontend,
  - Clear and consistent error responses, with the best error codes,
  - The art of sending error messages that are clear yet not too disclosing the backend's state
  - Pagination of data and so on (we will cover everything in the later sections)

# Dependencies Used
  - brcypt 6.0.0
  - mongoose 9.1.3
  - mongoose-aggregare-paginate-v2
  - jsonwebtoken 9.0.3
  - nodemon 3.1.11
  - prettier 3.7.4
  - cors 2.8.5
  - cookie-parser 1.4.7
  - cloudinary 2.8.0
  - multer 2.0.2
  - express 5.2.1
  - dotenv 17.2.3

# Get Started

## Cloning this repo
```bash
git clone https://github.com/velourcodes/velourtube.git
```
## Switching from current working directory to project's directory
```bash
cd velourtube/backend/
```
## Initialising a new Node.js project along with a package.json file

```bash
npm init

# Keep your entry point as index.js in package.json
# "start": "node src/index.js"
# "dev": "nodemon src/index.js"

```

## How your package.json will look after following my documentation
```json
"main": "src/index.js",
    "scripts": {
        "start": "node src/index.js",
        "dev": "nodemon src/index.js"
    }
```

## Installing all the required node dependencies
```bash
npm install express dotenv cors prettier bcrypt
jsonwebtoken mongoose cookie-parser multer cloudinary
nodemon
```

## Starting the Node Server
### For local environment
```bash
npm run dev
```

### For producation environment
```bash
npm run start
```
## Setting up the .env file along with its creation
```bash
# .env File setup
cat > .env << 'EOF'
PORT=your_localhost_port
CORS_ORIGIN=* or your_deployed_frontend
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.randomcode.mongodb.net
MONGODB_DB_NAME=your_db_name_from_atlas
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=short_term_expiry
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=longer_expiry
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EOF
```

# Features

## User Related Features
- Passwords are hashed (secured) using bcrypt before saving them to database
- Access and Refresh Tokens are used for authentication and authorization
- Token rotation has been implemented for more security
- Users can update their avatar or coverImage or (both)
- Password and other user details can also be changed by user
- Users are shown their desired **Channel Profile** - includes username,
  avatar, subscibersCount, channelsSubscribedTo, isSubscribed
- Users can view their Watch History too (ofcourse it is protected)

## Video Related Features
- Users can upload videos on this platform along with title, description
  and thumbnail
- Users can like/unlike published videos
- ***Users can search through all available public videos through
  query (search bar), channelId, sortType (views, duration or
  upload date), sortBy (ascending or descending order) (limiting and pagination)***
- Users can view a video, views are tracked as well, as you hit a video
  route, view count increases
- **Every video view is also tracked and watch history is updated intelligently**
- Channel owners can toggle video's Publish Status by hitting a route
  it affects the video's public visibility
- Video details can be updated after a video is published
- Video can be deleted by the channel owner
- Implemented aggregation pipelines to provide exact
  frontend ready video and its owner related data

## Comment Related Features
- Users can add/edit comments on their favourite videos
- Only video owner can delete any comment they want
- Comments can be liked/unliked too
- Implemented aggregation pipelines to provide exact
  frontend ready comment related data

## Playlist Related Features
- Users can create, update (playlist details)
  and delete playlists
- Videos can be added to/removed from playlists
  (by playlist owner only)
- One can see all playlists on their channel
- Playlists can be viewed publically by its _id
- Used aggregatation pipelines to send frontend
  ready playlist data like its owner, each video's
  required details, playlistVideoCount

## Subscription Related Features
- Users can subscribe/unsubscribe to any channel
- A user can view their subscription details (privately)
- Users can view their subscriber count and subscriber
  details too (privately)
  Public can only see subscriber count for any other
  channel
- Made use of aggregation pipelines to modify data
  and make it frontend ready yet secure by returning
  subscription details, subscriber and its user data
  as and when required

## Tweet Related Features
- User can drop tweets, edit them
  (their content) and delete them too
- Bulk deletion of tweets by a user is also possible
- Users can like/unlike tweets
- Others can browse any user's tweets (added limiting
  and pagination too for large data sets)
- Added aggregation pipelines to return frontend ready
  tweet data such as tweet count, tweet owner username and avatar

## Comprehensive Channel Dashboard
A professional dashboard for channel analytics, it displays:

### Video Statistics
- Total video views
- Average views per video
- Total watch duration
- Average watch duration per video
- Total videos uploaded
- Most viewed video details
- Least viewed video details
- Latest uploaded video details
    
### Like Statistics
- Total likes across all videos
- Most liked video details
- Least liked video details
    
### Comment Statistics
- Total comments count
- Most liked comment details
- Top comments based on likes
- Most recent comments
- Commenter profile information
- Associated video details for each comment
    
### Subscription Statistics
- Total subscriber count
- Recently subscribed users
- Earliest subscribed users
- Subscriber profile information
- Subscription timestamps
    
### Playlist Statistics
- Total playlists on the channel
- Playlists containing channel videos
  (excluding those playlists created by
  channel owner itself)

- **The dashboard controller uses non blocking as well as async
  parallel execution (Promise.all([]))for processing, transforming
  different category data without affection the other one if one
  pipeline inside of $facet fails!**

## Healthcheck
- Added two distinct healthcheck routes for different environments
- One is the immidiately first route hit as soon as our deployed API
  is requested (Fast and Efficient, but a less descriptive one).
  More suitable for production enviroment :)
- Another healtcheck route, a more descriptive one, is the one which
  is more suited to check whether mongoose, node process, cloudinary
  service and all such sub dependencies are working and responding fine!
- ***Why I chose to add two distinct health checks is because in production
  I used render's free tier, it has a 15 second limit to check if health check route responds or not
  But Atlas pings and cloudinary pings can sometimes take time to respond...***



# Project Directory Structure
```bash
  velourtube/
  └── backend/
      ├── package.json
      ├── package-lock.json
      ├── .prettierrc
      ├── .prettierignore
      ├── app.js
      ├── index.js
      └── src/
          ├── controllers/
          │   ├── comment.controller.js
          │   ├── dashboard.controller.js
          │   ├── healthcheck.controller.js
          │   ├── like.controller.js
          │   ├── playlist.controller.js
          │   ├── subscription.controller.js
          │   ├── twitter.controller.js
          │   ├── user.controller.js
          │   └── video.controller.js
          ├── models/
          │   ├── comment.model.js
          │   ├── like.model.js
          │   ├── playlist.model.js
          │   ├── subscription.model.js
          │   ├── twitter.model.js
          │   ├── user.model.js
          │   └── video.model.js
          ├── routes/
          │   ├── comment.routes.js
          │   ├── dashboard.routes.js
          │   ├── healthcheck.routes.js
          │   ├── like.routes.js
          │   ├── playlist.routes.js
          │   ├── subscription.routes.js
          │   ├── twitter.routes.js
          │   ├── user.routes.js
          │   └── video.routes.js
          ├── middlewares/
          │   ├── auth.middleware.js
          │   └── multer.middleware.js
          ├── db/
          │   └── index.js
          └── utils/
              ├── ApiError.js
              ├── ApiResponse.js
              ├── asyncHandler.js
              └── cloudinary.js
```



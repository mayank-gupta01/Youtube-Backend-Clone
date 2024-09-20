# YouTube-Backend-Clone


[Demo Link](https://youtu.be/m1wX1lw_Qy4)


## Overview
This project is a backend system designed to replicate core functionalities of YouTube, such as video uploads and user authentication, using modern web technologies and third-party services like Cloudinary for video storage.

## Features
- Video Upload and Storage: Videos are uploaded using multer for file handling and stored on Cloudinary.
- User Authentication: Secure authentication using JWT (JSON Web Tokens) for authorization.
- Password Encryption: User passwords are encrypted to ensure secure data storage.
- Session Management: Cookies are used to store tokens for persistent user sessions, preventing repeated logins.
- Database: MongoDB with aggregation is used for efficient data queries and operations.
- Node.js Backend: RESTful API built with Node.js and Express.



## Tech Stack
- Node.js: Backend framework for building the server and API.
- MongoDB: NoSQL database for data storage and aggregation queries.
- Multer: Middleware for handling multipart/form-data, mainly used for video file uploads.
- Cloudinary: Third-party service for storing videos and handling media assets.
- JWT: JSON Web Token for secure user authentication and authorization.
- Bcrypt: Library for password encryption.
- Cookies: Used for storing JWT to maintain user sessions.


## Installation
1. Clone the repository:  
```
git clone https://github.com/mayank-gupta01/Youtube-Backend-Clone
```
2. Install Dependencies:
```
cd youtube-backend-clone
npm install
```
3. Set up environment variables:
```
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster0.av9dopc.mongodb.net
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. Start the development server:
```
npm start

```
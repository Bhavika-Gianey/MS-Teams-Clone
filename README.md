# MS-Teams-Clone
Real time video conferencing Web Application 


## About the Project
Engage 2021 is a Engagement and Mentorship program created by Microsoft engineers, in association with Ace Hacker team, for engineering students. Through this initiative, students get a chance to be mentored by Microsoft and be a part of AMA Sessions, Webinars and Leader talks delivered by Microsoft employees.

## Problem Statement
The challenge was to build a Microsoft Teams Clone . It should be a fully functional prototype with at least one mandatory functionality - a minimum of two participants should be able connect with each other using your product to have a video conversation. [Microsoft Engage 2021](https://microsoft.acehacker.com/engage2021/)

## FEATURES
* Mutiple room functionality at a single moment
* Multiple users can connect to the same room
* Chat rooms accessible before , during and even after the meeting 
* Feature to mute/unmute your audio
* Feature to play/stop your video
* Ability to share your screen
* See the other participant's names
* User Authentication using Passport Js
* Responsive UI


## Getting Started
To run the project on your local machine, follow the instructions:

Clone the repository.

`git clone https://github.com/Bhavika-Gianey/MS-Teams-Clone.git`.

Change your current directory to repository folder and then install all the dependencies
```bash
cd MS-Teams-Clone
npm install
```

Run the server

`npm run devStart`

Now open http://localhost:3000/ on browser.


## How video call works?

I am using [PeerJS](https://peerjs.com/) an open source API that wraps WebRTC to create a peer-to-peer connection and helps to accomplish features like video call, share screen, record screen etc. WebRTC facilitates Real Time Communication (RTC) between browsers, mobile platfors and IOTs and allow then to communicate via common set of protocols. WebRTC mainly uses: signalling, ICE candidates, STUN server and TURN server for Real Time Communication.

## How web sockets work?

I am using [socket.io](https://socket.io/) an open source library that implements web sockets. Web socket provide a biderectional communication between web clients and servers. It came handy to implement features like text chat, user list and raise hand.

## Design Documentation And Sprint Map

See [plan](https://docs.google.com/document/d/1qQZEzLoVL_Eaf6fwkQQ0P_8GfhUdjHAQ8GGDxShf4bE/edit#heading=h.mbjsiz6n6jlo)






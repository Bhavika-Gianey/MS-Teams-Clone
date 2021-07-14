# MS-Teams-Clone
_MICROSOFT ENGAGE'21_
Real time video conferencing Web Application 


![teams-demo](https://user-images.githubusercontent.com/63343906/125576725-080ced51-4138-48be-be60-75c04e72d1e6.PNG)



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



### Built with
| Name | Version | Description
| ------ | ------ | ------ |
| Node JS | 14.17.3 | Node.js is an open source development platform for executing JavaScript code server-side. It is useful for developing applications that require a persistent connection from the browser to the server and is suitable for real-time applications. Node.js is intended to run on a dedicated HTTP server and to employ a single thread with one process at a time. Node.js applications are event-based and run asynchronously.  |
| Socket.io | 4.1.2 | Socket.IO is a JavaScript library for realtime web applications. It enables realtime, bi-directional communication between web clients and servers. It has two parts: a client-side library that runs in the browser, and a server-side library for Node.js. Whenever an event occurs, the server will get it and push it to the concerned connected clients. |
| Express | 4.17.1 | Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It is an open source framework developed and maintained by the Node.js foundation. Express is used to build the web server that Socket.IO will work with. ExpressJS makes it easy to define routes and other things. |
| PeerJs |  0.6.1 | PeerJS wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API. Equipped with nothing but an ID, a peer can create a P2P data or media stream connection to a remote peer. |
| uuid | 8.3.2 | UUID is a javascript library that allows us to create unique Ids. In this application, I have used uuid version 4 to create unique URL i.e unique room IDs. |
| Nodemon | 2.0.7 | Nodemon is a tool from npm. This tool restarts our server as soon as we make a change in any of our files, otherwise we need to restart the server manually after each file modification. |
| Passport JS | 0.4.1 | Passport recognizes that each application has unique authentication requirements. Authentication mechanisms, known as strategies, are packaged as individual modules. Applications can choose which strategies to employ, without creating unnecessary dependencies. |


#### This is how socket.io works:</br>
On the server-side, Socket.IO works by adding event listeners to an instance of http.Server. The HTTP server will begin to serve the client library at /socket.io/socket.io.js. The global socket variable is an EventEmitter-like object. Since both the server and client's Socket object act as EventEmitters, you can emit and listen for events in a bi-directional manner. We can send any JSON serialisable object to and from the server. This includes strings, numbers, arrays and booleans. </br> </br>

<img src="https://github.com/AJgthb2002/WeTalk/blob/4f7422b6537b01926390cbb1611b7238d82c919c/screenshots/socketio_working_1.png" alt="socketio_working" width="500"     height="300" margin-left ="auto" margin-right="auto" />


## How video call works?

I am using [PeerJS](https://peerjs.com/) an open source API that wraps WebRTC to create a peer-to-peer connection and helps to accomplish features like video call, share screen, record screen etc. WebRTC facilitates Real Time Communication (RTC) between browsers, mobile platfors and IOTs and allow then to communicate via common set of protocols. WebRTC mainly uses: signalling, ICE candidates, STUN server and TURN server for Real Time Communication.



## Design Documentation And Sprint Map

See [plan](https://docs.google.com/document/d/1qQZEzLoVL_Eaf6fwkQQ0P_8GfhUdjHAQ8GGDxShf4bE/edit#heading=h.mbjsiz6n6jlo)


## Hosted site

[Click Here](https://engage-21-teams-clone.herokuapp.com/home) to view the site.





const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer() //Import peerjs
const myVideo = document.createElement('video')
myVideo.muted = true //mute self
const peers = {} //storing peers
const videoparticipants = new Array;
var uId;
var v = !1;



myPeer.on('call', call => {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    call.answer(stream) //answering call with self stream
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream) //Appending stream with call
    })
    call.on('close', () => {
      video.remove() //removing call after user disconnection
    })
    peers[call.peer] = call;
    videoparticipants.push(call);
  });
})




let videoStream; // self video stream

// to join video conference
function videoCall() {
  v = !0;
  document.getElementsByClassName("window__left")[0].style.display = "flex";
  document.getElementsByClassName("window__right")[0].style.display = "flex";
  document.getElementsByClassName("window__controls")[0].style.display = "flex";
  document.getElementsByClassName("window__left")[0].style.flex = 1;
  document.getElementsByClassName("window__right")[0].style.flex = 0.2;
  document.getElementById("chat").style.display = "none";
  document.getElementById("participants").style.display = "none";
  document.getElementById("chat").style.flex = 0.2;
  const html = '';
  document.querySelector('.hide').innerHTML = html;
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    //Appending self stream
    videoStream = stream;
    addVideoStream(myVideo, videoStream);
  });
  socket.emit("joined-video", ROOM_ID, uId, user);
}



socket.on('user-connected', (userId, userName) => {
  $("ul").append(`<li class="message"><b>${userName} joined this room.</b><br/></li>`)
  console.log("user-connected but not in the video");

});



socket.on('video-connected', (userId, userName) => {
  $("ul").append(`<li class="message"><b>${userName} joined video meeting.</b><br/></li>`),
    v && connectToNewUser(userId, videoStream); //exchanging streams with new user
});

// input value
$(document).ready(function() {
  var user = $("#user").text();
  let text = $("input"); //user input message
  $('html').keydown(function(e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val(), user);
      text.val('')
    }
  });

  socket.on("createMessage", (message, name) => {
    $("ul").append(`<li class="message"><b>${name}<br/>${message}</li>`);
    scrollToBottom()
  });

})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

//Every Peer object is assigned a random, unique ID when it's created.
myPeer.on('open', id => {
  uId = id;
  socket.emit('join-room', ROOM_ID, id, user)
})

const participants = document.querySelector(".participants");
//Display online users
socket.on("connected-users", (data) => {
  participants.innerHTML = "";
  data.forEach((user) => {
    participants.innerHTML += `<p>${user}</p>`;
  });
});


//receiving users stream to add in self stream
function connectToNewUser(userId, stream) {
  console.log("userId ", userId);
  const call = myPeer.call(userId, videoStream); //calling new user
  const video = document.createElement('video');
  call.on("stream", userId => {
    addVideoStream(video, userId) //ading user stream in self window
  });
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
  videoparticipants.push(call);
}


//appending video stream in video grid
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function videoEnd() {
  v = !1;
  const tracks = videoStream.getTracks();
  tracks.forEach(function(track) {
    track.stop();

  });
  myVideo.srcObject = null;
  for (var i = 0; i < videoparticipants.length; i++) videoparticipants[i].close();
  socket.emit("videoDisconnected", ROOM_ID, uId, user);
  document.getElementsByClassName("window__left")[0].style.display = "none";
  document.getElementsByClassName("window__right")[0].style.display = "flex";
  document.getElementsByClassName("window__controls")[0].style.display = "none";
  document.getElementsByClassName("window__right")[0].style.flex = 1;
  document.getElementById("chat").style.display = "flex";
  document.getElementById("participants").style.display = "flex";
  document.getElementById("chat").style.flex = 0.8;
  document.getElementById("participants").style.flex = 0.2;
  const html = `<button><i class="fas fa-video fa-sm" id="video_side"></i></button>`;
  document.querySelector('.hide').innerHTML = html;

}

socket.on("user-left-video", (e, t) => {
  console.log("left");
  $("ul").append(`<li class="message"><b>${t} left video meeting.</b><br/></li>`),
    peers[e] && peers[e].close()
});
var screen = '';


//screen share
function startCapture() {
  try {
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then((stream) => {
      let videoTrack = stream.getVideoTracks()[0];
      //save my screen stream
      screen = stream;
      broadcastNewTracks(stream, 'video');
      myVideo.srcObject = stream;


      screen.getVideoTracks()[0].addEventListener('ended', () => {
        stopSharingScreen();
        myVideo.srcObject = videoStream;
      });
    }).catch(err => {
      console.log("unable to get display media" + err);
    })

  } catch (err) {
    console.log("shareerror" + err);
  }

};

//stop share
function stopSharingScreen() {
  return new Promise((res, rej) => {
    screen.getTracks().length ? screen.getTracks().forEach(track => track.stop()) : '';
    res();
  }).then(() => {
    broadcastNewTracks(videoStream, 'video');
  }).catch((e) => {
    console.error(e);
  });
}

function broadcastNewTracks(stream, type) {
  let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
  for (let p in peers) {
    let pName = peers[p];
    if (typeof pName == 'object') {
      replaceTrack(track, pName);
    }
  }
}

function replaceTrack(stream, recipientPeer) {
  let sender = recipientPeer.peerConnection.getSenders ? recipientPeer.peerConnection.getSenders().find(s => s.track && s.track.kind === stream.kind) : false;

  sender ? sender.replaceTrack(stream) : '';
}

const scrollToBottom = () => {
  var d = $('.window__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//Mute Video
const muteUnmute = () => {
  const enabled = videoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false;
    unmuteButton();
  } else {
    muteButton();
    videoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  let enabled = videoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false;
    playVideo()
  } else {
    stopVideo()
    videoStream.getVideoTracks()[0].enabled = true;
  }
}

const muteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.window__mute_button').innerHTML = html;
}

const unmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.window__mute_button').innerHTML = html;
}

const stopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.window__video_button').innerHTML = html;
}

const playVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.window__video_button').innerHTML = html;
}

let chat_check = 0;
let participant_check = 0;
// toggling chat window
const openChat = () => {
  if (!chat_check) {
    document.getElementById("participants").style.display = "none";
    document.getElementById("chat").style.display = "flex";

    chat_check = 1;
    participant_check = 0;
  } else {
    document.getElementById("chat").style.display = "none";
    chat_check = 0;
  }
}


//toggling participats window
const openPist = () => {
  if (!participant_check) {
    document.getElementById("chat").style.display = "none";
    document.getElementById("participants").style.display = "flex";
    participant_check = 1;
    chat_check = 0;
  } else {
    document.getElementById("participants").style.display = "none";
    participant_check = 0;
  }
}

const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

let videoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

  //Append your video
  videoStream = stream;
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close',()=>{
      video.remove()
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, videoStream)
  })




  // input value
    $(document).ready(function(){
      var user = $("#user").text();
      let text = $("input");
      $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          console.log(text.val());
          console.log("jjj ",user);
          socket.emit('message', text.val(),user);
          text.val('')
        }
      });

      socket.on("createMessage", (message,name) => {
        $("ul").append(`<li class="message"><b>${name}<br/>${message}</li>`);
        scrollToBottom()
      });

    })
})

socket.on('user-disconnected',userId=>{
  if(peers[userId]) peers[userId].close()
})


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id,user)
})

const participants = document.querySelector(".participants");
//Display online users
socket.on("connected-users", (data) => {
  participants.innerHTML = "";
  data.forEach((user) => {
    participants.innerHTML += `<p>${user}</p>`;
  });
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close',()=>{
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

// const start = document.getElementById("shareScreen");
// start.addEventListener("click",function(e){
//   startCapture();
// })

//share shareScreen
function startCapture(){
 try{
   navigator.mediaDevices.getDisplayMedia({
     video: {
       cursor: "always"
     },
     audio: {
       echoCancellation: true,
       noiseSuppression: true
     }
   }).then((stream)=> {
       let videoTrack = stream.getVideoTracks()[0];
       //save my screen stream
       videoStream = stream;
      broadcastNewTracks( stream, 'video');
       myVideo.srcObject = stream;


       // screen.getVideoTracks()[0].addEventListener( 'ended', () => {
       //      stopSharingScreen();
       //  } );
   }).catch(err => {
     console.log("unable to get display media" + err);
   })

 }catch(err){
    console.log("shareerror" + err);
 }


 // navigator.mediaDevices
 //    .getDisplayMedia({
 //      video: { cursor: true },
 //      audio: true,
 //    })
 //    .then((screenStream) => {
 //      Object.values(peers).map((peer) => {
 //        console.log(peer);
 //        peer.peerConnection.getSenders().map((sender) => {
 //          if (sender.track.kind == "video") {
 //            console.log(sender.track.kind);
 //            sender.replaceTrack(screenStream.getVideoTracks()[0]);
 //          }
 //        });
 //      });
 //      myVideo.srcObject = screenStream;
 //      screenStream.getTracks()[0].onended = () => {
 //        Object.values(peers).map((peer) => {
 //          peer.peerConnection.getSenders().map((sender) => {
 //            if (sender.track.kind == "video") {
 //              sender.replaceTrack(videoStream.getVideoTracks()[0]);
 //            }
 //          });
 //        });
 //        myVideo.srcObject = videoStream;
 //      };
 //    });
};

function broadcastNewTracks( stream, type) {
    // h.setLocalStream( stream, mirrorMode );

    let track = type == 'audio' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

    for ( let p in peers ) {
        let pName = peers[p];
        console.log(Object.values(peers));
        console.log(pName);
        console.log("first");
        // console.log(typeof peers[pName]);
        if ( typeof pName == 'object' ) {
            console.log("second");
            replaceTrack( track, pName);
        }
    }
}

function replaceTrack( stream, recipientPeer ) {
    let sender = recipientPeer.getSenders ? recipientPeer.getSenders().find( s => s.track && s.track.kind === stream.kind ) : false;

    sender ? sender.replaceTrack( stream ) : '';
}







const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//Mute Video
const muteUnmute = () => {
  // console.log();
  const enabled = videoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    videoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = videoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    videoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

let chat_check = 0;
let participant_check = 0;
  const openChat = () => {
    if(!chat_check){
        document.getElementById("participants").style.display = "none";
        document.getElementById("chat").style.display = "block";

        chat_check = 1;
        participant_check = 0;
    }
    else{
      document.getElementById("chat").style.display = "none";
      chat_check = 0;
    }
  }



  const openPist = () => {
    if (!participant_check) {
      document.getElementById("chat").style.display = "none";
      document.getElementById("participants").style.display = "block";
      participant_check = 1;
      chat_check = 0;
    } else {
      document.getElementById("participants").style.display = "none";
      participant_check = 0;
    }
  }

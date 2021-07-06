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
    // call.on('close',()=>{
    //   video.remove()
    // })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, videoStream)
  })

  // input value
    $(document).ready(function(){
      var user = $("#user").text();
      // alert(user);


      let text = $("input");
      $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          console.log(text.val());
          console.log("jjj ",user);
          socket.emit('message', text.val(),user);
          text.val('')
        }
      });

      socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>${user}<br/>${message}</li>`);
        scrollToBottom()
      });

    })

    // let name = {user};
    // when press enter send message
    // $('html').keydown(function (e) {
    //   if (e.which == 13 && text.val().length !== 0) {
    //     console.log(text.val());
    //
    //     socket.emit('message', text.val(),user);
    //     text.val('')
    //   }
    // });
    // socket.on("createMessage", message => {
    //   $("ul").append(`<li class="message"><b>${user}<br/>${message}</li>`);
    //   scrollToBottom()
    // });
})

socket.on('user-disconnected',userId=>{
  if(peers[userId]) peers[userId].close()
})


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

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

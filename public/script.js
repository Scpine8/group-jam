const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
}) 

const myVideo = document.createElement('video')
myVideo.muted = true // mutes your own audio so you don't hear your audio played back to you

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // tell video object to use this stream
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    // USER CONNECTS:
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

// USER DISCONNECTS:

socket.on('user-disconnected', userId => {
    console.log(userId)
    // if a connection exists at that userId, close it
    if (peers[userId]) {
        peers[userId].close()
    }
})

myPeer.on('open', id => {
    // as soon as we connect to the peer server, run this code:
    socket.emit('join-room', ROOM_ID, id) 
})


// When a user connects to an existing room, the other users are notified:

socket.on('user-connected', userId => {
    console.log('User Connected: '+userId)
})

// Helper Functions:

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
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
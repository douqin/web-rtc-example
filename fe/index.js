function call() {
    socket.emit('offer', peerConnection.localDescription);
}
document.getElementById("call").addEventListener("click", call);

let socket = io();


let servers = {
    iceServers: [
        {
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}
let peerConnection;
let localStream;
let remoteStream;
let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById('localVideo').srcObject = localStream;

}
var createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('remoteVideo').srcObject = remoteStream;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            // socket.emit('icecandidate', event.candidate);
        }
    }

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('offer: ', peerConnection.localDescription);
}
let createAnswer = async (offer) => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('remoteVideo').srcObject = remoteStream;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            // socket.emit('offer', event.candidate);
        }
    }

    await peerConnection.setRemoteDescription(offer);
    let answer = await peerConnection.createAnswer();
    console.log("answer:", answer)
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit('answer', answer);
}
let addAnswer = async (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
}
socket.on('offer', async (offer) => {
    console.log("nhan duoc offer:", offer)
    await createAnswer(offer);
})
socket.on('answer', async (answer) => {
    await addAnswer(answer);
})
socket.on('join', async (data) => {
    console.log("user join: ", data)
})
init().then(() => {
    socket.emit("join", socket.id)
    createOffer();
}).catch(error => { console.log(error) })
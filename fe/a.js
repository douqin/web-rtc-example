function call() {
    socket.emit('offer', peerConnection.localDescription);
}
document.getElementById("call").addEventListener("click", call);

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peerConnection = new RTCPeerConnection(configuration);

const socket = io();
peerConnection.onicecandidate = event => {
    console.log("🚀 ~ file: a.js:94 ~ event:", event)
    if (event.candidate) {
        socket.emit('icecandidate', event.candidate);
    }
};
const localVideo = document.getElementById('localVideo');
localVideo.autoplay = true;

const remoteVideo = document.getElementById('remoteVideo');
remoteVideo.autoplay = true;

// Tạo offer
peerConnection.createOffer()
    .then(offer => {
        return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
        console.log(peerConnection)
    })
    .catch(error => {
        console.log('Error creating offer:', error);
    });

socket.on('icecandidate', candidate => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => {
            console.log('Error adding ICE candidate:', error);
        });
});
// Code cho người được mời (callee)
socket.on('offer', offer => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => {
            return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        })
        .then(stream => {
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        })
        .then(() => {
            return peerConnection.createAnswer();
        })
        .then(answer => {
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            socket.emit('answer', peerConnection.localDescription);
        })
        .catch(error => {
            console.log('Error creating answer:', error);
        });
});

// Code cho người mời (caller) nhận lại answer
socket.on('answer', answer => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .catch(error => {
            console.log('Error setting remote description:', error);
        });
});

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    document.getElementById("localVideo").srcObject = stream;
    peerConnection.addStream(stream);
}).catch(error => {
    console.log('Error adding stream:', error);
});

peerConnection.ontrack = event => {
    console.log("🚀 ~ file: a.js:84 ~ event:", event)
    document.getElementById("remoteVideo").srcObject = new MediaStream([event.track]);
};
peerConnection.oniceconnectionstatechange = (event) => {
    console.log('ICE Connection State:', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'connected') {
        console.log('Kết nối đã được thiết lập!');
    }
};
function checkConnect() {
    if (peerConnection.remoteDescription) {
        console.log('Đang kết nối với:', peerConnection.remoteDescription.sdp);
    } else {
        console.log('Chưa có kết nối hoặc remote description.');
    }
    if (peerConnection.iceConnectionState === 'connected') {
        console.log('Kết nối đã được thiết lập!');
    }
}



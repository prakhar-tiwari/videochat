let socket = io.connect('/');

socket.emit('register-user', {
    user: document.getElementById('sender').value
})

let answersFrom = {};
let offer;
let usersInfo;
let peerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

let sessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

let pc = new peerConnection({
    iceServers: [{
        url: "stun:stun.services.mozilla.com",
        username: "somename",
        credential: "somecredentials"
    }]
});

pc.onaddstream = function (obj) {
    document.getElementById('chat-user').innerHTML = "";
    let vid = document.createElement('video');
    vid.setAttribute('class', 'video-small');
    vid.setAttribute('autoplay', 'autoplay');
    vid.setAttribute('id', 'remotevideo');
    vid.style = "width:100%;";
    document.getElementById('chat-user').appendChild(vid);
    vid.srcObject = obj.stream;
    document.getElementById('hangup-button').disabled = false;
}

navigator.getUserMedia({ video: true, audio: true }, function (stream) {
    let video = document.querySelector('video');
    video.style = "width:100%";
    video.srcObject = stream;
    pc.addStream(stream);
}, error);


socket.on('add-users', function (data) {
    let table = document.getElementById('userList');
    let iconColumn = document.createElement('td');
    let icon = document.createElement('i');
    icon.className = "fa fa-youtube-play";
    icon.style = "color:red";
    iconColumn.appendChild(icon);
    for (let i = 0; i < data.users.length; i++) {
        let id = data.users[i];
        let row = document.createElement('tr');
        row.setAttribute('id', id);
        row.className = "tablerow";
        let header = document.createElement('th');
        header.setAttribute('scope', 'row');
        header.innerHTML = i + 1;
        let column = document.createElement('td');
        column.style = "cursor:pointer";
        column.innerHTML = data.receiver;

        row.appendChild(header);
        row.appendChild(column);
        row.appendChild(iconColumn);

        row.addEventListener('click', function () {
            createOffer(id);
        });

        table.appendChild(row);
    }
});

socket.on('remove-user', function (id) {
    let div = document.getElementById(id);
    document.getElementById('users').removeChild(div);
});


socket.on('offer-made', function (data) {
    offer = data.offer;

    pc.setRemoteDescription(new sessionDescription(data.offer), function () {
        pc.createAnswer(function (answer) {
            pc.setLocalDescription(new sessionDescription(answer), function () {
                socket.emit('make-answer', {
                    answer: answer,
                    to: data.socket
                });
            }, error);
        }, error);
    }, error);

});

socket.on('answer-made', function (data) {
    pc.setRemoteDescription(new sessionDescription(data.answer), function () {
        document.getElementById(data.socket).setAttribute('class', 'active');
        if (!answersFrom[data.socket]) {
            createOffer(data.socket);
            answersFrom[data.socket] = true;
        }
    }, error);
});

function createOffer(id) {
    pc.createOffer(function (offer) {
        pc.setLocalDescription(new sessionDescription(offer), function () {
            socket.emit('make-offer', {
                offer: offer,
                to: id
            });
        }, error);
    }, error);
}

function hangUpCall() {
    let localVideo = document.getElementById('localvideo');
    let remoteVideo = document.getElementById('remotevideo');

    if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    pc.close();
    pc = null;
    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    localVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");

    window.location.href = "/";
}

function error(err) {
    console.warn('Error', err);
}
const effects = [
    {
        name: "正常",
        filter: ""
    },
    {
        name: "黑白",
        filter: "grayscale(100%)"
    },
    {
        name: "反色",
        filter: "invert(100%)"
    },
    {
        name: "模糊",
        filter: "blur(5px)"
    },
    {
        name: "褪色",
        filter: "sepia(100%)"
    },
    {
        name: "高对比度",
        filter: "contrast(200%)"
    },
    {
        name: "色相旋转",
        filter: "hue-rotate(180deg)"
    }
];

let myVideoStream;
const videoGrid = document.getElementById('videoGrid');
const peers = {};
const peer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com',
    secure: true,
    port: 443,
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(stream, peer.id, true);

    peer.on('call', call => {
        call.answer(stream);
        call.on('stream', userVideoStream => {
            addVideoStream(userVideoStream, call.peer, false);
        });
    });

    document.getElementById('connectionStatus').textContent = '已连接 - 你的ID: ' + peer.id;
});

peer.on('open', id => {
    console.log('My peer ID is: ' + id);
});

peer.on('connection', function(conn) {
    conn.on('data', function(data){
        console.log('Received', data);
    });
});

function createEffectControls(video, container) {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'effect-controls';
    
    effects.forEach(effect => {
        const button = document.createElement('button');
        button.className = 'effect-button';
        if (effect.name === '正常') button.classList.add('active');
        button.textContent = effect.name;
        
        button.addEventListener('click', () => {
            // Remove active class from all buttons in this container
            container.querySelectorAll('.effect-button').forEach(btn => 
                btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Apply the effect
            video.style.filter = effect.filter;
        });
        
        controlsDiv.appendChild(button);
    });
    
    return controlsDiv;
}

function addVideoStream(stream, userId, isLocal) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'videoContainer';
    const video = document.createElement('video');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    
    videoContainer.appendChild(video);
    
    // Add effect controls
    const controls = createEffectControls(video, videoContainer);
    videoContainer.appendChild(controls);
    
    videoGrid.appendChild(videoContainer);
}

peer.on('call', call => {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    }).then(stream => {
        call.answer(stream);
        call.on('stream', userVideoStream => {
            addVideoStream(userVideoStream, call.peer, false);
        });
    });
});

peer.on('error', err => {
    console.error('PeerJS error:', err);
    document.getElementById('connectionStatus').textContent = '连接错误: ' + err.type;
});

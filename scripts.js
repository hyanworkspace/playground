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

// 获取本地视频流
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

function addVideoStream(stream, userId, isLocal) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'videoContainer';
    const video = document.createElement('video');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    
    // 随机选择一个效果
    const effect = effects[Math.floor(Math.random() * effects.length)];
    video.style.filter = effect.filter;
    
    const effectInfo = document.createElement('div');
    effectInfo.className = 'effect-info';
    effectInfo.textContent = `效果: ${effect.name}`;
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(effectInfo);
    videoGrid.appendChild(videoContainer);

    // 每30秒随机改变一次效果
    setInterval(() => {
        const newEffect = effects[Math.floor(Math.random() * effects.length)];
        video.style.filter = newEffect.filter;
        effectInfo.textContent = `效果: ${newEffect.name}`;
    }, 30000);
}

// 连接到新用户
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

// 错误处理
peer.on('error', err => {
    console.error('PeerJS error:', err);
    document.getElementById('connectionStatus').textContent = '连接错误: ' + err.type;
});
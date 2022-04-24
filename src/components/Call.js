import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import Topnav from './Includes/Topnav'
import Bottomnav from './Includes/Bottomnav'
import Copylink from './Includes/Copylink'
import {Container, Button, Form} from 'react-bootstrap'
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import * as cam from "@mediapipe/camera_utils";
import 'bootstrap/dist/css/bootstrap.min.css';


const socket = io.connect("https://vidchat-node-grv.herokuapp.com");
const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 40%;
`;


const Meeting = () => {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [cStream, setcStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [calling, setCalling] = useState(false);
  

  const userVideo = useRef();
  const partnerVideo = useRef();
  const connectionRef = useRef();
  const [camOn, setcamOn] = useState(true);
    const [micOn, setmicOn] = useState(true);
    const [blurOff, setblurOff] = useState(true);

    const canvasRef = useRef(null);
    const canvasStream = useRef(null);
   
    var canvasElement = null;

    const copyText = () => {
        let text = document.getElementById('linkText');
        text.select();
        text.setSelectionRange(0, 999);
        navigator.clipboard.writeText(text.value);
        alert('Copied! Now you can share your Id with others to call you.')
    }
  const onResults = (results) => {
    const vidWidth = userVideo.current.videoWidth;
    const vidHeight = userVideo.current.videoHeight;
    canvasRef.current.width = vidWidth;
    canvasRef.current.height = vidHeight;
    canvasElement = canvasRef.current;
    if(camOn){
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.fillStyle = "blue";
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        
        if(!blurOff){
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
            canvasCtx.filter = 'none';
            canvasCtx.globalCompositeOperation = 'source-over';
            canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
        
            canvasCtx.globalCompositeOperation = 'source-in';
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    
            canvasCtx.filter = 'blur(10px)';
            canvasCtx.globalCompositeOperation = 'destination-over';
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.restore();
        }
    } 
    
   
    

  }
  
const videoConstraints = {
  height: window.innerHeight,
  width: window.innerWidth
};

  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });
  selfieSegmentation.setOptions({
      modelSelection: 1,
  });

  selfieSegmentation.onResults(onResults);

  var newstream = null;
  socket.on("yourID", (id) => {
    console.log(id);
    setYourID(id);
  })
  socket.on("allUsers", (users) => {
    setUsers(users);
  })

  socket.on("hey", (data) => {
    setReceivingCall(true);
    setCaller(data.from); 
    setCallerSignal(data.signal);
  })

  useEffect(() => {
   
    navigator.mediaDevices.getUserMedia({ video: camOn, audio: micOn }).then(async stream => {
       
      setStream(stream);    
      console.log(1);
      if (userVideo.current && canvasRef.current) {
          
        var audio = stream.getAudioTracks()[0]; 
        userVideo.current.srcObject = stream;
        const videoWidth = userVideo.current.videoWidth;
        const videoHeight = userVideo.current.videoHeight;
        await userVideo.current.play();
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        canvasElement = canvasRef.current;
        const camera = new cam.Camera(userVideo.current, {
          onFrame: async () => {
              await selfieSegmentation.send({ image: userVideo.current }); 
          },
          videoConstraints
          });
          camera.start();
          newstream = canvasElement.captureStream(30)
        
         if(micOn){
            newstream.addTrack(audio);
         }
        //  console.log(newstream.getAudioTracks()[0], newstream.getVideoTracks()[0]);
         setcStream(newstream);
      }

    
    
  })
  }, [camOn, micOn, blurOff, yourID]);

  function callPeer(id) {
    setCalling(true);
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
            {
                urls: "stun:numb.viagenie.ca",
                username: "sultan1640@gmail.com",
                credential: "98376683"
            },
            {
                urls: "turn:numb.viagenie.ca",
                username: "sultan1640@gmail.com",
                credential: "98376683"
            }
        ]
    },
      stream: cStream,
    });

    connectionRef.current = peer;
    peer.on("signal", data => {
        socket.emit("callUser", { userToCall: id, signalData: data, from: yourID })
    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    })

  }

  function acceptCall() {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: cStream,
    });
    connectionRef.current = peer;
    peer.on("signal", data => {
        socket.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

 

  
  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <Video playsInline ref={partnerVideo} autoPlay  style={{float:'right'}}/>
    );
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div className="d-block text-center">
          {!callAccepted?(<h4 className="d-block text-center mt-3 ml-5">{caller} is calling you <Button className="btn-success" onClick={acceptCall}>Accept Call</Button></h4>):(<Button className="mt-4" variant="warning" >Call Started</Button>)}
        
      </div>
    )
  }

    return (
        <>
        <Topnav/>
        <Container>
        <Copylink copyLink={copyText} myid={yourID}/>
      <Row className="d-block">
      <canvas crossOrigin="anonymous" 
        ref={canvasRef}
        style={{
            border: '1px solid blue',
            width: '40%',
            float: 'left',
            background:'#000'
        }}
        ></canvas>
        <Video playsInline muted ref={userVideo} autoPlay style={{
           display:'none'
        }} />
        {PartnerVideo}
      </Row>
      <Row>

        <div className="col-md-4"></div>
        
        {!calling?(<div className="col-md-3 mt-4">
            <Form.Control
                id="callerid"
            />
        </div>):''}
        
           
            {!calling?(<div className="col-md-1 text-center  mt-4"><Button  variant="primary" onClick={() => {callPeer(document.getElementById('callerid').value)}}>Call</Button></div>):(<div className="col-md-4 text-center  mt-4"><Button  variant="warning" >Call Started</Button></div>)}
            


        {Object.keys(users).map(key => {
          if (key === yourID) {
            return null;
          }
        })}
      </Row>
      <Row className="d-block">
        {incomingCall}
      </Row>
      </Container>
            <Bottomnav camOn={camOn} setcamOn={setcamOn} micOn={micOn} setmicOn={setmicOn} blurOff={blurOff} setblurOff={setblurOff}/>
      </>
    );
};

export default Meeting;

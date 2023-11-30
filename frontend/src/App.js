import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare"; // Import ScreenShareIcon
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:5000");


function App() {
    const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const shareds =useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      {console.log(stream)}
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    return () => {
      // Cleanup code when the component unmounts
      socket.disconnect();
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const callInfo = { callAccepted, caller, callerSignal, name, idToCall,isScreenSharing };
    localStorage.setItem("callInfo", JSON.stringify(callInfo));
  }, [callAccepted, caller, callerSignal, name, idToCall,isScreenSharing]);

	const callUser = (id) => {
		const peer = new Peer({
		  initiator: true,
		  trickle: false,
		  stream: stream,
		});
	  
		peer.on("signal", (data) => {
		  socket.emit("callUser", {
			userToCall: id,
			signalData: data,
			from: me,
			name: name,
		  });
		});
	  
		socket.on("callAccepted", (signal) => {
		  setCallAccepted(true);
		  peer.signal(signal);
		});
	  
		peer.on("stream", (userStream) => {
      const combinedStream = new MediaStream([...userStream.getTracks(), ...stream.getTracks()]);
      userVideo.current.srcObject = combinedStream;
		});
	  
		connectionRef.current = peer;
	  };
	  
	  const answerCall = () => {
		setCallAccepted(true);
		const peer = new Peer({
		  initiator: false,
		  trickle: false,
		  stream: stream,
		});
	  
		peer.on("signal", (data) => {
		  socket.emit("answerCall", { signal: data, to: caller });
		});
	  
		peer.on("stream", (userStream) => {
		  userVideo.current.srcObject = userStream;
		});
	  
		peer.signal(callerSignal);
		connectionRef.current = peer;
	  };
	  
	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}

	const handleToggleAudio = () => {
		console.log("audio..");
		const audioTracks = stream.getAudioTracks();
		audioTracks.forEach((track) => {
		  console.log("Audio Track Enabled:", track.enabled);
		  track.enabled = !isAudioMuted;
		  console.log("New Audio Track Enabled:", track.enabled);
		});
		setIsAudioMuted(!isAudioMuted);
	  };
	  
	  const handleToggleVideo = () => {
		console.log("vido..");
		const videoTracks = stream.getVideoTracks();
		videoTracks.forEach((track) => {
		  console.log("Video Track Enabled:", track.enabled);
		  track.enabled = !isVideoMuted;
		  console.log("New Video Track Enabled:", track.enabled);
		});
		setIsVideoMuted(!isVideoMuted);
	  };
	  
    const stopScreenShare = () => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((userStream) => {
          const newStream = new MediaStream([...userStream.getTracks(), ...stream.getTracks().filter(track => track.kind !== 'video')]);
          setStream(newStream);
          setIsScreenSharing(false);
    
          // Update the video element with the user stream
          if (myVideo.current) {
            myVideo.current.srcObject = newStream;
          }
    
          // If there's an active connection, replace the screen sharing track
          if (connectionRef.current) {
            connectionRef.current.replaceTrack(stream.getVideoTracks()[0], userStream.getVideoTracks()[0], stream);
          }
        })
        .catch((error) => {
          console.error("Error accessing user video:", error);
        });
    };
    
    const handleToggleScreenShare = () => {
      if (isScreenSharing) {
        // If currently screen sharing, stop screen sharing
        stopScreenShare();
      } else {
        // If not currently screen sharing, start screen sharing
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then((screenStream) => {
            const screenTrack = screenStream.getTracks()[0];
    
            if (connectionRef.current) {
              connectionRef.current.replaceTrack(stream.getVideoTracks()[0], screenTrack, stream);
            }
    
            if (myVideo.current) {
              myVideo.current.srcObject = screenStream;
            }
    
            socket.emit("screenShare", { isScreenSharing: true, to: idToCall });
          })
          .catch((error) => {
            console.error("Error accessing screen share:", error);
          });
      }
    
      // Toggle the value of isScreenSharing
      setIsScreenSharing(prevState => !prevState);
    };
    
    
	return (
  <>
    {/* <h1 className="app-title">VideoSdk</h1> */}
    <div className="app-container">
      <div className="video-container">
        <div className="video">
          {stream && (
            <video playsInline muted ref={myVideo} autoPlay style={{ width: "500px" }} />
          )}
        </div>

        <div className="video">
          {callAccepted && !callEnded ? (
            <video playsInline ref={userVideo} autoPlay style={{ width: "500px" }} />
          ) : null}
        </div>
      </div>
	  
      <div className="bottom-row">
        <div className="myId pd-3 m-2 bg-light">
          <div>
            {receivingCall && !callAccepted ? (
              <div className="caller bg-light">
                <h1>Call From {name}..</h1>
                <Button variant="contained" color="success" onClick={answerCall}>
                  Answer
                </Button>
              </div>
            ) : null}
          </div>
		  <br></br>
          <div className="controls">
            <TextField
              id="filled-basic"
              label="Your Name"
              variant="filled"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
			<br/>
            <TextField
              id="filled-basic"
              label="Call Id"
              variant="filled"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
            />

			{/* genrate the id of that user so that you cab shaare with someone your id for calling  */}
			<br/>
            <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
              <Button variant="contained" color="success" startIcon={<AssignmentIcon fontSize="large" />}>
                Get ID
              </Button>
            </CopyToClipboard>
			
			{/* calling button  */}
            <IconButton className='call-btn' color="success" aria-label="call" onClick={() => callUser(idToCall)}>
              <PhoneIcon fontSize="large" />
            </IconButton>
			<IconButton
			className='screen-share-btn' // Add a custom class for styling
			color="primary"
			aria-label="screen share"
			onClick={!isScreenSharing?handleToggleScreenShare:stopScreenShare}
			>
			<ScreenShareIcon fontSize="large" />
</IconButton>
          </div>
		  {/* handdling end call functinality  */}
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <>
                <Button variant="contained" color="success" onClick={leaveCall}>
                  End
                </Button>
                <Button
                  variant="contained"
                  color={isAudioMuted ? "default" : "success"}
                  onClick={handleToggleAudio}
                >
                  {isAudioMuted ? <MicIcon/> : <MicOffIcon/>}
                </Button>
                <Button
                  variant="contained"
                  color={isVideoMuted ? "default" : "success"}
                  onClick={handleToggleVideo}
                >
                  {isVideoMuted ? <VideocamIcon/>: <VideocamOffIcon/>}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  </>
);


}

export default App

import { useEffect, useRef, useState } from "react";
import "./Editor.css";
import Client from "../Components/Client";
import { Button } from "react-bootstrap";
import ACTIONS from "../ACTIONS";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import CodeEditor from "./CodeEditor";
import { FaFileDownload } from "react-icons/fa";
import { IoIosCopy } from "react-icons/io";
import { ImCross } from "react-icons/im";

function EditorPage() {
  const [clients, setClients] = useState([]);

  let socketRef = useRef("");
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();

  const options = {
    "force new connection": true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };

  const onCodeChange = (code) => {
    codeRef.current = code;
  };

  const codeDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([codeRef.current], {
      type: "text/plain;charset=uft-8",
    });

    element.href = URL.createObjectURL(file);
    element.download = "CodeDocument.txt";
    document.body.appendChild(element);
    element.click();
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = io("http://localhost:5000", options);
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("socket error", err);
        toast.error("Socket connection failed, try agin later");
        reactNavigator("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        userName: location.state?.userName,
      });

      //Listening for Joined Event

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, userName, socketId }) => {
          if (userName !== location.state?.userName) {
            toast.success(`${userName} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      //Listening for Disconnected

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id has been copied to your cliprboard. ");
    } catch (error) {
      toast.error("Sorry! coundn't copy Room Id.");
      console.log(error);
    }
  }
  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    <Navigate to="/" />;
  }

  return (
    <div className="mainwrap">
      <div className="asidewrap">
        <div className="inner">
          {/* <div className="logo">
            {" "}
            <img src={logo} alt="" />
          </div> */}
          <h4>Connected</h4>
          <div className="clients-list">
            {clients.map((client) => (
              <Client key={client.socketId} userName={client.userName} />
            ))}
          </div>
        </div>
        <Button className="copyRoomId" variant="info" onClick={copyRoomId}>
          Copy Room Id <IoIosCopy />
        </Button>
        <Button
          className="downloadCode"
          variant="success"
          onClick={codeDownload}
        >
          Download Code <FaFileDownload />
        </Button>
        <Button className="leaveRoom" variant="warning" onClick={leaveRoom}>
          Leave <ImCross />
        </Button>
      </div>

      <div className="editorWarp">
        <CodeEditor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={onCodeChange}
        />
      </div>
    </div>
  );
}

export default EditorPage;

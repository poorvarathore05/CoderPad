import { useState } from "react";
import { Button, Card } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { v4 as uuidV4 } from "uuid";
import "./Home.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created new Room");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!userName || !roomId) {
      toast.error("RoomId & UserName is required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        userName,
      },
    });
  };
  return (
    <>
      <div className="main">
        <Card className="card" style={{ width: "25rem" }}>
          <h2 className="title">Coding tool for Developers</h2>
          <Form className="form">
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="roomid"
                placeholder="ROOMID"
                onChange={(e) => setRoomId(e.target.value)}
                value={roomId}
              ></Form.Control>

              <Form.Control
                type="text"
                name="username"
                placeholder="USERNAME"
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
              ></Form.Control>
            </Form.Group>
            <Button
              type="submit"
              variant="success"
              value="Submit"
              className="btnJoin"
              onClick={joinRoom}
            >
              Join
            </Button>
          </Form>
          <span className="link_to_create">
            {" "}
            if you don't have invite then create{" "}
            <a href="" className="link" onClick={createNewRoom}>
              new room
            </a>
          </span>
        </Card>
      </div>
    </>
  );
}

export default Home;

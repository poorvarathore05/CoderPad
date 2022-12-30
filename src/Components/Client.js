import Avatar from "react-avatar";
import "./Client.css";

function Client({ userName }) {
  return (
    <div className="client">
      <Avatar name={userName} size="50px" round="14px" />
      <span>{userName}</span>
    </div>
  );
}

export default Client;

import { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

const LOCALSTORAGE_KEY = "save-me";
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

const ChatContext = createContext({
  status: {},
  me: "",
  signedIn: false,
  messages: [],
  sendMessage: () => {},
  clearMessages: () => {},
});

const client = new WebSocket("/");


const ChatProvider = (props) => {
  const [status, setStatus] = useState({});
  const [me, setMe] = useState(savedMe || "");
  const [signedIn, setSignedIn] = useState(false);
  const [messages, setMessages] = useState([]);

  client.onmessage = (byteString) => {
    const { data } = byteString;
    const [task, payload] = JSON.parse(data);
    console.log("🚀 ~ file: useChat.js ~ line 27 ~ ChatProvider ~ payload", payload)

    switch (task) {
      case "output": {
        setMessages([...messages, payload]);
        break;
      }
      case "status": {
        setStatus(payload);
        break;
      }
      case "init": {
        // console.log(payload);
        console.log("init");
        
        setMessages(payload);
        break;
      }
      case "cleared": {
        console.log("messages cleared!");
        setMessages([]);
        break;
      }
      default:
        break;
    }
    // console.log(messages)
  };

  const sendData = async (data) => {
    await client.send(
      JSON.stringify(data) //轉成字串給後端 後端用JSON.parse(str[,reviver])
    );
  };

  const startChat = async (name, to) => {
    // console.log("🚀 ~ file: useChat.js ~ line 56 ~ startChat ~ to", to)
    // console.log("🚀 ~ file: useChat.js ~ line 56 ~ startChat ~ name", name)
    if (!name || !to) throw new Error("Name or to required");
    await sendData(["Chat", { name, to }]);
  };

  const sendMessage = ({ name, to, body }) => {
    // console.log("🚀 ~ file: useChat.js ~ line 61 ~ sendMessage ~ body", body)
    // console.log("🚀 ~ file: useChat.js ~ line 61 ~ sendMessage ~ to", to)
    // console.log("🚀 ~ file: useChat.js ~ line 61 ~ sendMessage ~ name", name)

    if (!name || !to || !body) throw new Error("Name or to or body required");
    sendData(["MESSAGE", { name, to, body }]);
  };

  //   const sendMessage = (payload) => {
  //     // console.log(payload)
  //     sendData(["input", payload]);
  //   };

  const clearMessages = () => {
    // console.log('clearMessages sent to backend')
    sendData(["clear"]);
  };

  const displayStatus = (s) => {
    if (s.msg) {
      const { type, msg } = s;
      const content = {
        content: msg,
        duration: 0.5,
      };

      switch (type) {
        case "success":
          message.success(content);
          break;
        case "error":
        default:
          message.error(content);
          break;
      }
    }
  };

  useEffect(() => {
    if (signedIn) {
      localStorage.setItem(LOCALSTORAGE_KEY, me);
    }
  }, [me, signedIn]);

  return (
    <ChatContext.Provider
      value={{
        status,
        me,
        signedIn,
        messages,
        setMe,
        setSignedIn,
        sendMessage,
        clearMessages,
        displayStatus,
        startChat,
      }}
      {...props}
    />
  );
};

const useChat = () => useContext(ChatContext);
export { ChatProvider, useChat };

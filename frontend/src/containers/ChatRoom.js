import { useState, useEffect, useRef } from "react";
import { Input, Tabs } from "antd";
import styled from "styled-components";
import { useChat, ChatProvider } from "./hooks/useChat";
import Title from "../components/Title.js";
import Message from "../components/Message.js";
import ChatModal from "../components/ChatModal";

const ChatBoxesWrapper = styled(Tabs)`
  width: 100%;
  height: 300px;
  background: #eeeeee52;
  border-radius: 10px;
  margin: 20px;
  padding: 20px;
  overflow: auto;
`;

const FootRef = styled.div`
  height: 20px;
`;
const ChatRoom = () => {
  const { me, messages, sendMessage, displayStatus, startChat } = useChat();
  // const [username, setUsername] = useState('')
  const [msg, setMsg] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [chatBoxes, setChatBoxes] = useState([]); //{ label, children, key}
  const [activeKey, setActiveKey] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const msgRef = useRef(null);
  const msgFooter = useRef(null);

  const createChatBox = async (friend) => {
    if (chatBoxes.some(({ key }) => key === friend)) {
      throw new Error(friend + "'s chat box has already opened.");
    }

    const chat = await extractChat(friend);
    // console.log(chat)
    setChatBoxes([
      ...chatBoxes,
      {
        label: friend,
        children: chat,
        key: friend,
      },
    ]);
    setMsgSent(true);
    return friend;
  };

  const removeChatBox = (targetKey, activeKey) => {
    const index = chatBoxes.findIndex(({ key }) => key === activeKey);
    const newChatBoxes = chatBoxes.filter(({ key }) => key !== targetKey);
    setChatBoxes(newChatBoxes);
    return activeKey
      ? activeKey === targetKey
        ? index === 0
          ? ""
          : chatBoxes[index - 1].key
        : activeKey
      : "";
  };

  const renderChat = (chat) =>
    chat.length === 0 ? (
      <p style={{ color: "#ccc" }}>No messages...</p>
    ) : (
      chat.map(({ name, body }, i) => (
        i !== chat.length - 1 ?
        <Message isMe={name === me} message={body} key={i} />
        :
        <Message isMe={name === me} message={body} key={i} ref={msgFooter}/>
      ))
      // 
    ); // 產生 chat 的 DOM nodes

  const extractChat = (friend) => {
    // console.log(messages)
    // console.log(me,friend)
    let chat = messages.filter(
      ({ name, body }) => name === friend || name === me
    );
    // console.log('new chat: ',chat)
    return renderChat(chat);
  };

  const displayMessages = () =>
    messages.length === 0 ? (
      <p style={{ color: "#ccc" }}>No messages...</p>
    ) : (
      messages.map(({ name, body }, i) => (
        <Message name={name} isMe={name === me} message={body} key={i} />
      ))
    );

    const scrollToBottom = () => {
      console.log(msgFooter)
      msgFooter.current?.scrollIntoView
      ({ behavior: 'smooth', block: "start" });
      };

  
  const Reload = async () => {
    console.log("reloading");
    // console.log(messages)
    const chat = await extractChat(activeKey);
    // console.log("🚀 ~ file: ChatRoom.js ~ line 111 ~ Reload ~ chat", chat)
    setChatBoxes((prev) => {
      let newChatBoxes = prev.map((box) => {
        if (box.key === activeKey) {
          // console.log({box, children: chat})
          // console.log({...box, children: chat})
          
          return { ...box, children: chat };
        } else {
          return box;
        }
      });
      return newChatBoxes;
    });

    // setMsgSent(true);
  };
  // console.log(chatBoxes)
  useEffect(() => {
    Reload();
  }, [messages]);
 
  useEffect(() => {
    scrollToBottom();
    setMsgSent(false);
  }, [msgSent,chatBoxes]);

  // useEffect(() => {
  //   console.log(chatBoxes)
  // },[chatBoxes])

  return (
    <>
      <Title name={me} />
      <>
        <ChatBoxesWrapper
          tabBarExtraContent={{ height: "36px" }}
          type="editable-card"
          activeKey={activeKey}
          onChange={async (key) => {
            // console.log(key);
            await setActiveKey(key);
            await startChat(me, key);
            Reload();
          }}
          onEdit={(targetKey, action) => {
            if (action === "add") setModalOpen(true);
            else if (action === "remove") {
              setActiveKey(removeChatBox(targetKey, activeKey));
            }
          }}
          items={chatBoxes}
        >
          
          
        </ChatBoxesWrapper>

        <ChatModal
          open={modalOpen}
          onCreate={({ name }) => {
            createChatBox(name);
            setActiveKey(name);
            startChat(me, name);

            setModalOpen(false);
            scrollToBottom();
          }}
          onCancel={() => {
            setModalOpen(false);
          }}
        />
      </>
          
      <Input.Search
        value={msg}
        ref={msgRef}
        onChange={(e) => {
          setMsg(e.target.value);
        }}
        enterButton="Send"
        placeholder="Type a message here"
        onSearch={(msg) => {
          if (!msg) {
            displayStatus({
              type: "error",
              msg: "Please enter a username and a message body.",
            });
            return;
          }

          sendMessage({ name: me, to: activeKey, body: msg });
          setMsg("");
          setMsgSent(true);
        }}
      ></Input.Search>
    </>
  );
};

export default ChatRoom;

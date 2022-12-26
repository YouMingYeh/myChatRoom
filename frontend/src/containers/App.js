import "./App.css";
import { Button, Input, Tag, message } from "antd";
import { useEffect, useState, useRef } from "react";
import { useChat, ChatProvider } from "./hooks/useChat";
import styled from "styled-components";
import Title from "../components/Title";
import ChatRoom from "./ChatRoom";
import SignIn from "./SignIn";
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 500px;
  margin: auto;
`;

function App() {
  const { status, me, signedIn, displayStatus } = useChat();

  useEffect(() => {
    // console.log(status)
    displayStatus(status);
  }, [status]);

  return (
    <Wrapper>
      {signedIn ? <ChatRoom></ChatRoom> : <SignIn me={me}></SignIn>}
    </Wrapper>
  );
}

export default App;

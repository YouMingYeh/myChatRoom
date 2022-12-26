import Login from "../components/Login";
import { useChat } from "./hooks/useChat";
import Title from "../components/Title";
const SignIn = () => {
  const { me, setMe, setSignedIn, displayStatus } = useChat();
  const handleLogin = (name) => {
    if (!name)
      displayStatus({
        type: "error",
        msg: "Missing user name",
      });
    else setSignedIn(true);
  };
  return (
    <>
      {/* <AppTitle /> */}
      <Title></Title>
      <Login me={me} setName={setMe} onLogin={handleLogin} />
    </>
  );
};
export default SignIn;

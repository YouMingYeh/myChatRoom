import MessageModel from "./models/message.js";
import UserModel from "./models/user.js";
import ChatBoxModel from "./models/chatbox.js";
// import { message } from "antd";

const chatBoxes = {};

const makeName = (name, to) => {
  return [name, to].sort().join("_");
};

const validateChatBox = async (name, participants) => {
  let box = await ChatBoxModel.findOne({ name });
  if (!box) box = await new ChatBoxModel({ name, users: participants }).save();

  return [box, box["_id"]];
};

const validateUser = async (name) => {
  let user = await UserModel.findOne({ name });
  if (!user) user = await new UserModel({ name }).save();

  return user;
};

const sendData = (data, ws) => {
  //   console.log("🚀 ~ file: wsConnect.js ~ line 27 ~ sendData ~ ws", ws)
  ws.send(JSON.stringify(data));
  //   console.log("🚀 ~ file: wsConnect.js ~ line 28 ~ sendData ~ ws", ws)
};
const sendStatus = (payload, ws) => {
  //   console.log("🚀 ~ file: wsConnect.js ~ line 31 ~ sendStatus ~ ws", ws)
  sendData(["status", payload], ws);
  //   console.log("🚀 ~ file: wsConnect.js ~ line 33 ~ sendStatus ~ ws", ws)
};

const broadcastMessage = (wss, data, status, chatBoxName) => {
  const OpenedRooms = Array.from(chatBoxes[chatBoxName])
  OpenedRooms.map((room)=>{
    sendData(data, room);
    sendStatus(status, room);
  })
  
}
  


export default {
  onClose: (wss,ws)=> async ()=>{
    console.log(chatBoxes)
    if (ws.box !== "" && chatBoxes[ws.box])
          chatBoxes[ws.box].delete(ws);
          
    console.log(chatBoxes)
    console.log('A ws was closed.');
  },
  onMessage: (wss, ws) => async (byteString) => {
    // console.log(byteString)
    // console.log("🚀 ~ file: wsConnect.js ~ line 42 ~ onMessage: ~ ws", ws)

    const { data } = byteString;
    //   console.log("🚀 ~ file: wsConnect.js ~ line 44 ~ onMessage: ~ data", data)

    const [task, payload] = JSON.parse(data);
    //   console.log("🚀 ~ file: wsConnect.js ~ line 47 ~ onMessage: ~ payload", payload)
    //   console.log("🚀 ~ file: wsConnect.js ~ line 47 ~ onMessage: ~ task", task)

    //   console.log('!')
    // console.log(task)
    switch (task) {
      case "Chat": {
        console.log("Chat created");
        const { name, to } = payload;
        const a = await validateUser(name); // sender object { ... }
        const b = await validateUser(to); // receiver object { ... } => _id: ....
        const chatBoxName = makeName(name, to);
        const participants = [a, b]; // [{obj1}, {obj2}]
        const [chatBox, box_id] = await validateChatBox(
          chatBoxName,
          participants
        );
        // console.log("🚀 ~ file: wsConnect.js ~ line 69 ~ onMessage: ~ box_id", box_id)

        // console.log("🚀 ~ file: wsConnect.js ~ line 69 ~ onMessage: ~ chatBox", chatBox)
        

        const temp = await chatBox.populate({
          path: "messages",
          populate: "sender", 
        });
        
        //msg [{'name': ..., 'body':...}]
       
        let messages = temp["messages"];
        // [messages:{
        //   chatBox:
        //   sender:
        //   body:
        // }]
       
        let msg = [];
        messages.map(async (m) => {
          // console.log(m)
          let sender = m["sender"]["name"]; //string
          let body = m["body"]; //string
          msg.push({
            name: sender,
            body: body,
          });
        });


        if (ws.box !== "" && chatBoxes[ws.box])
          // user(ws) was in another chatbox
          chatBoxes[ws.box].delete(ws);

        ws.box = chatBoxName

        if (!chatBoxes[chatBoxName]) chatBoxes[chatBoxName] = new Set();

        // console.log("🚀 ~ file: wsConnect.js ~ line 74 ~ onMessage: ~ ws", ws)

         chatBoxes[chatBoxName].add(ws);

        
          
       
        // console.log("🚀 ~ file: wsConnect.js ~ line 63 ~ onMessage: ~ chatBox", chatBox)

        //TODO: send data

        await UserModel.updateOne(
          { name: a["name"] },
          { $push: { chatBoxes: box_id } }
        );
        await UserModel.updateOne(
          { name: b["name"] },
          { $push: { chatBoxes: box_id } }
        );

        // console.log(msg);

        broadcastMessage(wss, ["init", msg], {
          type: "success",
          msg: "Loading",
        }, chatBoxName);

        break;
      }
      case "MESSAGE": {
        const { name, to, body } = payload;
        const a = await validateUser(name);
        const b = await validateUser(to);
        const chatBoxName = makeName(name, to);
        const participants = [a, b];
        const chatBox = await validateChatBox(chatBoxName, participants);

        const message = new MessageModel({
          chatBox: chatBox["_id"],
          sender: a["_id"],
          body: body,
        });
        await message.save();
        // console.log(message)

        await ChatBoxModel.updateOne(
          { name: chatBoxName },
          { $push: { messages: message["_id"] } }
        );

        //TODO: send data

        // console.log(message);

        broadcastMessage(wss, ["output", { name: name, body: body }], {
          type: "success",
          msg: "Message sent.",
        }, chatBoxName);

        break;
      }
    }
  },
};

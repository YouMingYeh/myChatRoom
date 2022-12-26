import mongoose from "mongoose";
const Schema = mongoose.Schema;
// Creating a schema, sort of like working with an ORM
const ChatBoxSchema = new Schema({
  name: { type: String, required: [true, "Name field is required."] },
  users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Types.ObjectId, ref: "Message" }],
});
// Creating a table within database with the defined schema
const ChatBoxModel = mongoose.model("ChatBox", ChatBoxSchema);
// Exporting table for querying and mutating
export default ChatBoxModel;

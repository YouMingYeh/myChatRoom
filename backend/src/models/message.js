import mongoose from "mongoose";
const Schema = mongoose.Schema;
// Creating a schema, sort of like working with an ORM
const MessageSchema = new Schema({
  chatBox: { type: mongoose.Types.ObjectId, ref: "ChatBox" },
  sender: { type: mongoose.Types.ObjectId, ref: "User" },
  body: { type: String, required: [true, "Body field is required."] },
});
// Creating a table within database with the defined schema
const MessageModel = mongoose.model("Message", MessageSchema);
// Exporting table for querying and mutating
export default MessageModel;

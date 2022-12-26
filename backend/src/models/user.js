import mongoose from "mongoose";
const Schema = mongoose.Schema;
// Creating a schema, sort of like working with an ORM
const UserSchema = new Schema({
  name: { type: String, required: [true, "Name field is required."] },
  chatBoxes: [{ type: mongoose.Types.ObjectId, ref: "ChatBox" }],
});
// Creating a table within database with the defined schema
const UserModel = mongoose.model("User", UserSchema);
// Exporting table for querying and mutating
export default UserModel;

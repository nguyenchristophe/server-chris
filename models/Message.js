
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Référence au modèle d'utilisateur que vous avez déjà
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Message = mongoose.model("Message", messageSchema);

export default Message;

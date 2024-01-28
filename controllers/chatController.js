// chat/controllers/chatController.js
import Message from "../models/Message.js";
import User from "../models/User.js"; // Assurez-vous que le chemin est correct

export const sendMessage = async (req, res, next) => {
  try {
    const { senderId, content } = req.body;
    
    // Créez un nouveau message
    const message = new Message({
      sender: senderId,
      content,
    });

    // Enregistrez le message dans la base de données
    await message.save();

    // Ajoutez le message à l'utilisateur qui l'a envoyé
    const sender = await User.findById(senderId);
    sender.chatMessages.push(message);
    await sender.save();

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Récupérez tous les messages de l'utilisateur spécifié
    const user = await User.findById(userId).populate("chatMessages");
    const messages = user.chatMessages;

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

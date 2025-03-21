import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  description: {
    type: String,
    required: [true, "Please Enter Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Price"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter Stock"],
  },

  images: [{ public_id: String, url: String }],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],

  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],

  voteCount: {
    type: Number,
    default: 0,
  },

  likeCount: {
    type: Number,
    default: 0,
  },
    // 🟢 Nouveau champ, liste d’assets liés à ce poème
  assetsSelected: [
    {
      asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
        required: true,
      },
      // En cas de besoin, on peut stocker un surcoût final (calculé au moment de la sélection)
      extraCost: {
        type: Number,
        default: 0,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", schema);

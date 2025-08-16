
// models/playlist.js
import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // +++
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  poems: [
    {
      poem: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      views: { type: Number, default: 0 }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Playlist = mongoose.model("Playlist", playlistSchema);

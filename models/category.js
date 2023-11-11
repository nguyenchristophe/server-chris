import mongoose from "mongoose";

const schema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "Veuillez saisir la catégorie"],
  },
});

export const Category = mongoose.model("Category", schema);

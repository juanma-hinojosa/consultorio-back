const mongoose = require('mongoose');

const extraSectionSchema = new mongoose.Schema({
  paragraph: String,
  imageUrl: String,
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  intro: { type: String, required: true },
  category: { type: String, required: true },
  mainImageUrl: { type: String, required: true },
  contentParagraph: { type: String, required: true },
  contentImagesUrls: [String],
  extraSections: [extraSectionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blog', blogSchema);

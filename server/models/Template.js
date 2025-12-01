const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  thumbnail_url: { type: String },
  components_config: { type: mongoose.Schema.Types.Mixed, required: true },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);

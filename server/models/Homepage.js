const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  components_config: { type: mongoose.Schema.Types.Mixed, default: { components: [] } }, // Stores the JSON config
  template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  is_published: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Homepage', homepageSchema);

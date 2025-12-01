const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Template = require('../models/Template');
const Homepage = require('../models/Homepage');
const auth = require('../middleware/auth');

router.get('/', asyncHandler(async (req, res) => {
  const templates = await Template.find({ is_default: true });
  res.json({ code: 200, msg: 'success', data: templates });
}));

router.post('/apply', auth, asyncHandler(async (req, res) => {
  const { templateId } = req.body;
  const template = await Template.findById(templateId);
  
  if (!template) {
    return res.status(404).json({ code: 404, msg: 'error', error: 'Template not found' });
  }

  const homepage = await Homepage.findOneAndUpdate(
    { user_id: req.user.id },
    { 
      components_config: template.components_config,
      template_id: template._id,
      updated_at: Date.now()
    },
    { new: true }
  );

  res.json({ code: 200, msg: 'success', data: homepage });
}));

module.exports = router;

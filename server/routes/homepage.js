const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const Homepage = require('../models/Homepage');
const auth = require('../middleware/auth');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize text content in components
const sanitizeComponents = (components) => {
  return components.map(comp => {
    if (comp.type === 'text' && comp.props.content) {
      comp.props.content = DOMPurify.sanitize(comp.props.content);
    }
    return comp;
  });
};

router.get('/:userId', auth, asyncHandler(async (req, res) => {
  // Check if requesting own homepage or just viewing
  // For editing, we need the draft config.
  // The requirement says GET /api/homepage/:userId for config.
  // Assuming this is for the editor to load the current state.
  
  let homepage = await Homepage.findOne({ user_id: req.params.userId });
  
  if (!homepage) {
     // Should have been created on register, but just in case
     homepage = await Homepage.create({ user_id: req.params.userId });
  }

  res.json({ code: 200, msg: 'success', data: homepage });
}));

router.put('/', auth, asyncHandler(async (req, res) => {
  const { components_config } = req.body;
  
  if (components_config && components_config.components) {
    components_config.components = sanitizeComponents(components_config.components);
  }

  const homepage = await Homepage.findOneAndUpdate(
    { user_id: req.user.id },
    { 
      components_config,
      updated_at: Date.now()
    },
    { new: true, upsert: true }
  );

  res.json({ code: 200, msg: 'success', data: homepage });
}));

router.post('/publish', auth, asyncHandler(async (req, res) => {
  const homepage = await Homepage.findOneAndUpdate(
    { user_id: req.user.id },
    { is_published: true },
    { new: true }
  );
  res.json({ code: 200, msg: 'success', data: homepage });
}));

module.exports = router;

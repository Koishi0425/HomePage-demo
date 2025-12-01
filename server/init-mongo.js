const mongoose = require('mongoose');
const Template = require('./models/Template');

mongoose.connect('mongodb://localhost:27017/illustration_platform')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing default templates
    await Template.deleteMany({ is_default: true });

    const templates = [
      {
        name: '简约画廊',
        is_default: true,
        components_config: {
          components: [
            { id: 't1', type: 'text', props: { content: '我的作品集', fontSize: '24px', textAlign: 'center' } },
            { id: 'd1', type: 'divider', props: {} },
            { id: 'i1', type: 'image', props: { src: 'https://via.placeholder.com/800x400', width: '100%' } }
          ]
        }
      },
      {
        name: '图文混排',
        is_default: true,
        components_config: {
          components: [
            { id: 't1', type: 'text', props: { content: '关于我', fontSize: '20px' } },
            { id: 't2', type: 'text', props: { content: '这里是个人简介...', fontSize: '14px' } },
            { id: 'i1', type: 'image', props: { src: 'https://via.placeholder.com/400x300', width: '50%' } }
          ]
        }
      },
      {
        name: '视频展示',
        is_default: true,
        components_config: {
          components: [
            { id: 'v1', type: 'video', props: { src: 'https://www.w3schools.com/html/mov_bbb.mp4' } },
            { id: 't1', type: 'text', props: { content: '最新创作视频', fontSize: '18px', textAlign: 'center' } }
          ]
        }
      }
    ];

    await Template.insertMany(templates);
    console.log('Default templates initialized');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

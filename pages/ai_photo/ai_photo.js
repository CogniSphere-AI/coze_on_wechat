// ai_photo.js
Page({
  data: {
    photoStyles: [
      {
        id: 'style1',
        name: '风格1(男女老少通用)',
        image: '/images/style1.png',
        type: 'photo'
      },
      {
        id: 'style2',
        name: '风格2(男女老少通用)',
        image: '/images/style2.png',
        type: 'photo'
      }
    ],
    nationalDayStyles: [
      {
        id: 'national1',
        name: '国庆头像',
        image: '/images/national1.png',
        type: 'national'
      },
      {
        id: 'national2',
        name: '敬礼动漫写真',
        image: '/images/national2.png',
        type: 'national'
      }
    ],
    faceSwapStyles: [
      {
        id: 'face1',
        name: '发型1',
        image: '/images/face1.png',
        type: 'face'
      },
      {
        id: 'face2',
        name: '表情包',
        image: '/images/face2.png',
        type: 'face'
      }
    ],
    // Default workflow IDs for each style type
    workflowIds: {
      photo: '',
      national: '',
      face: '',
      default: ''
    }
  },
  
  onLoad: function() {
    // Check if workflow IDs are stored in storage
    const photoWorkflowId = wx.getStorageSync('photo_workflow_id');
    const nationalWorkflowId = wx.getStorageSync('national_workflow_id');
    const faceWorkflowId = wx.getStorageSync('face_workflow_id');
    const defaultWorkflowId = wx.getStorageSync('default_workflow_id');
    
    this.setData({
      'workflowIds.photo': photoWorkflowId || '',
      'workflowIds.national': nationalWorkflowId || '',
      'workflowIds.face': faceWorkflowId || '',
      'workflowIds.default': defaultWorkflowId || ''
    });
  },
  
  selectStyle: function(e) {
    const styleId = e.currentTarget.dataset.id;
    const styleType = e.currentTarget.dataset.type;
    const styleName = e.currentTarget.dataset.name;
    
    // Navigate to the style processor page with the selected style information
    wx.navigateTo({
      url: `../style_processor/style_processor?id=${styleId}&name=${styleName}&type=${styleType}`
    });
  }
})

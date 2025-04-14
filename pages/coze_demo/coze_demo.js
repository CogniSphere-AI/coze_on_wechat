// coze_demo.js
const cozeApi = require('../../services/cozeApi');
const tencentCloudService = require('../../services/tencentCloudService');

Page({
  data: {
    apiKey: '',
    workflowId: '',
    photoWorkflowId: '',
    nationalWorkflowId: '',
    faceWorkflowId: '',
    tencentSecretId: '',
    tencentSecretKey: '',
    tencentBucket: '',
    tencentRegion: '',
    userInput: '',
    botResponse: '',
    isLoading: false,
    hasSetConfig: false,
    responseHistory: []
  },

  onLoad: function() {
    // Check if API key is already set in storage
    const apiKey = wx.getStorageSync('coze_api_key');
    const workflowId = wx.getStorageSync('coze_workflow_id');
    const photoWorkflowId = wx.getStorageSync('photo_workflow_id');
    const nationalWorkflowId = wx.getStorageSync('national_workflow_id');
    const faceWorkflowId = wx.getStorageSync('face_workflow_id');
    const tencentSecretId = wx.getStorageSync('tencent_secret_id');
    const tencentSecretKey = wx.getStorageSync('tencent_secret_key');
    const tencentBucket = wx.getStorageSync('tencent_bucket');
    const tencentRegion = wx.getStorageSync('tencent_region');
    
    if (apiKey && workflowId) {
      this.setData({
        apiKey: apiKey,
        workflowId: workflowId,
        photoWorkflowId: photoWorkflowId || '',
        nationalWorkflowId: nationalWorkflowId || '',
        faceWorkflowId: faceWorkflowId || '',
        tencentSecretId: tencentSecretId || '',
        tencentSecretKey: tencentSecretKey || '',
        tencentBucket: tencentBucket || '',
        tencentRegion: tencentRegion || '',
        hasSetConfig: true
      });
      
      // Set the configuration in the API service
      cozeApi.setConfig({
        apiKey: apiKey
      });
      
      // Set Tencent Cloud configuration if available
      if (tencentSecretId && tencentSecretKey && tencentBucket && tencentRegion) {
        tencentCloudService.setConfig({
          SecretId: tencentSecretId,
          SecretKey: tencentSecretKey,
          Bucket: tencentBucket,
          Region: tencentRegion
        });
      }
    }
  },

  // Handle input for API key
  onApiKeyInput: function(e) {
    this.setData({
      apiKey: e.detail.value
    });
  },

  // Handle input for workflow ID
  onWorkflowIdInput: function(e) {
    this.setData({
      workflowId: e.detail.value
    });
  },
  
  // Handle input for photo workflow ID
  onPhotoWorkflowIdInput: function(e) {
    this.setData({
      photoWorkflowId: e.detail.value
    });
  },
  
  // Handle input for national workflow ID
  onNationalWorkflowIdInput: function(e) {
    this.setData({
      nationalWorkflowId: e.detail.value
    });
  },
  
  // Handle input for face workflow ID
  onFaceWorkflowIdInput: function(e) {
    this.setData({
      faceWorkflowId: e.detail.value
    });
  },
  
  // Handle input for Tencent Cloud SecretId
  onTencentSecretIdInput: function(e) {
    this.setData({
      tencentSecretId: e.detail.value
    });
  },
  
  // Handle input for Tencent Cloud SecretKey
  onTencentSecretKeyInput: function(e) {
    this.setData({
      tencentSecretKey: e.detail.value
    });
  },
  
  // Handle input for Tencent Cloud Bucket
  onTencentBucketInput: function(e) {
    this.setData({
      tencentBucket: e.detail.value
    });
  },
  
  // Handle input for Tencent Cloud Region
  onTencentRegionInput: function(e) {
    this.setData({
      tencentRegion: e.detail.value
    });
  },

  // Handle input for user message
  onUserInputChange: function(e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  // Save configuration
  saveConfig: function() {
    const { 
      apiKey, workflowId, photoWorkflowId, nationalWorkflowId, faceWorkflowId,
      tencentSecretId, tencentSecretKey, tencentBucket, tencentRegion 
    } = this.data;
    
    if (!apiKey) {
      wx.showToast({
        title: 'API Key不能为空',
        icon: 'none'
      });
      return;
    }
    
    if (!workflowId) {
      wx.showToast({
        title: '默认 Workflow ID不能为空',
        icon: 'none'
      });
      return;
    }
    
    // Save Coze API configuration to storage
    wx.setStorageSync('coze_api_key', apiKey);
    wx.setStorageSync('coze_workflow_id', workflowId);
    
    // Save workflow IDs for different styles
    if (photoWorkflowId) wx.setStorageSync('photo_workflow_id', photoWorkflowId);
    if (nationalWorkflowId) wx.setStorageSync('national_workflow_id', nationalWorkflowId);
    if (faceWorkflowId) wx.setStorageSync('face_workflow_id', faceWorkflowId);
    
    // Set the workflow IDs in the API service
    cozeApi.setWorkflowIds({
      photo: photoWorkflowId,
      national: nationalWorkflowId,
      face: faceWorkflowId,
      default: workflowId
    });
    
    // Set the Coze API configuration
    cozeApi.setConfig({
      apiKey: apiKey
    });
    
    // Check if Tencent Cloud configuration is provided
    if (tencentSecretId && tencentSecretKey && tencentBucket && tencentRegion) {
      // Save Tencent Cloud configuration to storage
      wx.setStorageSync('tencent_secret_id', tencentSecretId);
      wx.setStorageSync('tencent_secret_key', tencentSecretKey);
      wx.setStorageSync('tencent_bucket', tencentBucket);
      wx.setStorageSync('tencent_region', tencentRegion);
      
      // Set the Tencent Cloud configuration in the service
      tencentCloudService.setConfig({
        SecretId: tencentSecretId,
        SecretKey: tencentSecretKey,
        Bucket: tencentBucket,
        Region: tencentRegion
      });
    } else if (tencentSecretId || tencentSecretKey || tencentBucket || tencentRegion) {
      // If some but not all Tencent Cloud configuration is provided
      wx.showToast({
        title: '腾讯云配置不完整',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      hasSetConfig: true
    });
    
    wx.showToast({
      title: '配置已保存',
      icon: 'success'
    });
  },

  // Call the Coze workflow
  callWorkflow: function() {
    const { userInput, workflowId } = this.data;
    
    if (!userInput) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      botResponse: ''
    });
    
    // Add user message to history
    const newHistory = [...this.data.responseHistory];
    newHistory.push({
      role: 'user',
      content: userInput
    });
    
    this.setData({
      responseHistory: newHistory
    });
    
    // Call the workflow
    cozeApi.callWorkflow(
      workflowId,
      { message: userInput },
      (result) => {
        // Handle success
        console.log('Workflow result:', result);
        
        let response = '';
        if (result && result.output && result.output.response) {
          response = result.output.response;
        } else if (result && result.output) {
          response = JSON.stringify(result.output);
        } else {
          response = '无法解析响应数据';
        }
        
        // Add bot response to history
        const updatedHistory = [...this.data.responseHistory];
        updatedHistory.push({
          role: 'assistant',
          content: response
        });
        
        this.setData({
          botResponse: response,
          responseHistory: updatedHistory,
          userInput: '' // Clear input field
        });
      },
      (error) => {
        // Handle error
        console.error('Workflow error:', error);
        wx.showToast({
          title: '调用失败: ' + (error.errMsg || '未知错误'),
          icon: 'none'
        });
      },
      () => {
        // Complete callback
        this.setData({
          isLoading: false
        });
      }
    );
  },

  // Stream the Coze workflow response
  streamWorkflow: function() {
    const { userInput, workflowId } = this.data;
    
    if (!userInput) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isLoading: true,
      botResponse: ''
    });
    
    // Add user message to history
    const newHistory = [...this.data.responseHistory];
    newHistory.push({
      role: 'user',
      content: userInput
    });
    
    this.setData({
      responseHistory: newHistory
    });
    
    let streamedResponse = '';
    
    // Stream the workflow response
    cozeApi.streamWorkflow(
      workflowId,
      { message: userInput },
      (chunk) => {
        // Handle each chunk of data
        if (chunk && chunk.output && chunk.output.response) {
          const newContent = chunk.output.response;
          streamedResponse += newContent;
          
          this.setData({
            botResponse: streamedResponse
          });
        }
      },
      (error) => {
        // Handle error
        console.error('Streaming error:', error);
        wx.showToast({
          title: '流式调用失败: ' + (error.errMsg || '未知错误'),
          icon: 'none'
        });
      },
      () => {
        // Complete callback
        // Add bot response to history
        const updatedHistory = [...this.data.responseHistory];
        updatedHistory.push({
          role: 'assistant',
          content: streamedResponse
        });
        
        this.setData({
          responseHistory: updatedHistory,
          isLoading: false,
          userInput: '' // Clear input field
        });
      }
    );
  },

  // Clear chat history
  clearHistory: function() {
    this.setData({
      responseHistory: [],
      botResponse: ''
    });
  }
});

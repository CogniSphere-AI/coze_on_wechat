// style_processor.js
const cozeApi = require('../../services/cozeApi');
const tencentCloudService = require('../../services/tencentCloudService');

Page({
  data: {
    styleId: '',
    styleName: '',
    styleType: '', // 'photo', 'national', 'face'
    tempImagePath: '',
    hasUploaded: false,
    isProcessing: false,
    resultImageUrl: '',
    processingComplete: false,
    errorMessage: '',
    countdown: 40, // Countdown timer in seconds
    countdownInterval: null,
    workflowId: '', // Will be set based on style
  },

  onLoad: function(options) {
    // Get style information from the navigation parameters
    if (options.id && options.name && options.type) {
      this.setData({
        styleId: options.id,
        styleName: options.name,
        styleType: options.type
      });
      
      // Set the appropriate workflow ID based on style type
      this.setWorkflowId(options.type);
    } else {
      wx.showToast({
        title: '风格信息缺失',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // Set the workflow ID based on style type
  setWorkflowId: function(styleType) {
    // You would replace these with your actual workflow IDs from Coze
    let workflowId = '';
    
    switch(styleType) {
      case 'photo':
        workflowId = wx.getStorageSync('photo_workflow_id') || '';
        break;
      case 'national':
        workflowId = wx.getStorageSync('national_workflow_id') || '';
        break;
      case 'face':
        workflowId = wx.getStorageSync('face_workflow_id') || '';
        break;
      default:
        workflowId = '';
    }
    
    // If no workflow ID is set, use a default one
    if (!workflowId) {
      workflowId = wx.getStorageSync('default_workflow_id') || '';
    }
    
    this.setData({ workflowId });
  },

  // Handle choosing an image
  chooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        this.setData({
          tempImagePath: tempFilePath,
          hasUploaded: true,
          processingComplete: false,
          resultImageUrl: ''
        });
      }
    });
  },

  // Start the image processing
  startProcessing: function() {
    if (!this.data.hasUploaded) {
      wx.showToast({
        title: '请先上传图片',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.workflowId) {
      wx.showToast({
        title: '工作流ID未设置',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      isProcessing: true,
      errorMessage: ''
    });
    
    // Start countdown timer
    this.startCountdown();
    
    // Upload image to get a URL
    this.uploadImageToGetUrl(this.data.tempImagePath)
      .then(imageUrl => {
        // Call the Coze workflow with the image URL
        return this.callCozeWorkflow(imageUrl);
      })
      .catch(error => {
        this.setData({
          isProcessing: false,
          errorMessage: '处理图片时出错: ' + error.message
        });
        this.stopCountdown();
      });
  },
  
  // Upload image to Tencent Cloud and get the URL
  uploadImageToGetUrl: function(filePath) {
    return new Promise((resolve, reject) => {
      // Generate a unique filename based on timestamp
      const fileExtension = filePath.substring(filePath.lastIndexOf('.'));
      const fileName = `image_${Date.now()}${fileExtension}`;
      
      wx.showLoading({
        title: '上传中...',
      });
      
      // Upload the file to Tencent Cloud COS
      tencentCloudService.uploadFileToCOS(filePath, fileName)
        .then(fileUrl => {
          wx.hideLoading();
          console.log('Image uploaded successfully to Tencent Cloud:', fileUrl);
          resolve(fileUrl);
        })
        .catch(error => {
          wx.hideLoading();
          console.error('Failed to upload image to Tencent Cloud:', error);
          
          // For demo purposes, if upload fails, use the local path as a fallback
          // In a real app, you would handle this error properly
          wx.showToast({
            title: '上传失败，使用本地路径',
            icon: 'none'
          });
          resolve(filePath);
        });
    });
  },
  
  // Call the Coze workflow with the image URL
  callCozeWorkflow: function(imageUrl) {
    const { styleId, styleName, styleType, workflowId } = this.data;
    
    // Prepare the input for the workflow
    const workflowInput = {
      imageUrl: imageUrl,
      styleId: styleId,
      styleName: styleName,
      styleType: styleType
    };
    
    // Call the workflow
    cozeApi.callWorkflow(
      workflowId,
      workflowInput,
      (result) => {
        // Handle success
        console.log('Workflow result:', result);
        
        // Stop the countdown
        this.stopCountdown();
        
        if (result && result.output && result.output.resultImage) {
          // If the workflow returns a processed image
          this.setData({
            resultImageUrl: result.output.resultImage,
            processingComplete: true,
            isProcessing: false
          });
        } else {
          // If the workflow doesn't return an image
          this.setData({
            errorMessage: '无法获取处理后的图片',
            isProcessing: false
          });
        }
      },
      (error) => {
        // Handle error
        console.error('Workflow error:', error);
        
        // Stop the countdown
        this.stopCountdown();
        
        this.setData({
          errorMessage: '调用工作流失败: ' + (error.errMsg || '未知错误'),
          isProcessing: false
        });
      }
    );
  },
  
  // Start the countdown timer
  startCountdown: function() {
    this.setData({ countdown: 40 });
    
    // Clear any existing interval
    if (this.data.countdownInterval) {
      clearInterval(this.data.countdownInterval);
    }
    
    // Set up a new interval
    const countdownInterval = setInterval(() => {
      const newCountdown = this.data.countdown - 1;
      
      if (newCountdown <= 0) {
        this.stopCountdown();
        
        // Only show timeout message if still processing
        if (this.data.isProcessing) {
          this.setData({
            errorMessage: '处理超时，请重试',
            isProcessing: false
          });
        }
      } else {
        this.setData({ countdown: newCountdown });
      }
    }, 1000);
    
    this.setData({ countdownInterval });
  },
  
  // Stop the countdown timer
  stopCountdown: function() {
    if (this.data.countdownInterval) {
      clearInterval(this.data.countdownInterval);
      this.setData({ countdownInterval: null });
    }
  },
  
  // Save the result image to the album
  saveImage: function() {
    if (!this.data.resultImageUrl) {
      wx.showToast({
        title: '没有可保存的图片',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...',
    });
    
    // Download the image first if it's a URL
    if (this.data.resultImageUrl.startsWith('http')) {
      wx.downloadFile({
        url: this.data.resultImageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            this.saveImageToAlbum(res.tempFilePath);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '下载图片失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '下载图片失败',
            icon: 'none'
          });
        }
      });
    } else {
      // If it's already a local path
      this.saveImageToAlbum(this.data.resultImageUrl);
    }
  },
  
  // Save image to album
  saveImageToAlbum: function(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },
  
  // Navigate back to the previous page
  goBack: function() {
    wx.navigateBack();
  },
  
  onUnload: function() {
    // Make sure to clear the interval when leaving the page
    this.stopCountdown();
  }
});

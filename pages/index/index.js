// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    points: 24,  // Default points value
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  
  onLoad() {
    // Check if user info is stored
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
    
    // Save user info
    if (this.data.hasUserInfo) {
      wx.setStorageSync('userInfo', this.data.userInfo)
    }
  },
  
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
    
    // Save user info
    if (this.data.hasUserInfo) {
      wx.setStorageSync('userInfo', this.data.userInfo)
    }
  },
  
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', 
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        // Save user info
        wx.setStorageSync('userInfo', res.userInfo)
      }
    })
  },
  
  // Navigation functions for menu items
  navigateToBuyPoints() {
    wx.showToast({
      title: '购买积分功能即将上线',
      icon: 'none'
    })
  },
  
  navigateToEarnPoints() {
    wx.showToast({
      title: '赚取积分功能即将上线',
      icon: 'none'
    })
  },
  
  navigateToHistory() {
    wx.showToast({
      title: '历史创作功能即将上线',
      icon: 'none'
    })
  },
  
  navigateToMyId() {
    wx.showToast({
      title: '我的ID功能即将上线',
      icon: 'none'
    })
  },
  
  navigateToGroup() {
    wx.showToast({
      title: '加群功能即将上线',
      icon: 'none'
    })
  },
  
  navigateToOfficialAccount() {
    wx.showToast({
      title: '关注公众号功能即将上线',
      icon: 'none'
    })
  },
  
  navigateToCozeDemo() {
    wx.navigateTo({
      url: '../coze_demo/coze_demo'
    })
  }
})

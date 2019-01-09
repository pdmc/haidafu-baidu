// pages/my/my.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		title: '我的',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    authorized: false,
    canIUse: swan.canIUse('button.open-type.getUserInfo')

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		const _this = this;
		// 拼接请求url
		//console.log(options.actId);
		var userinfo = swan.getStorageSync('userinfo');
		if (!userinfo || userinfo.isLogin == undefined || !userinfo.isLogin) {
			var logcb = function () {
				var userinfo = swan.getStorageSync('userinfo');
				if (userinfo.mobile && userinfo.mobile.length > 0) {
					userinfo.mobile = userinfo.mobile.substr(0, 3) + '****' + userinfo.mobile.substr(7, 4);
				}
				_this.setData({
					authorized: true,
					userInfo: userinfo
				});
			};
			app.checkUserLogin(logcb);
		} else {
			if (userinfo.mobile && userinfo.mobile.length > 0){
				userinfo.mobile = userinfo.mobile.substr(0, 3) + '****' + userinfo.mobile.substr(7, 4);
			}
			this.setData({
				authorized: true,
				userInfo: userinfo
			});
		}

    // 查看是否授权
    /*
		swan.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          swan.getUserInfo({
            success: function (res) {
              //this.userInfo = res.userInfo
              console.log(res.userInfo)
              console.log("User has authorized before!!!")
              //用户已经授权过
              //this.authorized = true
              _this.setData({
								userInfo: res.userInfo,
								authorized: true,
              })
            },
            fail: function () {
              swan.showModal({
                title: '警告',
                content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
                success: function (res) {
                  if (res.confirm) {
                    swan.openSetting({
                      success: (res) => {
                        if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                          swan.getUserInfo({
                            success: function (res) {
                              var userInfo = res.userInfo;
                              that.setData({
                                nickName: userInfo.nickName,
                                avatarUrl: userInfo.avatarUrl,
                              })
                            }
                          })
                        }
                      }, 
											fail: function (res) {
                        console.log("swan.showModal failed")
                      }
                    })

                  }
                }
              })
            },
            complete: function (res) {
              console.log("swan.getUserInfo complete")
            }

          })
        }
      },
      fail: function () {
        console.log("swan.getSetting failed")
      }
    })
		*/

  },

  /**
   * 授权按钮回调函数
   */
	getUserInfo: function (e) {
		var _this = this;
		console.log(e);
		var userinfo = swan.getStorageSync('userinfo');
		if (!userinfo){
			app.globalData.userInfo = e.detail.userInfo;
			userinfo = e.detail.userInfo;
			swan.setStorage({
				key: "userinfo",
				data: e.detail.userInfo
			});
		} else if(userinfo.nickName == '百度网友' && e.detail.userInfo.nickName != '百度网友'){
			userinfo.nickName = e.detail.userInfo.nickName;
			userinfo.gender = e.detail.userInfo.gender;
			userinfo.avatarUrl = e.detail.userInfo.avatarUrl;
		}
		if (userinfo && userinfo.userId && userinfo.isLogin) {	// 数据不一致
			this.setData({
				authorized: true,
				userInfo: userinfo
			});
		} else {
			var logcb = function () {
				var userinfo = swan.getStorageSync('userinfo');
				_this.setData({
					authorized: true,
					userInfo: userinfo
				});
			};
			app.loginUser(logcb);
		}
	},
  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      console.log("user approves")
      //用户按了允许授权按钮
      this.authorized = true
    } else {
      console.log("user rejects")
      //用户按了拒绝按钮
    }
  },

	gotoFav: function () {
		swan.navigateTo({
			url: '/pages/myfavorite/myfavorite'
		})
	},
	gotoActivity: function () {
		swan.navigateTo({
			url: '/pages/myactivity/myactivity'
		})
	},
	gotoReserve: function () {
		swan.navigateTo({
			url: '/pages/myreservation/myreservation'
		})
	},
	gotoHongbao: function () {
		swan.navigateTo({
			url: '/pages/myhongbao/myhongbao'
		})
	},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
		swan.setNavigationBarTitle({
			title: this.data.title //"项目详情" //this.project.pName
		})

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
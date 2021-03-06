// pages/project/project.js
const app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    loading: true,
    project: {},
		layouts: [],
		favorite: {},
    imgUrls: [
      'http://image.pk4yo.com/tooopen_sy_143912755726.jpg',
      'http://image.pk4yo.com/tooopen_sy_175866434296.jpg',
      'http://image.pk4yo.com/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    addfav: false,
		showAgentWx: false,
		userId: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
		
		var userinfo = swan.getStorageSync('userinfo');
		if (!userinfo || userinfo.isLogin == undefined || !userinfo.isLogin) {
			var logcb = function () {
				var uinfo = swan.getStorageSync('userinfo');
				_this.setData({
					userId: uinfo.userId
				});
			};
			app.checkUserLogin(logcb);
		} else {
			this.setData({
				userId: userinfo.userId
			});
		}
		
    // 获取project详细信息
		const url = app.globalData.main_url + '/projects/getbyid?pId=' + options.pId;
    swan.request({
      url: url,
      data: {},
      header: {
        'content-type': 'json' // 默认值
      },
      success: function(res) {
        //console.log(res.data);
        // 赋值
				if (res.statusCode == 200 && res.data.data.length > 0) {
					var imgs = [];
					if (res.data.data[0].picture1) imgs.push(res.data.data[0].picture1);
					if (res.data.data[0].picture2) imgs.push(res.data.data[0].picture2);
					if (res.data.data[0].picture3) imgs.push(res.data.data[0].picture3);
					if (res.data.data[0].picture4) imgs.push(res.data.data[0].picture4);
					_this.setData({
						project: res.data.data[0],
						imgUrls: imgs,
						loading: false // 隐藏等待框
					});
					const key = 'myfavorites';
					var pid = res.data.data[0].pId;
					var favs = swan.getStorageSync(key) || [];
					var fi = util.array_find_obj(favs, "pid", pid);
					if (fi >= 0) {
						_this.setData({
							addfav: true
						});
					} else if (_this.data.userId && _this.data.userId > 0) {	// 存在即修正，虚无非真空
						// 拼接请求url
						const url = app.globalData.main_url + '/favorites/getbycond?pId=' + pid + '&userId=' + _this.data.userId;
						// 请求数据
						//var _res = res;
						swan.request({
							url: url,
							data: {},
							header: {
								'content-type': 'json' // 默认值
							},
							success: function (res) {
								if (res.statusCode == 200 && res.data.data.length > 0) {
									var favorite = { "fid": res.data.data[0].fId, "pid": res.data.data[0].pkproject__pId, "userid": _this.data.userId };
									var project = { "pid": res.data.data[0].pkproject__pId, "name": res.data.data[0].pkproject__pName, "lowsq": res.data.data[0].pkproject__minSquare, "highsq": res.data.data[0].pkproject__maxSquare, "lowprice": res.data.data[0].pkproject__minPrice, "highprice": res.data.data[0].pkproject__maxPrice, "country": res.data.data[0].countryId__area__name, "image": res.data.data[0].pkproject__thumbnail };
									favs.unshift({ "fid": res.data.data[0].fId, "pid": pid, "favorite": favorite, "project": project }); //res.data.data[0]);
									swan.setStorage({
										key: key,
										data: favs,
									}); 
									_this.setData({
										favorite: favorite,
										addfav: true
									});
								}
							}
						});
					}
				}
      },
      fail: function() {
        console.log('wx request failed !!!')
      }
    });

		// 获取project所有的layouts
		const url_layout = app.globalData.main_url + '/layouts/getbycond?pId=' + options.pId;
		swan.request({
			url: url_layout,
			data: {},
			header: {
				'content-type': 'json' // 默认值
			},
			success: function (res) {
				//console.log(res.data);
				// 赋值
				if (res.statusCode == 200 && res.data.data.length > 0) {
					_this.setData({
						layouts: res.data.data,
					});
				}
			},
			fail: function () {
				console.log('layouts request failed !!!')
			}
		});

  },

  favChange: function() {
		var added = this.data.addfav;

		if(this.data.userId == -1){
			swan.switchTab({
				url: '/pages/my/my',
			});
			return;
		}

		if(!added){
			const key = 'myfavorites';
			var pid = this.data.project.pId;
			var favs = swan.getStorageSync(key) || [];
			var fi = util.array_find_obj(favs, "pid", pid);
			if (fi == -1) {
				var favorite = { "fId": 0, "pId": pid, "userId": this.data.userId };
				var project = { "pid": pid, "name": this.data.project.pName, "lowsq": this.data.project.minSquare, "highsq": this.data.project.maxSquare, "lowprice": this.data.project.minPrice, "highprice": this.data.project.maxPrice, "country": this.data.project.area__countryId__name, "image": this.data.project.thumbnail };
				favs.unshift({ "pid": pid, "fid": 0, "favorite": favorite, "project": project });
				swan.setStorage({
					key: key,
					data: favs
				});
				/*
				const url = app.globalData.main_url + '/favorites/add?pId=' + _this.data.project.pId + '&userId=' + _this.data.userId;
				// 请求数据
				//var _res = res;
				swan.request({
					url: url,
					data: {},
					header: {
						'content-type': 'json' // 默认值
					},
					success: function (res) {
						if (res.statusCode == 200 && res.data.fId > 0) {
							favs.unshift({ "pid": pid, "project": this.data.project });
							swan.setStorage({
								key: key,
								data: favs,
							})
						}
					}
				});
			*/
			}
			this.setData({
				addfav: true
			});
		} else {
			this.setData({
				addfav: false
			});
			const key = 'myfavorites';
			var favs = swan.getStorageSync(key);
			if(favs.length == 0){
				console.log("Error: favorite storage incorrect!!!");
				return;
			}
			var pid = this.data.project.pId;
			var fi = util.array_find_obj(favs,"pid",pid);
			console.log(fi);
			favs.splice(fi,1);
			swan.setStorage({
				key: key,
				data: favs
			});
		}
  },

  gotoHongbao: function() {
    swan.navigateTo({
			url: "/pages/reserve/reserve?pId=" + this.data.project.pId + "&pName=" + this.data.project.pName + "&country=" + this.data.project.area__countryId__name + "&city=" + this.data.project.area__cityId__name+ "&lowsq=" + this.data.project.minSquare + "&highsq=" + this.data.project.maxSquare + "&lowprice=" + this.data.project.minPrice + "&highprice=" + this.data.project.maxPrice + "&image=" + this.data.project.thumbnail
    })
  },

	syncFav: function () {
		if (this.data.userId == -1) {
			console.log("project: fav unsync for unlogin user.");
			return;
		}
		var _this = this;
		var added = this.data.addfav;
		if (added) {
			const url = app.globalData.main_url + '/favorites/addifnotexist?pId=' + _this.data.project.pId + '&userId=' + _this.data.userId;
			// 请求数据
			//var _res = res;
			swan.request({
				url: url,
				data: {},
				header: {
					'content-type': 'json' // 默认值
				},
				success: function (res) {
					if (res.statusCode == 200 && res.data.fId > 0) {
						console.log("addifnotexist");
						const key = 'myfavorites';
						var pid = _this.data.project.pId;
						var favs = swan.getStorageSync(key) || [];
						var fi = util.array_find_obj(favs, "pid", pid);
						if (fi == -1) {
							var favorite = { "fId": res.data.fId, "pId": pid, "userId": _this.data.userId };
							var project = { "pid": pid, "name": _this.data.project.pName, "lowsq": _this.data.project.minSquare, "highsq": _this.data.project.maxSquare, "lowprice": _this.data.project.minPrice, "highprice": _this.data.project.maxPrice, "country": _this.data.project.area__countryId__name, "image": _this.data.project.thumbnail };
							favs.unshift({ "pid": pid, "fid": res.data.fId, "favorite": favorite, "project": project });
							swan.setStorage({
								key: key,
								data: favs
							});
						}else if (favs[fi].fid == 0) {
							console.log(favs[fi])
							favs[fi].fid = res.data.fId
							favs[fi].favorite.fid = res.data.fId
							swan.setStorage({
								key: key,
								data: favs
							});
						}  
					}
				}
			});
		} else {
			const key = 'myfavorites';
			var favs = swan.getStorageSync(key);
			var pid = this.data.project.pId;
			var fi = util.array_find_obj(favs, "pid", pid);	// not pid and fid???
			if (fi >= 0 && favs.length > 0){
				console.log(fi);
				favs.splice(fi, 1);
				swan.setStorage({
					key: key,
					data: favs
				});
			}

			const url = app.globalData.main_url + '/favorites/delete?fId=' + _this.data.favorite.fId;
			// 请求数据
			//var _res = res;
			swan.request({
				url: url,
				data: {},
				header: {
					'content-type': 'json' // 默认值
				},
				success: function (res) {
					if (res.statusCode == 200 && res.data.code == 0) {
						console.log("delete ok");
					}
				}
			});

		}
	},

  /**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function () {
		this.syncFav();
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		this.syncFav();
	},
	goHome: function () {
		swan.switchTab({
			url: "../index/index",
			fail: function (e) {
				console.log(e);
			}
		})
	},

	gotoProvider: function () {
		swan.navigateTo({
			url: '../provider/provider?spid=' + this.data.project.pkprovider__spId + '&name=' + this.data.project.pkprovider__spName + '&detail=' + this.data.project.pkprovider__description + '&image=' + this.data.project.pkprovider__imgurl,
		})
	},

	showAgent: function () {
		this.setData({
			showAgentWx: !this.data.showAgentWx
		});
	},

	contactAgent: function (e) {
		var phone = e.currentTarget.dataset.phone;
		//console.log(e);
		if (phone != undefined && phone) {
			swan.makePhoneCall({
				phoneNumber: phone,
			})
		}else{
			swan.showToast({
				title: '暂无联系电话',
				icon: 'none',
				duration: 1000,
				mask: false
			});
		}
	},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 修改导航栏标题
    swan.setNavigationBarTitle({
      title: this.data.title //"项目详情" //this.project.pName
    })
  }
})
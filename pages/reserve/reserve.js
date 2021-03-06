// pages/reserve/reserve.js
const app = getApp();
var util = require('../../utils/util.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: '预约看房',
		reserveDate: '2019-01-01',
		iHaveReserved: false,
		pId: -1,
		project: {},
		dateError: false,
		name: '',
		nameError: false,
		mobile: '',
		mobileError: false,
		verify: '',
		verifyError: false,
		verifytext: '发送验证码',
		veriId: -1,
		currentTime: 61,

		//isLogin: false,
		userInfo: {},
		hasUserInfo: false,
		canIUse: swan.canIUse('button.open-type.getUserInfo')
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var _this = this;
		var project = { "pid":options.pId, "name": options.pName, "country": options.country, "city": options.city, "lowsq": options.lowsq, "highsq": options.highsq, "lowprice": options.lowprice, "highprice": options.highprice, "image": options.image };
		// 拼接请求url
		//console.log(options.project.pName);
		this.setData({
			pId: options.pId,
			project: project
		});

		var userinfo = swan.getStorageSync('userinfo');
		if (!userinfo || userinfo.isLogin == undefined || !userinfo.isLogin) {
			var logcb = function () {
				var userinfo = swan.getStorageSync('userinfo');
				_this.setData({
					userInfo: userinfo,
					hasUserInfo: true
				});
			};
			app.checkUserLogin(logcb);
		} else {
			this.setData({
				userInfo: userinfo,
				hasUserInfo: true
			});
		}
		// check reservation db
		var url = app.globalData.main_url + '/reservations/getbycond?pId=' + options.pId + '&userId=' + this.data.userInfo.userId;
		// 请求数据
		swan.request({
			url: url,
			data: {},
			header: {
				'content-type': 'json' // 默认值
			},
			success: function (res) {
				//console.log(res.data);
				if(res.statusCode == 200 && res.data.data.length > 0){
					var rid = res.data.data[0] ? res.data.data[0].rId:0;
					_this.setData({
						iHaveReserved: true
					});
					/*
					*	更新reservation缓存
					*/
					const key = 'myreservations';
					var myreservations = swan.getStorageSync(key) || [];
					var fi = util.array_find_obj(myreservations, "rid", rid);
					var reservation = { "rid": res.data.data[0].rId, "pid": res.data.data[0].pkproject__pId, "userid": userinfo.userId, "applytime": res.data.data[0].applyTime, "status": res.data.data[0].status, "name": res.data.data[0].trueName, "mobile": res.data.data[0].phone };
					if (fi < 0) {
						myreservations.unshift({ "rid": rid, "userid": _this.data.userInfo.userId, "reservation": reservation, "project": project });
						swan.setStorage({
							key: key,
							data: myreservations
						});
					} 
				}
			},
			fail: function () {
				console.log('reservation: wx request failed !!!')
			}
		});
		// check hongbao db
		url = app.globalData.main_url + '/hongbaos/getbycond?pId=' + options.pId + '&userId=' + this.data.userInfo.userId;
		// 请求数据
		swan.request({
			url: url,
			data: {},
			header: {
				'content-type': 'json' // 默认值
			},
			success: function (res) {
				//console.log(res.data);
				if (res.statusCode == 200 && res.data.data.length > 0) {
					var hbid = res.data.data[0] ? res.data.data[0].hbId : 0;
					/*
					*	更新hongbao缓存
					*/
					const key = 'myhongbaos';
					var myhongbaos = swan.getStorageSync(key) || [];
					var fi = util.array_find_obj(myhongbaos, "hbid", hbid);
					if (fi < 0) {
						myhongbaos.unshift({ "hbid": hbid, "userid": _this.data.userInfo.userId, "hongbao": res.data.data[0], "project": project });
						swan.setStorage({
							key: key,
							data: myhongbaos
						});
					}
				}
			},
			fail: function () {
				console.log('reservation: wx request failed !!!')
			}
		});
	},

	nameInput: function (e) {
		var name = e.detail.value;
		let reg = new RegExp('/^[\u4E00-\u9FA5 A-Za-z]+$/');
		if (reg.test(name)) {
			console.log("姓名格式正确");
		}
		if (name.length > 1 && name.length < 50) {
			this.setData({
				nameError: false
			});
		} else {
			this.setData({
				nameError: true
			});
		}
		this.setData({
			name: name
		});
	},
	mobileInput: function (e) {
		var mobile = e.detail.value;
		if (util.checkMobile(mobile)){
			this.setData({
				mobileError: false
			});
		} else {
			this.setData({
				mobileError: true
			});
		}
		this.setData({
			mobile: mobile
		});
	},
	verifyInput: function (e) {
		var verify = e.detail.value;
		if (verify.length == 6) {
			this.setData({
				verifyError: true
			});
		} else {
			this.setData({
				verifyError: false
			});
		}
		this.setData({
			verify: verify
		});
	},
	
	sendVerify1: function () {
		swan.showToast({
			title: '暂时不需要短信验证码！',
			icon: 'success',
			duration: 1000,
			mask: false
		})
	},

	dateChange: function (e) {
		console.log('picker发送选择改变，携带值为', e.detail.value)
		this.setData({
			reserveDate: e.detail.value
		})
	},


	sendVerify: function () {
		var _this = this;
		/*
		_this.setData({
			disabled: true,
			color: '#ccc',
		});
		*/
		console.log('Enter sendVerify()');
		var mobile = this.data.mobile;
		var currentTime = _this.data.currentTime //把手机号跟倒计时值变例成js值

		if (!util.checkMobile(mobile)) {
			this.setData({
				mobileError: true,
				showerror: 'showerror'
			});
			return;
		} else {
			var url = app.globalData.main_url + '/verify/sendverify?mobile=' + mobile;
			swan.request({
				url: url,
				data: {},
				header: {
					'content-type': 'json' // 默认值
				},
				success: function (res) {
					//console.log(res.data);
					if (res.statusCode == 200 && res.data.veriId > 0) {
						_this.setData({
							showerror: '',
							veriId: res.data.veriId
						});
					}
				}
			});

			//设置一分钟的倒计时
			var interval = setInterval(function () {
				currentTime--; //每执行一次让倒计时秒数减一
				_this.setData({
					verifytext: currentTime + 's', //按钮文字变成倒计时对应秒数
				})
				if (currentTime <= 0) {
					clearInterval(interval);
					_this.setData({
						verifytext: '发送验证码',
						currentTime: 61
					})
				}
			}, 1000);

		}

	},

	checkVerify: function (verify) {
		var _this = this;
		var veriId = this.data.veriId;
		var code = parseInt(verify);
		var url = app.globalData.main_url + '/verify/verify?veriId=' + veriId + '&code=' + code;
		swan.request({
			url: url,
			data: {},
			header: {
				'content-type': 'json' // 默认值
			},
			success: function (res) {
				//console.log(res.data);
				if (res.statusCode == 200) {
					if (res.data.pass) {
						_this.setData({
							verifyError: false,
							verify: verify
						});
					} else {
						_this.setData({
							verifyError: true
						});
					}
				}
			}
		});
	},

	submit: function(){
		var _this = this;
		if(this.data.name == ''){
			this.setData({
				nameError: true
			});
		}
		if (this.data.mobile == '') {
			this.setData({
				mobileError: true
			});
		} 
		if (this.data.name == '') {
			this.setData({
				verifyError: true
			});
		}
		if (!this.data.nameError && !this.data.mobileError && !this.data.verifyError) {
			var userinfo = swan.getStorageSync('userinfo');

			if (!userinfo || userinfo.userId == undefined) {
				swan.showToast({
					title: '用户未登录！',
					icon: 'none',
					duration: 1500,
					mask: false
				});
				return;
			}
			const url = app.globalData.main_url + '/reservations/addwithhbifnotexist?pId=' + this.data.pId + '&userId=' + userinfo.userId + '&trueName=' + this.data.name + '&phone=' + this.data.mobile + '&verify=' + this.data.verify + '&applyTime=' + this.data.reserveDate + '&source=1&amount=10000';
			// 请求数据
			swan.request({
				url: url,
				data: {},
				header: {
					'content-type': 'json' // 默认值
				},
				success: function (res) {
					//console.log(res.data);
					/*
					 *	更新reservation缓存
					 */
					if (res.statusCode == 200 && res.data.code == 0) {
						var rid = res.data.rId;
						var hbid = res.data.hbId;
						const key1 = "myreservations";
						var reservations = swan.getStorageSync(key1) || [];
						var fi = util.array_find_obj(reservations, "rid", rid);
						if (fi < 0) {
							var applytime = _this.data.reserveDate;
							if (applytime.length > 16 && applytime.indexOf('T') > 0) {
								applytime = applytime.substr(0, 10) + ' ' + applytime.substr(11, 5);
							}
							var reservation = { "rid": rid, "userid": userinfo.userId, "pid": _this.data.pId, "applytime": applytime, "name": _this.data.trueName, "mobile": _this.data.phone };
							reservations.unshift({ "rid": rid, "userid": _this.data.userInfo.userId, "reservation": reservation, "project": _this.data.project });
							swan.setStorage({
								key: key1,
								data: reservations
							});
						}
						/*
						*	更新hongbao缓存
						*/
						const key2 = 'myhongbaos';
						var myhongbaos = swan.getStorageSync(key2) || [];
						var fi = util.array_find_obj(myhongbaos, "hbid", hbid);
						if (fi < 0) {
							var hongbao = { "hbid": hbid, "userid": userinfo.userId, "pid": _this.data.pId, "amount": 10000, "source": 1 };
							myhongbaos.unshift({ "hbid": hbid, "userid": _this.data.userInfo.userId, "hongbao": hongbao, "project": _this.data.project});
							swan.setStorage({
								key: key2,
								data: myhongbaos
							});
						} 

						swan.navigateTo({
							url: "/pages/reserveok/reserveok"
						})
					}
				}
			});	/* swan.request */
		} /* if */
	},

	getUserInfo: function (e) {
		console.log(e);
		var _this = this;
		this.setData({
			hasUserInfo: true
		});
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
				hasUserInfo: true
			});
		} else {
			var logcb = function(){
				var userinfo = swan.getStorageSync('userinfo');
				_this.setData({
					userInfo: userinfo,
					hasUserInfo: true
				});
			};
			app.loginUser(logcb);
		}
	},

	goHome: function () {
		swan.switchTab({
			url: "../index/index",
			fail: function (e) {
				console.log(e);
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		swan.setNavigationBarTitle({
			title: this.data.title //"项目详情" //this.project.pName
		})

	}
})
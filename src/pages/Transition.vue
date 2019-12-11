<template>
	<view>
		<button v-if="!hasAuth" class="btn" open-type="getUserInfo" @getuserinfo="getUserInfo">授权获取头像昵称</button>
		<!--		<button class="btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权获取手机号</button>-->
	</view>
</template>

<script lang="ts">
	import { Component, Vue } from 'vue-property-decorator'
	import { apiLogin, apiAuthorizationInfo } from '@/service/api'
	import { uRelaunch, uSwitchTab } from '@/utils/navigateAction'

	@Component
	export default class Transition extends Vue {
		type: string = ''
		uri: string = ''
		loginInfo: any = {}
		hasAuth: boolean = true

		async onLoad (options: any) {
			// uni.showLoading()
			if (!this.$store.state.user.token) {
				const wxLogin: any = await uni.login()
				const res = wxLogin[1]
				if (res.code) {
					const apiResult = await apiLogin(res.code)
					this.loginInfo = apiResult.data.data || {}
				}
				this.$store.commit('user/UPDATE_USER', this.loginInfo)
				uni.setStorageSync('openId', this.loginInfo.openId)
				uni.setStorageSync('token', this.loginInfo.token)
				uni.setStorageSync('tokenTs', +new Date())
				uni.setStorageSync('userInfo', this.$store.state.user)
			}

			uni.getSetting({
				success: (res) => {
					if (res.authSetting['scope.userInfo']) {
						this.hasAuth = true
						this.type = options.type
						this.uri = options.uri
						this.navigateAction(this.type, this.uri)
					} else {
						this.hasAuth = false
					}
				},
				fail: (res) => {
					console.log(res)
				}
			})

		}

		/**
		 * 跳转
		 * @param type '0'：navigateTo, '1': switchTab
		 * @param uri
		 */
		navigateAction (type: string | number, uri: string) {
			switch (type) {
				case '0':
					uRelaunch(uri)
					break
				case '1':
					uSwitchTab(uri)
					break
				default:
					uSwitchTab('/pages/preview/index')
			}
		}

		// getPhoneNumber (e: any) {
		// 	console.log('res',e)
		// }

		getUserInfo () {
			uni.getUserInfo({
				success: (res:any) => {
					this.saveInfo(res.userInfo)
					let data = {
						avatarUrl: res.userInfo.avatarUrl,
						city: res.userInfo.city,
						country: res.userInfo.country,
						gender: res.userInfo.gender,
						language: res.userInfo.language,
						nickName: res.userInfo.nickName,
						province: res.userInfo.province
					}
					apiAuthorizationInfo(data).then(() => {
						console.log('保存成功')
					})
				},
				fail: (res) => {
					console.log('获取用户信息失败', res)
				}
			})
		}

		async saveInfo (userInfo: any) {
			this.loginInfo = this.$store.state.user
			let allInfo = Object.assign(this.loginInfo, userInfo)
			this.$store.commit('user/UPDATE_USER', allInfo)
			uni.setStorageSync('userInfo', this.$store.state.user)
			this.navigateAction(this.type, this.uri)
		}

	}
</script>

<style lang="less" scoped>
	.btn {
		margin-top: 200px;
	}
</style>

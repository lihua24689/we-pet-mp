<template>
	<view class="release-wrap">
		<nav-bar :config="navConfig">
			<text class="nav-cancel" slot="left" @click="handleCancel">取消</text>
		</nav-bar>

		<view class="content">
			<view class="header info">
				<view class="title">说说宠物情况以及领养要求</view>
				<textarea name="" id="" placeholder="输入宠物信息" v-model="releasePetInfo.petAdoptionRequirements" class="pet-info" placeholder-class="placeholder"></textarea>
				<img-upload :limit="6" :multipleJudge="true" @imgUpload="imgUpload($event,'petImages')"></img-upload>
			</view>
			<view class="contact-info info">
				<view class="title">联系信息</view>
				<view class="line">
					<label for="phone">手机号</label>
					<input id="phone" v-model="releasePetInfo.petContactsPhone" placeholder-class="placeholder" maxlength="11" placeholder="输入手机号" type="number">
				</view>
				<view class="line">
					<label for="weChat">微信号</label>
					<input id="weChat" v-model="releasePetInfo.petContactsWx" placeholder-class="placeholder" maxlength="11" placeholder="输入微信号" type="text">
				</view>
				<view class="line no-border">
					<label for="weChatImg">微信号二维码</label>
					<input id="weChatImg" type="text">
				</view>
			</view>
			<view class="more-info info">
				<view class="title">更多信息</view>
				<view class="line">
					<label>宠物昵称</label>
					<input v-model="releasePetInfo.petNikeName" placeholder-class="placeholder" maxlength="11" placeholder="输入宠物昵称" type="text">
				</view>
				<view class="line">
					<label>所在城市</label>
					<pet-picker @changePicker="changePicker($event,'area')" :option="areaPickerConfig" class="picker"></pet-picker>
				</view>
				<view class="line">
					<label>品种</label>
					<span @click="showAssortment = true">{{releasePetInfo.petAssortment || '请选择品种'}}</span>
				</view>
				<view class="line">
					<label>年龄</label>
					<picker @change="bindAgeChange" :value="petAgeIndex" :range="petAgeList">
						<view class="uni-input">{{petAgeList[petAgeIndex]}}</view>
					</picker>
				</view>
				<view class="line">
					<label>收养类型</label>
					<picker @change="bindSourceChange" :value="petSourceIndex" :range="petSourceList">
						<view class="uni-input">{{petSourceList[petSourceIndex]}}</view>
					</picker>
				</view>
				<view class="line">
					<label>性别</label>
					<radio-group @change="radioChange($event, 'petSex')">
						<radio :value="0" checked>MM</radio>
						<radio :value="1">GG</radio>
					</radio-group>
				</view>
				<view class="line">
					<label>绝育</label>
					<radio-group @change="radioChange($event, 'petIsSterilization')">
						<radio :value="1" checked>是</radio>
						<radio :value="0">否</radio>
						<radio :value="2">未知</radio>
					</radio-group>
				</view>
				<view class="line">
					<label>驱虫</label>
					<radio-group @change="radioChange($event, 'petInsectRepellent')">
						<radio :value="1" checked>是</radio>
						<radio :value="0">否</radio>
						<radio :value="2">未知</radio>
					</radio-group>
				</view>
				<view class="line">
					<label>疫苗</label>
					<radio-group @change="radioChange($event, 'petIsVaccine')">
						<radio :value="1" checked>是</radio>
						<radio :value="0">否</radio>
						<radio :value="2">未知</radio>
					</radio-group>
				</view>
				<view class="line">
					<label>领养费用</label>
					<radio-group @change="radioChange($event, 'petCostAdoption')">
						<radio :value="1">免费</radio>
						<radio :value="2" checked>押金</radio>
						<radio :value="3">有偿</radio>
					</radio-group>
				</view>
				<view class="line" v-if="releasePetInfo.petCostAdoption === 2 || releasePetInfo.petCostAdoption === 3">
					<label>{{releasePetInfo.petCostAdoption === 2 ? '押金金额(元)' : '有偿金额(元)'}}</label>
					<input v-model="releasePetInfo.petDepositAmount" placeholder-class="placeholder" placeholder="输入金额" type="digit">
				</view>
			</view>
		</view>

		<button :disabled="canSubmit" class="submit btn" @click="submit">确认发布领养信息</button>

		<view class="picker-view-wrap" v-if="showAssortment">
			<view class="picker-view-inner">
				<view class="u-flex-b-c">
					<view class="picker-view-btn" @click="showAssortment = false">取消</view>
					<view class="picker-view-btn" @click="handlePickerView">确定</view>
				</view>
				<picker-view class="picker-view" :indicator-style="indicatorStyle" :value="assortment" @change="bindAssortmentChange">
					<picker-view-column>
						<view class="item" v-for="(item,index) in dicList" :key="index">{{item.dicDesc}}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="item" v-for="(item,index) in childDicList" :key="index">{{item.dicDesc}}</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import { Component, Vue } from 'vue-property-decorator'
	import { NavBarOptions } from '@/interfaces/navBar'
	import ImgUpload from '@components/ImgUpload.vue'
	import PetPicker from '@components/PetPicker.vue'
	import { PickerOptions } from '@/interfaces/petPicker'
	import { apiPetRelease, apiPetAssortment, apiChildPetAssortment } from '@/service/api'
	import { uSwitchTab } from '@/utils/navigateAction'
	import { petAge, petSource } from '@/utils/const'

	@Component({
		components: { ImgUpload, PetPicker }
	})
	export default class Index extends Vue {
		navConfig: NavBarOptions = {
			color: '#ffffff',
			backgroundColor: '#EC6863',
			title: '发布领养信息',
			back: false
		}
		dicObj: any = {}
		dicList: any[] = []
		dic: string = ''
		childDicList: any[] = []
		childDic: string = ''
		assortment: any[] = [0, 0]
		indicatorStyle: string = ''
		showAssortment: boolean = false
		canSubmit: boolean = false // 是否可提交
		releasePetInfo: any = {
			petAdoptionRequirements: '', // 收养要求
			petContactsName: '', // 联系人名字
			petContactsPhone: '', // 联系人电话
			petContactsWx: '', // 联系人微信号
			petContactsWxQccodeUrl: '', // 联系人微信二维码
			petNikeName: '', // name
			petAge: '', // age
			petAssortment: '', // 品种
			petSource: '', // 收养类型
			petProvince: '', // 所在地-省
			petCity: '', // 所在地-市
			petDistrict: '', // 所在地-区
			petSex: 0, // 性别
			petImages: [], // 宠物图片列表
			petIsSterilization: 1, // 绝育
			petInsectRepellent: 1, // 驱虫
			petIsVaccine: 1, // 疫苗
			petCostAdoption: 2,
			petDepositAmount: '' // 押金
		}
		// 可选地区参数
		areaPickerConfig: PickerOptions = {
			mode: 'region',
			region: ['全国', '', '']
		}
		petAgeList = petAge
		petAgeIndex: number = 0
		petSourceList = petSource
		petSourceIndex = 0

		onShow () {
			this.getPetAssortment()
			this.indicatorStyle = `height: ${ Math.round(<any>uni.getSystemInfoSync().screenWidth / (750 / 100)) }px;`
			this.releasePetInfo.petAge = this.petAgeList[0]
			this.releasePetInfo.petSource = this.petSourceList[0]
		}

		/**
		 * 单选
		 * @param $event
		 * @param name
		 */
		radioChange ($event: any, name: string) {
			this.releasePetInfo[name] = +$event.detail.value
		};

		/**
		 * picker 选择
		 * @param $event
		 * @param name
		 */
		changePicker ($event: any, name: string) {
			switch (name) {
				case 'area':
					[this.releasePetInfo.petProvince, this.releasePetInfo.petCity, this.releasePetInfo.petDistrict] = $event
					break
				default:
					break
			}

		};

		async submit () {
			await apiPetRelease(this.releasePetInfo)
			uni.showToast({ title: '发布成功' })
			uSwitchTab('/pages/preview/index')
		}

		imgUpload ($event: any, name: string) {
			if (name === 'petImages') this.releasePetInfo[name] = $event
		}

		/**
		 * 取消发布
		 */
		handleCancel () {
			uSwitchTab('/pages/preview/index')
		}

		bindAgeChange (e: any) {
			this.petAgeIndex = e.target.value
			this.releasePetInfo.petAge = this.petAgeList[this.petAgeIndex]
		}

		bindSourceChange (e: any) {
			this.petSourceIndex = e.target.value
			this.releasePetInfo.petSource = this.petSourceList[this.petSourceIndex]
		}

		bindAssortmentChange (e: any) {
			let assortment = e.detail.value
			this.assortment = e.detail.value
			this.dic = this.dicList[assortment[0]].dicCode
			this.childDicList = this.dicObj[this.dic]
			this.childDic = this.childDicList[assortment[1]].dicCode
		}

		getPetAssortment () {
			apiPetAssortment().then(res => {
				this.dicList = [...this.dicList, ...res]
				this.dic = this.dicList[0].dicCode
				for (let i = 0; i < this.dicList.length; i++) {
					apiChildPetAssortment(this.dicList[i].dicCode).then(res => {
						if (i === 0) {
							this.childDicList = [...this.childDicList, ...res]
							this.childDic = this.childDicList[0].dicCode
						}
						this.dicObj[this.dicList[i].dicCode] = res
					})
				}
			})
		}

		handlePickerView () {
			this.showAssortment = false
			this.releasePetInfo.petAssortment = this.childDicList[Number(this.assortment[1])].dicDesc
		}
	}
</script>

<style lang="less" scoped>
	.release-wrap {
		font-size: 24px;
		background-color: #f6f6f6;
		color: #000;
		.nav-cancel {
			padding-left: 16px;
			color: #E0DEE3;
			font-size: 32px;
		}
		.content {
			padding: 0 32px 120px;
		}
		.info {
			> textarea {
				width: 100%;
				min-height: 70px;
			}
			.title {
				color: #000;
				font-weight: bold;
				font-size: 32px;
				margin: 40px 0;
			}
			.line {
				.flex-box-align-justify(space-between, center);
				font-size: 24px;
				border-bottom: 2px solid rgba(220, 220, 220, 0.3);
				height: 70px;
				&.no-border {
					border: none
				}
				> label {
					color: #001;
				}
				> input {
					text-align: right;
				}
				radio {
					/*transform:scale(0.7);*/
					width: 120px;
				}
			}
		}

		.submit {
			width: 100%;
			height: 110px;
			line-height: 110px;
			position: fixed;
			bottom: 0;
			border: none !important;
			text-align: center;
			vertical-align: center;
			color: #ffffff;
			font-size: 32px;
			background-color: #EC5C56;
			clear: both;
			z-index: 9;
		}

		.picker-view-wrap {
			position: fixed;
			z-index: 10000;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			background: rgba(0, 0, 0, 0.4);
			height: 100vh;
			width: 100vw;
			.picker-view-inner {
				position: absolute;
				left: 0;
				right: 0;
				bottom: 0;
				width: 100%;
				height: 40%;
				background-color: rgba(255, 255, 255, 1);

				.picker-view {
					height: 70%;
				}

				.item {
					text-align: center;
					width: 100%;
					height: 100px;
					line-height: 100px;
					text-overflow: ellipsis;
					white-space: nowrap;
					font-size: 20px;
				}

				.picker-view-btn {
					padding: 20px 40px;
				}
			}
		}

	}
</style>

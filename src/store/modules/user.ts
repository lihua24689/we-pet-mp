import { GetterTree, Module, MutationTree } from 'vuex';
import { User } from '../types';
import { apiLogin } from '@/service/api';

declare const uni: any;

const cacheUserInfo: User = uni.getStorageSync('userInfo') || {};
const userInfo: User = {
	nickName: 'we-pet', // 昵称
	phone: '', // 手机号
	avatarUrl: '../../static/logo.png', // 头像
	gender: 'man', // 性别
	session: uni.getStorageSync('session') || '', // 临时凭证
	token: '', // 登录token
	openId: uni.getStorageSync('openId') || '', // openId
	...cacheUserInfo
};

const namespaced: boolean = true;
const state: User = { ...userInfo };
const getters: GetterTree<User, any> = {
	user(state): User {
		return state;
	}
};
const mutations: MutationTree<User> = {
	/**
	 * 更新登录用户信息
	 * @param state
	 * @param payLoad
	 * @constructor
	 */
	UPDATE_USER(state, payLoad: User) {
		Object.assign(state, payLoad);
		uni.setStorageSync('userInfo', state);
	},

	/**
	 * 清除登录信息
	 * @param {*} state
	 */
	CLEAR_USER(state) {
		Object.keys(userInfo).forEach(item => {
			// @ts-ignore
			state[item] = userInfo[item] || '';
		});
	},

	/**
	 * 登录
	 */
	USER_LOGIN(state) {
		uni.login({
			success: async (res: any) => {
				if (!res.code) return;
				const result = await apiLogin(res.code);
			}
		});
	}

};

const user: Module<User, any> = {
	namespaced,
	state,
	getters,
	mutations
};

export default user;

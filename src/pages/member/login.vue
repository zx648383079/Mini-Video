<template>
    <div>
        <Navbar :title="title"/>
        <div style="margin-top: {{ top }}px;">
            <div class="login-type-box" v-if="mode < 1">
                <div class="logo">
                    <img :src="site.logo" mode="widthFix">
                </div>

                <button class="auth-btn" open-type="getUserInfo" lang="zh_CN" bindgetuserinfo="tapAuth">
                    <i class="iconfont icon-wechat"></i> 微信登录</button>
                <span @click="tapMode" data-mode="3" class="btn btn-none">邮箱登录</span>
                <span @click="tapMode" data-mode="5">邮箱注册</span>
            </div>
            <div class="login-box" v-if="mode > 0 && mode < 4">
                <div class="logo">
                    <img :src="site.logo" mode="widthFix">
                </div>
                <EmailLogin v-if="mode == 3" bind:click="tapChangeMode" bind:back="tapLoginBack"/>
            </div>
            <div class="register-box" v-if="mode >= 4">
                <div class="logo">
                    <img :src="site.logo" mode="widthFix">
                </div>
                <EmailRegister v-if="mode == 5" bind:click="tapChangeMode" bind:back="tapLoginBack"/>
                <EmailFind v-if="mode == 6" bind:click="tapChangeMode"/>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { WxJson, WxPage, TouchEvent } from '../../../typings/wx/lib.vue';
import { ISite } from '../../api/model';
const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    title: string;
    mode: number;
    site: ISite | null;
}
@WxJson({
    usingComponents: {
        "EmailLogin": "/pages/member/Child/EmailLogin",
        "EmailRegister": "/pages/member/Child/EmailRegister",
        "EmailFind": "/pages/member/Child/EmailFind",
    },
    navigationBarTitleText: "登录",
    navigationBarBackgroundColor: "#05a6b1",
    navigationBarTextStyle: "white"
})
export class Index extends WxPage<IPageData> {

    public data: IPageData = {
        top: app.getNavbarHeight(),
        mode: 0,
        title: '登录',
        site: null
    };

    onLoad() {
        app.getSite().then(res => {
            this.setData({
                site: res
            });
        });
    }

    tapMode(e: TouchEvent) {
        this.tapChange(e.currentTarget.dataset.mode as number);
    }

    tapChangeMode(e: any) {
        this.tapChange(e.detail);
    }

    public tapChange(mode: number) {
        const titles = [
            '登录',
            '手机号登录',
            '短信验证码登录',
            '邮箱登录',
            '手机注册',
            '邮箱注册',
            '找回密码'
        ];
        const title = mode >= 0 && mode < titles.length ? titles[mode] : titles[0];
        wx.setNavigationBarTitle({
            title,
        });
        this.setData({mode, title});
    }

    public tapLoginBack() {
        wx.redirectTo({
            url: '/pages/index/index',
            success: function () { 
                let page = getCurrentPages().pop(); 
                if (!page) {
                    return; 
                }
                page.onLoad(); 
            }
        });
    }

    public authLogin(code: string, nickname: string, avatar: string, gender: number) {
        app.authloginUser({code, nickname, avatar, gender}).then(res => {
            if (res) {
                this.tapLoginBack();
            }
        });
    }

    /**
     * tapAuth
     */
    public tapAuth(e: any) {
        let code: string| null = null,
            userInfo: WechatMiniprogram.UserInfo | null = e.detail.userInfo,
            that = this;
        wx.login({
            success(res) {
                code = res.code;
                userInfo && that.authLogin(code, userInfo.nickName, userInfo.avatarUrl, userInfo.gender);
            }
        })
        // 获取用户信息
        // wx.getSetting({
        //     success: (res) => {
        //         if (res.authSetting['scope.userInfo']) {
        //             // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        //             wx.getUserInfo({
        //                 success: res => {
        //                     userInfo = res.userInfo;
        //                    code && that.authLogin(code, userInfo.nickName, userInfo.avatarUrl, userInfo.gender);
        //                 }
        //             });
        //         }
        //     }
        // })
    }
}
</script>
<style lang="scss" scoped>
.login-oauth-box {
    button {
        display: inline-block;
        background-color: transparent;
        border: 0;
        width: 3rem;
        line-height: 3rem;
        height: 3rem;
        color: #333;
        border: none;
        margin:0;
        padding: 0;
        &:hover {
            background-color: transparent;
        }
    }
    .fa {
        font-size: 2rem;
    }
}
.right {
    float: right;
}
navigator {
    display: inline-block;
}
.auth-btn {
    display: block;
    margin: 0 0 10px;
    line-height: 40px;
    height: 40px;
    background-color: #b4282d;
    color: #fff;

}
</style>

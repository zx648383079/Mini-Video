<template>
    <div>
        <div class="top-bar" style="height: {{ top }}px;">

        </div>
        <div class="user-header">
            <div class="avatar">
                <img :src="user ? user.avatar : '/images/avatar.png'">
            </div>
            <div class="name">
                欢迎您，
                <a v-if="user" href="profile">{{ user.name }}</a>
                <a v-else href="login">请登录</a>
                ~
            </div>
        </div>

        <div class="menu-list">
            <MenuItem title="签到" icon="icon-et-checking-in" uri="/pages/checkin/index" v-if="user"/>
            <MenuItem title="浏览历史" icon="icon-history" uri="/pages/video/history"/>
            <MenuItem title="帮助" icon="icon-help" uri="/pages/help/index"/>
            <MenuItem title="反馈" icon="icon-comment" uri="/pages/feedback/index"/>
        </div>
        <TabBar selected="2"/>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { IUser } from '../../api/model';
import { WxPage, WxJson } from '../../../typings/wx/lib.vue';

const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    user: IUser | null,
}
@WxJson({
    usingComponents: {
        MenuItem: "/components/MenuItem/index"
    },
    navigationBarTitleText: "",
    navigationBarBackgroundColor: "#05a6b1",
    navigationBarTextStyle: "white"
})
export class Index extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(),
        user: null,
    };

    onLoad() {
        
    }

    public onShow() {
        app.getUser().then(res => {
            this.setData({
                user: res
            });
        }).catch(_ => {
            app.setToken();
        });
    }

    public tapScan() {
        wx.scanCode({
            scanType: ['qrCode'],
            onlyFromCamera: true,
            success(res) {
                wx.navigateTo({
                    url: '/pages/authorize/index?token=' + encodeURIComponent(res.result)
                });
            }
        });
    }
}
</script>
<style lang="scss" scoped>
@import '../../theme';
page {
    background-color: $bg;
}
.user-header {
    position: relative;
    padding-top: 1.5625rem;
    padding-bottom: 1.875rem;
    background: $edit;
    color: $editText;
    .avatar {
        width: 5.625rem;
        height: 5.625rem;
        margin: 0 auto;
        text-align: center;
        line-height: 0;
        position: relative;

        image {
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }

        &::after {
            content: "";
            width: 6.25rem;
            height: 6.25rem;
            border: 0.125rem solid #99e3ff;
            border-radius: 100%;
            position: absolute;
            left: -0.4125rem;
            top: -0.4125rem;
            z-index: 0;
        }
    }

    .name {
        text-align: center;
        padding-top: 0.625rem;
        color: #fff;
        navigator {
            display: inline;
        }
    }
}
.menu-list {
    background: #fff;
}
</style>

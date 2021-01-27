<template>
    <div>
         <Navbar title="登录设备管理"/>
        <div class="main-box" style="margin-top: {{ top }}px;">
            <div class="tip">
                最新登录设备：点击可以查看登录时间
            </div>
            <div class="item" v-for="(item, index) in items" :key="index">
                <div class="name">{{ item.name }}</div>
                <div class="time">{{ item.created_at }}</div>
                <i class="iconfont icon-chevron-right" aria-hidden="true"></i>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { WxPage, WxJson } from "../../../typings/wx/lib.vue";
import { getDriver } from "../../api/account";
import { IDriver } from "../../api/model";
import { IMyApp } from "../../app.vue";


interface IPageData {
    top: number;
    items: IDriver[],
}

const app = getApp<IMyApp>();

@WxJson({
    navigationBarTitleText: "登录设备管理",
    navigationBarBackgroundColor: "#05a6b1",
    navigationBarTextStyle: "white"
})
export default class Driver extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(),
        items: [],
    }

    onLoad() {
        getDriver().then(res => {
            this.setData({
                items: res.data
            });
        });
    }
}
</script>
<style lang="scss" scoped>
@import '../../theme';
page {
    background-color: $bg;
}
.tip {
    line-height: 30px;
    padding: 10px;
}
.item {
    background-color: #fff;
    padding: 5px 60px 5px 10px;
    position: relative;
    display: block;
    .name {
        line-height: 30px;
        font-size: 20px;
    }
    .time {
        color: #ccc;
        font-size: 12px;
    }
    .fa {
        position: absolute;
        right: 10px;
        top: 18px;
        font-size: 20px;
        color: #999;
    }
    &:not(:last-of-type) {
        border-bottom: 1px solid #ccc;
    }
}
</style>

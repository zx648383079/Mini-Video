<template>
    <div class="nav-top">
        <div style="height: {{statusBarHeight}}px;"></div>
        <div class="bar">
            <div v-if="back" class="back-icon" @click="tapBack">
                <i class="iconfont icon-chevron-left"></i>
            </div>
            <span class="title">{{ title }}</span>
        </div>
    </div>
</template>
<script lang="ts">
import { IMyApp } from "../../app.vue";
import { WxJson, WxComponent, WxMethod } from "../../../typings/wx/lib.vue";

interface IComponentPage {
    [key: string]: any,
}

const app = getApp<IMyApp>();

@WxJson({
    component: true
})
export class Navbar extends WxComponent<IComponentPage>  {

    public options = {
        addGlobalClass: true,
    };

    public properties = {
        title: String,
        back: {
            type: Boolean,
            value: true,
        },
        autoBack: {
            type: Boolean,
            value: true,
        }
    };

    public data: IComponentPage = {
        statusBarHeight: app.globalData.statusBarHeight
    }

    ready() {
        
    }

    @WxMethod()
    public tapBack() {
        if (this.data.autoBack) {
            wx.navigateBack({
                fail() {
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }
            });
            return;
        }
        this.triggerEvent('back');
    }
}
</script>
<style lang="scss">
</style>

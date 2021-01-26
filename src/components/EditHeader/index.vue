<template>
    <div>
        <div class="top-bar" style="height: {{ top }}px;">
        </div>
        <div class="large-header">
            <div class="back-icon" v-if="back" @click="tapBack">
                <i class="iconfont icon-chevron-left"></i>
            </div>
            <div class="title">{{ title }}</div>
            <div class="action-icon" :class="{disabled: disabled}" @click="tapSubmit">
                <i class="iconfont icon-check"></i>
            </div>
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
export class EditHeader extends WxComponent<IComponentPage>  {

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
        },
        disabled: {
            type: Boolean,
            value: false,
        }
    };

    public data: IComponentPage = {
        top: app.globalData.statusBarHeight
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

    @WxMethod()
    public tapSubmit() {
        if (this.data.disabled) {
            return;
        }
        this.triggerEvent('submited');
    }
}
</script>
<style lang="scss">
</style>

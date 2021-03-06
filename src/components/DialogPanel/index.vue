<template>
    <div class="dialog-panel-box">
        <div @click="showCalendar" class="dialog-panel__input-container">
            <slot name="input"></slot>
        </div>
        <div class="dialog dialog-content" v-if="calendarVisible">
            <div class="dialog-header">
               <div class="dialog-title">{{ title }}</div>
                <i class="iconfont icon-close dialog-close" @click="hideCalerdar"></i>
            </div>
            <div class="dialog-body" style="height: {{ bodyHeight }};">
                <slot name="panel"></slot>
            </div>
            <div class="dialog-footer">
                <slot name="footer"></slot>
            </div>
        </div>
        <div class="dialog-bg" v-if="calendarVisible" @click="hideCalerdar"/>
    </div>
</template>
<script lang="ts">
import { WxJson, WxComponent, WxMethod } from "../../../typings/wx/lib.vue";

interface IComponentPage {
    [key: string]: any,
    calendarVisible: boolean
}

@WxJson({
    component: true
})
export class DialogPanel extends WxComponent<IComponentPage>  {

    public options = {
        addGlobalClass: true,
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    };

    public properties = {
        title: String,
        hide: Boolean,
        bodyHeight: {
            type: String,
            value: 'auto'
        }
    };

    public data: IComponentPage = {
        calendarVisible: false
    }

    ready() {
        this.observe('calendarVisible', val => {
            this.triggerEvent('toggle', val);
        });
        this.observe('hide', val => {
            if (this.data.calendarVisible === !val) {
                return;
            }
            this.setData({
                calendarVisible: !val
            });
        });
    }

    @WxMethod()
    public observe(key: string, callback: (newVal: any, oldVal: any) => void) {
        let val = this.data[key];
        Object.defineProperty(this.data, key, {
            configurable: true,
            enumerable: true,
            set: function(value) {
                // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
                callback.call(this, value, val); // value是新值，val是旧值
                val = value;
            },
            get: function() {
                return val;
            }     
        })
    }

    @WxMethod()
    public showCalendar() {
        this.setData({
            calendarVisible: true
        });
        this.triggerEvent('showed');
    }

    @WxMethod()
    public hideCalerdar() {
       this.setData({
           calendarVisible: false
       });
       this.triggerEvent('hided');
    }
}
</script>
<style lang="scss">
</style>

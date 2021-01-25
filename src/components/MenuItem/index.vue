<template>
    <div class="line-item" @click="tapGo">
        <i class="iconfont {{icon}}"></i>
        <span>{{ title }}</span>
        <span>{{ tip }}</span>
        <i class="iconfont icon-chevron-right"></i>
    </div>
</template>
<script lang="ts">
import { WxJson, WxComponent, WxMethod } from "../../../typings/wx/lib.vue";

@WxJson({
    component: true
})
export class MenuLargeItem extends WxComponent<any>  {
    public options = {
        addGlobalClass: true
    }
    
    public properties = {
        title: String,
        icon: String,
        uri: String,
        tip: String,
    }
    @WxMethod()
    public tapGo() {
        if (this.data.uri) {
            wx.navigateTo({
                url: this.data.uri
            });
            return;
        }
        this.triggerEvent('click');
    }
}

</script>
<style lang="scss" scoped>

</style>

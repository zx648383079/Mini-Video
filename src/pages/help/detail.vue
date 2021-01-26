<template>
    <div>
        <Navbar :title="data ? data.title : '帮助中心'"/>
        <div class="box" style="margin-top: {{ top }}px;">
            <div class="content" v-if="data">
                <rich-text :nodes="data.content"></rich-text>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { WxPage, WxJson } from '../../../typings/wx/lib.vue';
import { articleDetail } from '../../api/article';

const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    data: any;
}
@WxJson({
    navigationBarTitleText: "帮助中心",
    navigationBarBackgroundColor: "#fff",
    navigationBarTextStyle: "black"
})
export class Detail extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(),
        data: null,
    };

    public onLoad(option: any) {
        if (!option.id) {
            return;
        }
        articleDetail(option.id).then(data => {
            this.setData({data})
        });
    }

}
</script>
<style lang="scss" scoped>
@import '../../theme';
page {
    background-color: $bg;
}
.content {
    padding: 10px;
    background-color: white;
}
</style>
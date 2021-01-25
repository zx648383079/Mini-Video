<template>
    <div>
        <div class="main-box" :class="{'fixed-top': fixedTop}" style="margin-top: {{ top }}px;">
            <div class="search-box" style="top: {{ top }}px;">
                <input type="text" placeholder="请输入搜索内容" v-model="keywords" @confirm="tapSearch">
                <i class="iconfont icon-search" @click="tapSearch"></i>
            </div>

            <div class="two-grid">
                <div class="video-item" v-for="(item, index) in items" :key="index" @click="tapView(index)">
                    <img :src="item.cover" mode="widthFix">
                </div>
            </div>
        </div>
        <TabBar selected="0"/>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { WxPage, WxJson } from '../../../typings/wx/lib.vue';
import { IVideo, IVideoData } from '../../api/model';
import { videoList } from '../../api/video';

const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    fixedTop: boolean;
    windowHeight: number;
    keywords: string;
    items: IVideo[],
    page: number,
    hasMore: boolean,
    isLoading: boolean,
}
@WxJson({
    navigationBarTitleText: "首页",
    navigationBarBackgroundColor: "#f4f4f4",
    navigationBarTextStyle: "black",
    onReachBottomDistance: 10,
    enablePullDownRefresh: true,
})
export class Index extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(0),
        windowHeight: 600,
        fixedTop: false,
        keywords: '',
        items: [],
        page: 1,
        hasMore: true,
        isLoading: false,
    };

    public onLoad() {
        this.tapRefresh();
    }

    public onShow() {
        const res = wx.getSystemInfoSync();
        this.setData({
            windowHeight: res.windowHeight,
        });
    }

    public tapView(i: number) {
        app.globalData.cacheData = <IVideoData>{
            items: this.data.items,
            index: i,
            page: this.data.page,
            queries: {
                keywords: this.data.keywords,
            }
        };
        wx.navigateTo({
            url: '/pages/video/index',
        });
    }

    public tapSearch() {
        this.tapRefresh();
    }

    onPageScroll(event: any) {
        this.setData({
            fixedTop: event.scrollTop > this.data.windowHeight * .4,
        });
    }

    onPullDownRefresh() {
        this.tapRefresh();
    }

    onReachBottom() {
        this.tapMore();
    }

    public tapMore() {
        if (!this.data.hasMore) {
            return;
        }
        this.goPage(this.data.page + 1);
    }

    /**
     * refresh
     */
    public tapRefresh() {
        this.goPage(1);
    }

    public goPage(page: number) {
        if (this.data.isLoading) {
            return;
        }
        this.setData({
            isLoading: true
        });
        videoList({
            keywords: this.data.keywords,
            page,
        }).then(res => {
            this.setData({
                page: page,
                hasMore: res.paging.more,
                isLoading: false,
                items: page < 2 ? res.data :  [].concat(this.data.items as never[], res.data as never[])
            });
        });
    }
}
</script>
<style lang="scss" scoped>
.search-box {
    margin: 0 10px;
    display: flex;
    line-height: 44px;
    border: 1px solid #ccc;
    input {
        height: 44px;
        border: none;
        flex: 1;
    }
    .iconfont {
        display: inline-block;
        width: 44px;
        text-align: center;
    }
}
.main-box {
    padding-top: 40vh;
    &.fixed-top {
        padding-top: 0;
        .search-box {
            position: fixed;
            left: 0;
            right: 0;
        }
    }
}
.two-grid {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin-top: 0.9375rem;
    text-align: center;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: .5rem;
}
.video-item {
    image {
        width: 100%;
    }
}
</style>

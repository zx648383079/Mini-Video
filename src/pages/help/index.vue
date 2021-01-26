<template>
    <div>
        <Navbar title="帮助中心"/>
        <div class="main-box" style="margin-top: {{ top }}px;">
            <div class="search-box">
                <i class="iconfont icon-search"></i>
                <input type="text" placeholder="搜索帮助内容" bindconfirm="tapSearch">
            </div>
            <div class="panel">
                <div class="panel-header">常见问题</div>
                <block v-for="(item, index) in items" :key="index">
                    <a href="/pages/help/detail?id={{ item.id }}" class="line-item">
                        {{ item.title }}
                        <div class="icon-right">></div>
                    </a>
                </block>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { WxJson, WxPage } from '../../../typings/wx/lib.vue';
import { articleList } from '../../api/article';
import { IArticle } from '../../api/model';
import { IMyApp } from '../../app.vue';

interface IPageData {
    top: number;
    items: IArticle[],
    hasMore: boolean,
    page: number,
    isLoading: boolean
}

const app = getApp<IMyApp>();

@WxJson({
    navigationBarTitleText: "帮助中心",
    navigationBarBackgroundColor: "#05a6b1",
    navigationBarTextStyle: "white",
    onReachBottomDistance: 10,
    enablePullDownRefresh: true,
})
export class History extends WxPage<IPageData> {

    public data: IPageData = {
        top: app.getNavbarHeight(),
        items: [],
        hasMore: true,
        page: 1,
        isLoading: false
    }

    public onLoad() {
        this.tapRefresh();
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
            isLoading: true,
            page
        });
        articleList({
            page,
        }).then(res => {
            wx.stopPullDownRefresh();
            let items = [];
            if (page < 2) {
                items = res.data as never[];
            } else {
                items = [].concat(this.data.items as never[], res.data as never[]);
            }
            this.setData({
                hasMore: res.paging.more,
                isLoading: false,
                page,
                items
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
.search-box {
    margin: 10px;
    line-height: 30px;
    background-color: $white;
    position: relative;
    border-radius: 5px;
    padding: 0 10px;
    input {
        padding-left: 30px;
        height: 30px;
    }
    .iconfont {
        position: absolute;
        left: 10px;
        top: 0;
        color: #ccc;
    }
}
.panel {
    .panel-header {
        line-height: 40px;
        border-bottom: 1px solid #ccc;
        padding: 0 10px;
    }
}
</style>

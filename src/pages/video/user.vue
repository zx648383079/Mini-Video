<template>
    <div>
        <Navbar/>
        <div class="main-box" style="margin-top: {{ top }}px;">
            <div class="user-header" v-if="user">
                <div class="avatar">
                    <img :src="user.avatar">
                </div>
                <div class="name">
                    {{ user.name }}
                </div>
            </div>
            
            <div class="two-grid">
                <div class="video-item" v-for="(item, index) in items" :key="index" @click="tapView(index)">
                    <img :src="item.cover" mode="widthFix">
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { IUser, IVideo, IVideoData } from '../../api/model';
import { WxPage, WxJson } from '../../../typings/wx/lib.vue';
import { videoList, videoUser } from '../../api/video';

const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    user: IUser | null,
    items: IVideo[],
    page: number,
    hasMore: boolean,
    isLoading: boolean,
}
@WxJson({
    navigationBarTitleText: "",
    navigationBarBackgroundColor: "#05a6b1",
    navigationBarTextStyle: "white",
    onReachBottomDistance: 10,
    enablePullDownRefresh: true,
})
export class User extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(),
        user: null,
        items: [],
        page: 1,
        hasMore: true,
        isLoading: false,
    };

    onLoad(option: any) {
        videoUser(option.id).then(res => {
            this.setData({user: res});
            this.tapRefresh();
        });
    }

    public tapView(i: number) {
        app.globalData.cacheData = <IVideoData>{
            items: this.data.items,
            index: i,
            page: this.data.page,
            queries: {
                user: this.data.user?.id
            }
        };
        wx.navigateTo({
            url: '/pages/video/index',
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
            user: this.data.user?.id,
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
@import '../../theme';
page {
    background-color: $bg;
}
.top-bar {
    background: #05a6b1;
}
.user-header {
    position: relative;
    padding-top: 1.5625rem;
    padding-bottom: 1.875rem;
    background: #05a6b1;

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

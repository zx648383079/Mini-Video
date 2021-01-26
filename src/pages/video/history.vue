<template>
    <div>
        <Navbar title="我的足迹"/>
        <div class="main-box" style="margin-top: {{ top }}px;">
            <div class="slide-box">
                <div class="swipe-box goods-list">
                    <div class="item" v-for="(item, index) in items" :key="index" :index="item.id">
                    </div>
                </div>
                <div class="empty-box" v-if="!items || items.length < 1">
                    您没有浏览记录
                </div>
            </div>
            <div class="add-btn" @click="tapClear">清空</div>
        </div>
    </div>
</template>
<script lang="ts">
import { WxJson, WxPage, CustomEvent } from '../../../typings/wx/lib.vue';
import { IVideo } from '../../api/model';
import { videoList } from '../../api/video';
import { IMyApp } from '../../app.vue';
import { SET_VIDEO_HISTORY } from '../../utils/types';

interface IPageData {
    top: number;
    idItems: number[],
    items: IVideo[],
    hasMore: boolean,
    page: number,
    isLoading: boolean
}

const app = getApp<IMyApp>();

@WxJson({
    navigationBarTitleText: "我的足迹",
    navigationBarBackgroundColor: "#05a6b1",
    navigationBarTextStyle: "white",
    onReachBottomDistance: 10,
    enablePullDownRefresh: true,
})
export class History extends WxPage<IPageData> {

    public data: IPageData = {
        top: app.getNavbarHeight(),
        idItems: [],
        items: [],
        hasMore: true,
        page: 1,
        isLoading: false
    }

    public onLoad() {
        this.tapRefresh();
    }

    slideButtonTap(e: CustomEvent) {
        const id = e.detail.data as number;
        for (let i = 0; i < this.data.items.length; i++) {
            if (this.data.items[i].id === id) {
                return this.tapRemove(i, id);
            }
        }
    }

    public tapRemove(j: number, id: number) {
        const data = this.data;
        for (let i = 0; i < data.idItems.length; i++) {
            if (data.idItems[i] === id) {
                data.idItems.splice(i, 1);
                break;
            }
        }
        data.items.splice(j, 1);
        wx.setStorageSync(SET_VIDEO_HISTORY, data.idItems);
        this.setData(data);
    }

    public tapClear() {
        let that = this;
        wx.showModal({
            title: '提示',
            content: '确认清空浏览记录？',
            success() {
                that.setData({
                    idItems: [],
                    items: [],
                    hasMore: false,
                    isLoading: false
                });
                wx.removeStorageSync(SET_VIDEO_HISTORY);
            }
        })
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
        this.setData({
            idItems: wx.getStorageSync(SET_VIDEO_HISTORY) || [],
            items: [],
            hasMore: true,
            isLoading: false
        });
        if (!this.data.idItems || this.data.idItems.length < 1) {
            this.setData({
                hasMore: false,
                isLoading: false
            });
            return;
        }
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
        videoList({
            id: this.data.idItems,
            page,
        }).then(res => {
            wx.stopPullDownRefresh();
            let items = [];
            if (page < 2) {
                items = res.data as never[];
            } else {
                items = [].concat(this.data.items as never[], res.data as never[]);
            }
            items = this.formatButton(items);
            this.setData({
                hasMore: res.paging.more,
                isLoading: false,
                page,
                items
            });
        });
    }

    private formatButton(res: any[]): any[] {
        return res.map(item => {
            if (item.name.length > 15) {
                item.name = item.name.substr(0, 15) + '...';
            }
            item.buttons = [
                {
                    type: 'warn',
                    text: '删除',
                    data: item.id,
                }
            ];
            return item;
        });
    }
}
</script>
<style lang="scss" scoped>
page {
    background-color:#f4f4f4;
}
.item {
    margin-bottom:10px;
}
</style>

<template>
    <DialogPanel title="背景音乐" bodyHeight="45vh" :hide="dialogHide" @hided="tapHide">
        <div class="line-item" slot="input">
            <i class="iconfont icon-music"></i>
            <span>背景音乐</span>
            <span>{{ value ? value.name : '' }}</span>
            <i class="iconfont icon-chevron-right"></i>
        </div>
        <div slot="panel">
            <div class="search-box">
                <input type="text" placeholder="请输入搜索音乐" v-model="keywords" @confirm="tapSearch">
                <i class="iconfont icon-search" @click="tapSearch"></i>
            </div>
            <div class="music-item" v-for="(item, index) in items" :key="index" :class="{active: value && value.id == item.id}" @click="value = item">
                <span class="name">{{ item.name }}</span>
                <span class="duration">时长{{ item.duration_format }}</span>
                <div class="action">
                    <i class="iconfont" :class="item.is_play ? 'icon-stop' : 'icon-play'" @click.stop="tapPlay(index)"></i>
                </div>
            </div>
        </div>
        <div class="flex-footer" slot="footer">
            <div class="btn-primary" @click="tapConfirm">确定</div>
        </div>
    </DialogPanel>
</template>
<script lang="ts">
import { WxJson, WxComponent, WxMethod } from "../../../../typings/wx/lib.vue";
import { IMusic } from "../../../api/model";
import { musicList } from '../../../api/video';
import { formatHour } from "../../../utils/util";

interface IComponentData {
    value?: IMusic,
    keywords: string;
    items: IMusic[],
    page: number,
    hasMore: boolean,
    isLoading: boolean,
    audio: WechatMiniprogram.InnerAudioContext | null;
    dialogHide: boolean;
}

@WxJson({
    usingComponents: {
        DialogPanel: '/components/DialogPanel/index'
    },
    component: true
})
export class MusicLine extends WxComponent<IComponentData>  {
    public options = {
        addGlobalClass: true,
    }

    public properties = {
        value: Object,
    }

    public data: IComponentData = {
        keywords: '',
        items: [],
        page: 1,
        hasMore: true,
        isLoading: false,
        audio: null,
        dialogHide: true,
    }

    @WxMethod()
    tapSearch() {
        this.tapRefresh();
    }

    @WxMethod()
    tapPlay(i: number) {
        const items = this.data.items;
        const item = items[i];
        const innerAudio = this.data.audio ? this.data.audio : wx.createInnerAudioContext();
        if (!item.is_play) {
            items.forEach(i => {
                i.is_play = false;
            });
            innerAudio.src = item.path;
            innerAudio.play();
            item.is_play = true;
            const endEvent = () => {
                this.setData({
                    items: this.data.items.map(i => {
                        i.is_play = i.id === item.id ? false : i.is_play
                        return i;
                    }),
                });
                innerAudio.offEnded(endEvent);
            };
            innerAudio.onEnded(endEvent);
        } else {
            item.is_play = false;
            innerAudio.stop();
        }
        this.setData({
            audio: innerAudio,
            items,
        });
    }

    @WxMethod()
    tapHide() {
        if (this.data.audio) {
            this.data.audio.destroy();
        }
    }

    @WxMethod()
    tapConfirm() {
        this.setData({
            dialogHide: true,
        });
        this.triggerEvent('input', {
            value: this.data.value
        });
    }

    @WxMethod()
    public tapMore() {
        if (!this.data.hasMore) {
            return;
        }
        this.goPage(this.data.page + 1);
    }

    
    @WxMethod()
    public tapRefresh() {
        this.goPage(1);
    }

    @WxMethod()
    public goPage(page: number) {
        if (this.data.isLoading) {
            return;
        }
        this.setData({
            isLoading: true,
            dialogHide: false,
        });
        musicList({
            keywords: this.data.keywords,
            page,
        }).then(res => {
            this.setData({
                page: page,
                hasMore: res.paging.more,
                isLoading: false,
                items: (page < 2 ? res.data :  [].concat(this.data.items as never[], res.data as never[])).map((item: any) => {
                    item.duration_format = formatHour(item.duration);
                    return item;
                })
            });
        });
    }
}
</script>
<style lang="scss" scoped>
@import '../../../theme';
.search-box {
    display: flex;
    line-height: 40px;
    border: 1px solid #ccc;
    input {
        height: 40px;
        border: none;
        flex: 1;
    }
    .iconfont {
        display: inline-block;
        width: 40px;
        text-align: center;
    }
}
.music-item {
    display: flex;
    line-height: 40px;
    padding: 10px;
    .name {
        flex: 1;
        display: inline-block;
    }
    .action {
        display: inline-block;
        text-align: center;
        .iconfont {
            display: inline-block;
            width: 40px;
            text-align: center;
        }
    }
    &:not(:last-of-type) {
        border-bottom: 1px solid #ccc;
    }
    &.active {
        border-bottom-color: $btn;
        background-color: $primary;
        color: $primaryText;
        .action {
            color: #fff;
        }
    }
}
.flex-footer {
    display: flex;
}
.btn-primary {
    flex: 1;
}
</style>
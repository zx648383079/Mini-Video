<template>
    <div>
        <Navbar title="发布" :autoBack="false" @back="tapBack"/>
        <div class="main-box" style="margin-top: {{ top }}px;">
            <div class="edit-group">
                <textarea rows="6" :maxlength="maxSize" placeholder="说点什么……" :value="data.content"
							placeholder-class="placeholder" bindinput="onValueChange"></textarea>
				<text class="tip">{{ size }}/{{ maxSize }}</text>
                <div class="upload-btn" @click="tapUpload">
                    <div class="add-btn" v-if="!data.cover">
                        <i class="iconfont icon-plus"></i>
                    </div>
                    <div class="preview-btn" v-else>
                        <img :src="data.cover">
                    </div>
                </div>
            </div>

            <div class="edit-group">
                <MusicLine v-model="data.music"/>
                <div class="line-item" @click="tapLocation">
                    <i class="iconfont icon-map"></i>
                    <span>你在哪儿？</span>
                    <span>{{ data.address || '' }}</span>
                    <i class="iconfont icon-chevron-right"></i>
                </div>
            </div>

            <div class="edit-group">
                <div class="line-item" @click="tapOpenType">
                    <i class="iconfont icon-unlock-alt"></i>
                    <span>谁可以看</span>
                    <span>{{ data.open_type_label }}</span>
                    <i class="iconfont icon-chevron-right"></i>
                </div>
            </div>

        </div>
        <div class="btn-footer">
            <div class="btn-cancel" @click="tapSubmit()">
                <i class="iconfont icon-baocun"></i>
                草稿
            </div>
            <div class="btn-primary"  @click="tapSubmit(1)">
                <i class="iconfont icon-paper-plane"></i>
                发布
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { WxPage, WxJson, InputEvent } from '../../../typings/wx/lib.vue';
import { IVideo } from '../../api/model';
import { videoSave } from '../../api/video';
import { uploadVideo } from '../../api/upload';

const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    tipped: boolean;
    data: IVideo;
    size: number;
    maxSize: number;
}
@WxJson({
    usingComponents: {
        MusicLine: './Child/MusicLine'
    },
    navigationBarTitleText: "发布",
    navigationBarBackgroundColor: "#0c0f18",
    navigationBarTextStyle: "white"
})
export class Add extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(),
        tipped: true,
        size: 0,
        maxSize: 200,
        data: {
            content: '',
            cover: '',
            video_path: '',
            open_type_label: '公开',
        } as any,
    };

    onLoad() {
    }

    public onValueChange(e: InputEvent) {
        let content = e.detail.value as string;
        if (content.length > this.data.maxSize) {
            content = content.substr(0, this.data.maxSize);
        }
        const data = this.data.data;
        data.content = content;
        this.setData({
            data,
			size: content.length,
			tipped: false,
        });
    }

    public tapUpload() {
        wx.chooseVideo({
            maxDuration: 600,
            success: (res) => {
                uploadVideo(res.tempFilePath).then(r => {
                    const data= this.data.data;
                    data.cover = r.thumb;
                    data.video_duration = Math.floor(res.duration);
                    data.video_width = res.width;
                    data.video_height = res.height;
                    data.video_path = r.url;
                    this.setData({data, tipped: false,});
                });
            }
        });
    }

    public tapLocation() {
        wx.chooseLocation({
            success: (res) => {
                const data: any = this.data.data;
                data.latitude = res.latitude;
                data.longitude = res.longitude;
                data.address = res.address;
                this.setData({data});
            }
        });
    }

    public tapOpenType() {
        const items = [
            '公开',
            '仅粉丝',
            '私人'
        ];
        wx.showActionSheet({
            itemList: items,
            success: (res) => {
                const data: any = this.data.data;
                data.open_type = res.tapIndex;
                data.open_type_label = items[res.tapIndex];
                this.setData({data});
            }
        });
    }

    public tapBack() {
		if (this.data.tipped) {
            wx.navigateBack();
            return;
        }
        wx.showToast({
            title: '返回将丢失内容',
            icon: 'none',
        });
        this.setData({tipped: true});
	}

    public tapSubmit(status = 0) {
        const data = Object.assign({status}, this.data.data);
        if (data.music && data.music_id != data.music.id) {
            data.music_id = data.music.id;
        }
        if (!data.video_path) {
            wx.showToast({
                title: '请选择视频',
                icon: 'none',
            })
            return;
        }
        if (!data.content) {
            wx.showToast({
                title: '请输入描述',
                icon: 'none',
            })
            return;
        }
        videoSave(data).then(_ => {
            this.setData({
                tipped: true,
            });
            wx.showModal({
                title: '提示',
                content: '发布成功',
                showCancel: false,
                success: () => {
                    this.tapBack();
                }
            });
        });
    }
}
</script>
<style lang="scss" scoped>
@import "../../theme";
page {
    background-color: $bg;
    color: $color;
}
.main-box {
    margin-bottom: 50px;
}
.btn-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .btn-cancel {
        margin-right: 10px;
        width: 30%;
    }
    .btn-primary {
        flex: 1;
    }
}

.edit-group {
    background-color: $second;
    color: $secondText;
    margin-bottom: 10px;
    position: relative;
    textarea {
        width: 100%;
        background-color: $second;
        padding: 20rpx 0;
        line-height: 20rpx;
        text-indent: 30rpx;
    }
    .tip {
        position: absolute;
        bottom: 10rpx;
        right: 10rpx;
        font-size: 30rpx;
    }
}
.upload-btn {
    width: 200rpx;
    height: 200rpx;
    background-color: #1e242b;
    .add-btn {
        text-align: center;
        line-height: 200rpx;
        .iconfont {
            font-size: 60rpx;
        }
    }
    .preview-btn {
        image {
            width: 200rpx;
            height: 200rpx;
        }
    }
}

</style>

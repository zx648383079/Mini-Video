<template>
    <div>
        <div class="nav-top">
            <div style="height: {{top}}px;"></div>
            <div class="bar">
                <div class="back-icon" @click="tapBack">
                    <i class="iconfont icon-chevron-left"></i>
                </div>
            </div>
        </div>
        <div class="main-box" :class="{flipping: isFlip}" :animation="animationData" style="margin-top: {{top}}px;width: 100%; height: {{ windowHeight }}px;">
            <div class="play-grid" @touchstart="onMoveStart" @touchend="onMoveEnd">
                <video id="video-player" :src="data.video_path" :show-play-btn="false" :controls="false" :show-fullscreen-btn="false" :show-center-play-btn="false" :enable-progress-gesture="false" :poster="data.cover" bindended="onVideoEnded"></video>
                <div class="info-box">
                    <div class="title">@{{ data.user.name }}</div>
                    <div class="content">{{ data.content }}</div>
                    <div class="music" v-if="data.music">
                        <i class="iconfont icon-music"></i>
                        <div class="loop-box">
                            {{ data.music.name }}
                        </div>
                    </div>
                </div>
                <div class="action-bar">
                    <div class="avatar">
                        <img :src="data.user.avatar" alt="">
                        <div class="follow-icon">
                            <i class="iconfont icon-plus"></i>
                        </div>
                    </div>
                    <div class="btn-item" :class="{active: data.is_liked}" @click="tapToggleLike">
                        <i class="iconfont icon-collect"></i>
                        <span class="label">{{ data.like_count }}</span>
                    </div>
                    <div class="btn-item" @click="tapShowComment">
                        <i class="iconfont icon-comment"></i>
                        <span class="label">{{ data.comment_count }}</span>
                    </div>
                    <div class="btn-item">
                        <i class="iconfont icon-share"></i>
                        <span class="label">分享</span>
                    </div>
                </div>
            </div>
            
            <div class="play-grid next-play" v-if="next">
                <video :src="next.video_path" :show-play-btn="false" :controls="false" :show-fullscreen-btn="false" :show-center-play-btn="false" :enable-progress-gesture="false" :poster="next.cover"></video>
                <div class="info-box">
                    <div class="title">@{{ next.user.name }}</div>
                    <div class="content">{{ next.content }}</div>
                    <div class="music" v-if="next.music">
                        <i class="iconfont icon-music"></i>
                        <div class="loop-box">
                            {{ next.music.name }}
                        </div>
                    </div>
                </div>
                <div class="action-bar">
                    <div class="avatar">
                        <img :src="next.user.avatar" alt="">
                        <div class="follow-icon">
                            <i class="iconfont icon-plus"></i>
                        </div>
                    </div>
                    <div class="btn-item" :class="{active: next.is_liked}">
                        <i class="iconfont icon-collect"></i>
                        <span class="label">{{ next.like_count }}</span>
                    </div>
                    <div class="btn-item">
                        <i class="iconfont icon-comment"></i>
                        <span class="label">{{ next.comment_count }}</span>
                    </div>
                    <div class="btn-item">
                        <i class="iconfont icon-share"></i>
                        <span class="label">分享</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="dialog dialog-content" v-if="isCommenting">
            <div class="dialog-header">
               <div class="dialog-title">评论</div>
                <i class="iconfont icon-close dialog-close" @click="tapHideComment"></i>
            </div>
            <div class="dialog-body" style="height: 45vh;">
                <div class="comment-item" v-for="(item, index) in commentData.items" :key="index">
                    <div class="avatar"  @click="tapCommenting(item)">
                        <img :src="item.user.avatar" alt="">
                    </div>
                    <div class="name" @click="tapCommenting(item)">{{ item.user.name }}</div>
                    <div class="content" @click="tapCommenting(item)">{{ item.content }}</div>
                    <div class="action">
                        <span class="time">{{ item.created_at }}</span>
                    </div>
                    <div class="reply-box" v-if="item.replies && item.replies.length > 0">
                        <div class="comment-item" v-for="(it, j) in item.replies" :key="j">
                            <div class="name"  @click="tapCommenting(it)">{{ it.user.name }}</div>
                            <div class="content"  @click="tapCommenting(it)">{{ it.content }}</div>
                            <div class="action">
                                <span class="time">{{ it.created_at }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <div class="commtent-form">
                    <input type="text" v-model="commentData.content" @confirm="tapCommentSubmit" placeholder="请输入评论内容">
                    <i class="iconfont icon-paper-plane" @click="tapCommentSubmit"></i>
                </div>
            </div>
        </div>
        <div class="dialog-bg" v-if="isCommenting" @click="tapHideComment"/>
    </div>
</template>
<script lang="ts">
import {
    IMyApp
} from '../../app.vue';
import { WxPage, WxJson, TouchEvent, Touch } from '../../../typings/wx/lib.vue';
import { IComment, IVideo, IVideoData } from '../../api/model';
import { commentList, commentSave, videoLike, videoList } from '../../api/video';

const app = getApp<IMyApp>();

interface IPageData {
    top: number;
    windowHeight: number;
    windowWidth: number;
    items: IVideo[];
    data: IVideo | null;
    next: IVideo | null;
    index: number;
    page: number;
    queries: any;
    isLoading: boolean;
    videoPlayer: WechatMiniprogram.VideoContext | null,
    audioPlayer: WechatMiniprogram.InnerAudioContext | null,
    isFlip: boolean;
    animationData: any,
    isCommenting: boolean;
    commentData: {
        video_id: number;
        content: string;
        parent_id: number;
        items: IComment[],
        page: number,
        hasMore: boolean,
    };
    movePoint: {
        x: number;
        y: number;
    };
}
@WxJson({
    navigationBarTitleText: "播放",
    navigationBarBackgroundColor: "#0c0f18",
    navigationBarTextStyle: "white"
})
export class Index extends WxPage<IPageData> {
    public data: IPageData = {
        top: app.getNavbarHeight(0),
        windowHeight: 700,
        windowWidth: 400,
        items: [],
        data: null,
        next: null,
        index: -1,
        page: 1,
        queries: {},
        isLoading: false,
        videoPlayer: null,
        audioPlayer: null,
        isFlip: false,
        animationData: {},
        isCommenting: false,
        commentData: {
            video_id: 0,
            content: '',
            parent_id: 0,
            items: [],
            page: 1,
            hasMore: true,
        },
        movePoint: {
            x: 0,
            y: 0,
        }
    };

    onLoad(option: any) {
        if (option && Object.keys(option).length > 0) {
            this.setData({
                queries: option,
            });
            this.tapRefresh(() => {
                if (this.data.items.length < 1) {
                    return;
                }
                this.setData({
                    data: this.data.items[0],
                    index: 0,
                });
                setTimeout(() => {
                    this.tapPlay();
                }, 1000);
            });
            return;
        }
        const data = app.flashData<IVideoData>();
        if (!data) {
            this.tapRefresh(() => {
                if (this.data.items.length < 1) {
                    return;
                }
                this.setData({
                    data: this.data.items[0],
                    index: 0,
                });
                setTimeout(() => {
                    this.tapPlay();
                }, 1000);
            });
            return;
        }
        this.setData({
            items: data.items,
            data: data.items[data.index],
            index: data.index,
            page: data.page,
            queries: data.queries,
        });
        setTimeout(() => {
            this.tapPlay();
        }, 1000);
    }

    onShow() {
        const res = wx.getSystemInfoSync();
        this.setData({
            windowHeight: res.windowHeight - this.data.top,
            windowWidth: res.windowWidth,
        });
    }

    onReady() {
        this.setData({
            videoPlayer: wx.createVideoContext('video-player'),
            audioPlayer: wx.createInnerAudioContext(),
        });
    }

    onHide() {
        this.tapStop();
    }

    onUnload() {
        if (this.data.audioPlayer) {
            this.data.audioPlayer.destroy();
        }
    }

    public onMoveStart(e: TouchEvent) {
        const target = e.touches[0] as Touch;
        this.setData({
            movePoint: {
                x: target.clientX,
                y: target.clientY,
            }
        });
    }

    public onMoveEnd(e: TouchEvent) {
        const target = e.changedTouches[0] as Touch;
        const point = {
            x: target.clientX,
            y: target.clientY,
        };
        if (Math.abs(this.data.movePoint.x - point.x) > 50) {
            return;
        }
        const diff = this.data.movePoint.y  - point.y;
        if (diff > 50) {
            this.tapNext();
            return;
        }
        if (diff < - 50) {
            this.tapPrevious();
            return;
        }
    }

    public tapHideComment() {
        this.setData({
            isCommenting: false,
        });
        if (!this.data.data) {
            return;
        }
        this.tapPlay(false);
    }

    public tapCommenting(item: IComment) {
        const commentData = this.data.commentData;
        commentData.parent_id = item.id;
        commentData.content = '回复 @' + item.user.name;
        this.setData({
            commentData
        });
    }

    public tapCommentSubmit() {
        const commentData = this.data.commentData;
        if (!commentData.content || commentData.content.trim().length < 1) {
            wx.showToast({
                title: '请输入内容',
                icon: 'none'
            })
            return;
        }
        commentSave({
            video_id: commentData.video_id,
            content: commentData.content,
            parent_id: commentData.content.indexOf('回复 @') === 0 ? commentData.parent_id : 0,
        }).then(_ => {
            wx.showToast({
                title: '评论已提交',
            });
            const commentData = this.data.commentData;
            commentData.parent_id = 0;
            commentData.content = '';
            this.setData({
                commentData
            });
        });
    }

    public tapShowComment() {
        if (!this.data.data) {
            return;
        }
        this.tapStop();
        this.setData({
            isCommenting: true,
        });
        if (this.data.commentData.video_id === this.data.data.id) {
            return;
        }
        const commentData = this.data.commentData;
        commentData.video_id = this.data.data.id;
        commentData.items = [];
        this.setData({
            commentData
        });
        this.tapRefreshComment();
    }

    public tapToggleLike() {
        if (!this.data.data) {
            return;
        }
        videoLike(this.data.data.id).then(res => {
            const data = this.data.data;
            if (!data || data.id !== res.id) {
                return;
            }
            data.is_liked = res.is_liked;
            data.like_count = res.like_count;
            this.setData({data});
        });
    }

    public tapBack() {
        wx.navigateBack({
            fail() {
                wx.redirectTo({
                    url: '/pages/index/index'
                });
            }
        });
    }

    public onVideoEnded() {
        this.tapNext();
    }

    public tapPrevious() {
        this.flipVideo(this.data.index, this.data.index - 1);
    }

    public tapNext() {
        this.flipVideo(this.data.index, this.data.index + 1);
    }

    public flipVideo(from: number, to: number) {
        this.tapStop();
        if (to < 0) {
            wx.showModal({
                title: '提示',
                content: '无法继续向前了',
            });
            return;
        }
        if (this.data.items.length <= to) {
            this.tapMore(() => {
                this.flipAnimation(from, to);
            });
            return;
        }
        this.flipAnimation(from, to);
    }

    public flipAnimation(from: number, to: number) {
        const animate = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease-in',
            delay: 0,
        });
        if (to > from) {
            animate.translateY(- this.data.windowHeight).step();
            this.setData({
                isFlip: true,
                next: this.data.items[to],
                animationData: animate.export(),
            });
        } else {
            animate.translateY(- this.data.windowHeight).step({duration: 0, timingFunction: 'linear'});
            this.setData({
                isFlip: true,
                next: this.data.items[to],
                animationData: animate.export(),
            });
            animate.translateY(0).step({duration: 500,
            timingFunction: 'ease-in'});
            this.setData({
                animationData: animate.export(),
            });
        }
        setTimeout(() => {
            animate.translateY(0).step({duration: 0, timingFunction: 'linear'});
            this.setData({
                isFlip: false,
                index: to,
                data: this.data.items[to],
                next: null,
                animationData: animate.export(),
            });
            setTimeout(() => {
                this.tapPlay();
            }, 500);
        }, 500);
    }

    public tapPlay(isNew = true) {
        if (!this.data.videoPlayer || !this.data.data) {
            return;
        }
        this.data.videoPlayer.play();
        if (!this.data.audioPlayer || !this.data.data.music) {
            return;
        }
        if (isNew) {
            this.data.audioPlayer.src = this.data.data.music.path;
        }
        this.data.audioPlayer.play();
    }

    public tapStop() {
        if (this.data.videoPlayer) {
            this.data.videoPlayer.stop();
        }
        if (this.data.audioPlayer) {
            this.data.audioPlayer.stop();
        }
    }

    public tapMore(success?: () => void) {
        this.goPage(this.data.page + 1, success);
    }

    /**
     * refresh
     */
    public tapRefresh(success?: () => void) {
        this.goPage(1, success);
    }

    public goPage(page: number, success?: () => void) {
        if (this.data.isLoading) {
            return;
        }
        this.setData({
            isLoading: true
        });
        videoList(Object.assign({page}, this.data.queries)).then(res => {
            this.setData({
                page: res.paging.offset,
                isLoading: false,
                items: res.paging.offset < 2 ? res.data :  [].concat(this.data.items as never[], res.data as never[])
            });
            success && success();
        });
    }

    public tapRefreshComment() {
        this.goCommentPage(1);
    }

    public tapMoreComment() {
        if (!this.data.commentData.hasMore) {
            return;
        }
        this.goCommentPage(this.data.commentData.page + 1);
    }

    public goCommentPage(page: number) {
        const video = this.data.commentData.video_id;
        commentList({
            video,
            page
        }).then(res => {
            const commentData = this.data.commentData;
            if (video !== commentData.video_id) {
                return;
            }
            commentData.page = res.paging.offset;
            commentData.items = res.paging.offset < 2 ? res.data :  [].concat(commentData.items as never[], res.data as never[]);
            this.setData({commentData});
        });
    }
}
</script>
<style lang="scss" scoped>
@import '../../theme';
page {
    background-color: $bg;
    color: #fff;
}
.nav-top {
    background-color: transparent;
}
.play-grid {
    position: relative;
    width: 100%;
    height: 100%;
    .cover {
        image {
            width: 100%;
            height: 100%;
        }
    }
    video {
        width: 100%;
        height: 100%;
    }
    .info-box {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 100px;
        .title {
            font-weight: 700;
            margin-bottom: 10px;
        }
        .music {
            margin-top: 10px;
            .iconfont {
                margin-right: 10px;
            }
        }
    }
    .loop-box {
        display: inline-block;
    }
    .action-bar {
        position: absolute;
        right: 5px;
        bottom: 10px;
        .avatar {
            position: relative;
            image {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 1px solid #fff;
                box-sizing: border-box;
            }
            .follow-icon {
                border-radius: 50%;
                line-height: 20px;
                width: 20px;
                text-align: center;
                background-color: $btn;
                color: #fff;
                position: absolute;
                bottom: 0px;
                left: 20px;
            }
        }
        .btn-item {
            text-align: center;
            margin-top: 10px;
            .iconfont {
                font-size: 40px;
            }
            .label {
                font-size: 12px;
                font-weight: 300;
                display: block;
                margin-top: 5px;
            }
            &.active {
                .iconfont {
                    color: $btn;
                }
            }
        }
    }
}

.comment-item {
    position: relative;
    padding: 5px 5px 5px 70px;
    .avatar {
        position: absolute;
        left: 5px;
        top: 5px;
        image {
            width: 60px;
            height: 60px;
            border-radius: 50%;
        }
    }
    .name {
        font-weight: 700;
    }
    .time {
        font-size: 12px;
        color: #ccc;
    }
    &:not(:last-of-type) {
        border-bottom: 1px solid #ccc;
    }
}

.commtent-form {
    display: flex;
    line-height: 40px;
    input {
        flex: 1;
        height: 40px;
        border-bottom: 1px solid #ccc;
        text-align: left;
    }
    .iconfont {
        display: inline-block;
        width: 40px;
        text-align: center;
    }
}
.dialog-content {
    color: #333;
}
</style>

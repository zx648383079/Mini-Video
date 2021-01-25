<template>
    <cover-view class="tab-bar-box">
            <cover-view class="tab-bar-border"></cover-view>
            <cover-view wx:for="{{list}}" wx:key="index" class="tab-bar-item" data-index="{{index}}" bindtap="switchTab" style="background-color: {{ item.background }};">
                <cover-image src="{{selected === index ? item.selectedIconPath : item.iconPath}}"></cover-image>
                <cover-view style="color: {{selected === index ? selectedColor : item.color}}">{{item.text}}</cover-view>
            </cover-view>
    </cover-view>
</template>
<script lang="ts">
import { WxJson, WxComponent, WxMethod, TouchEvent } from "../../typings/wx/lib.vue";

interface IComponentPage {
    [key: string]: any,
}

@WxJson({
    component: true
})
export class TabBar extends WxComponent<IComponentPage>  {

    public properties = {
        selected: {
          type: Number,
          value: -1,
        },
        timeEnter: {
          type: Boolean,
          value: true,
        }
    };

    public data: IComponentPage = {
        selectedColor: '#090909',
        color: '#666',
        list: [
            {
                pagePath: "/pages/index/index",
                iconPath: "/images/icon/home.png",
                selectedIconPath: "/images/icon/home_red.png",
                text: "首页"
            },
            {
                pagePath: "/pages/video/add",
                iconPath: "/images/icon/add.png",
                selectedIconPath: "/images/icon/add_red.png",
                text: "发布"
            },
            {
                pagePath: "/pages/member/index",
                iconPath: "/images/icon/user.png",
                selectedIconPath: "/images/icon/user_red.png",
                text: "我"
            }
        ]
    }

    ready() {
    }

    @WxMethod()
    switchTab(e: TouchEvent) {
      const i = e.currentTarget.dataset.index as number;
      const url = this.data.list[i].pagePath;
      if (i === 1 && !this.data.timeEnter) {
        this.triggerEvent('enter', {
          value: url,
        });
        return;
      }
      wx.navigateTo({url});
      // this.setData({
      //   selected: i
      // });
    }
}
</script>
<style lang="scss">
.tab-bar-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: white;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar-border {
  background-color: rgba(0, 0, 0, 0.33);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1px;
  transform: scaleY(0.5);
}

.tab-bar-item {
  flex: 1;
  margin:auto;
  text-align: center;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}

.tab-bar-item {
  cover-image {
    width: 27px;margin: auto;
    height: 27px;
  }

  cover-view {
    font-size: 10px;
  }
}

</style>

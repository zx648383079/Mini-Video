<script lang="ts">
import {
    TOKEN_KEY
} from "./utils/types";
import {
    IUser, ILogin, IRegister, ISite
} from "./api/model";
import { getSiteInfo } from './api/site';
import { getProfile, login, logout, authLogin, register } from "./api/user";
import { WxPage, WxApp, WxAppJson } from "typings/wx/lib.vue";

interface IAppData {
    token: string | null,
    user: IUser | null,
    statusBarHeight: number,
    site: ISite | null;
    cacheData: any;
}

export interface IMyApp {
    globalData: IAppData,
    getSite(): Promise<any>,
    getNavbarHeight(height?: number): number,
    flashData<T>(def?: T): T;
    getUser(): Promise<IUser|null>,
    setUser(user: IUser|null): void,
    setToken(token?: string): void,
    loginUser(params: ILogin): Promise<IUser| void>,
    authloginUser(params: any): Promise<IUser| void>;
    registerUser(params: IRegister): Promise<IUser| void>;
    logoutUser(): Promise<void>;
    setWatcher(page: WxPage<any>): void,
    observe(obj: any, key: string, watchFun: (this: WxPage<any>, newVal: any, oldVal: any) => void, deep: boolean, page: WxPage<any>): void,
}

@WxAppJson({
    pages: [
        "pages/index/index",
        "pages/browser/index",

        "pages/video/index",
        "pages/video/add",
        'pages/video/history',
        'pages/video/user',

        "pages/member/index",
        "pages/member/profile",
        "pages/member/login",
        "pages/member/password",

        'pages/feedback/index',
        'pages/help/index',
        'pages/help/detail',
        'pages/checkin/index'
    ],
    window: {
        backgroundTextStyle: "light",
        backgroundColor: "#f4f4f4",
        navigationBarBackgroundColor: "#05a6b1",
        navigationBarTitleText: "ZoDream Example",
        navigationBarTextStyle: "white",
        navigationStyle: 'custom',
    },
    permission: {
        'scope.userLocation': {
            desc: '你的位置信息将用于发布',
        },
    },
    usingComponents: {
        Navbar: "/components/navbar/index",
        TabBar: "/custom-tab-bar/index",
        EditHeader: '/components/EditHeader/index',
    },
})
export class Application extends WxApp<IAppData> implements IMyApp {

    public globalData: IAppData = {
        token: null,
        user: null,
        site: null,
        statusBarHeight: 0,
        cacheData: null,
    }

    public onLaunch() {
        // 展示本地存储能力
        this.globalData.token = wx.getStorageSync(TOKEN_KEY);
        const res = wx.getSystemInfoSync();
        this.globalData.statusBarHeight = res.statusBarHeight;
    }

    public getNavbarHeight(height: number = 44): number {
        return this.globalData.statusBarHeight + height;
    }

    public getSite(): Promise<ISite> {
        return new Promise((resolve, reject) => {
            if (this.globalData.site) {
                resolve(this.globalData.site);
                return;
            }
            getSiteInfo().then(res => {
                this.globalData.site = res;
                resolve(res);
            }).catch(reject);
        });
    }

    public flashData<T>(def?: T): T {
        const data = this.globalData.cacheData;
        this.globalData.cacheData = null;
        if (data) {
            return typeof data === 'object' ? Object.assign({}, data) : data;
        }
        return (typeof def === 'undefined' ? null : def) as any;
    }

    public getUser() {
        return new Promise<IUser|null>((resolve, reject) => {
            if (this.globalData.user) {
                resolve(this.globalData.user);
                return;
            }
            const token = wx.getStorageSync(TOKEN_KEY) as string;
            if (!token) {
                resolve(null);
                return;
            }
            getProfile().then((res: IUser) => {
                this.globalData.user = res;
                resolve(res);
            }).catch(reject);
        });
    }

    public setUser(user: IUser| null) {
        this.globalData.user = user;
    }

    public setToken(token?: string) {
        this.globalData.token = token ? token : null;
        if (!token) {
            wx.removeStorageSync(TOKEN_KEY);
            this.globalData.user = null;
            return;
        }
        wx.setStorageSync(TOKEN_KEY, token);
    }
    public loginUser(params: ILogin) {
        return login(params).then((res: IUser) => {
            this.setToken(res.token);
            this.globalData.user = res;
        });
    }
    public authloginUser(params: any) {
        return authLogin(params).then((res: IUser) => {
            this.setToken(res.token);
            return this.globalData.user = res;
        });
    }
    public registerUser(params: IRegister) {
        return register(params).then((res: IUser) => {
            this.setToken(res.token);
            this.globalData.user = res;
        });
    }

    public logoutUser() {
        return new Promise<void>((resolve, reject) => {
            const token = wx.getStorageSync(TOKEN_KEY) as string;
            if (!token) {
                resolve();
                return;
            }
            logout().then(() => {
                this.setToken();
                resolve();
            }).catch(reject);
        });
    }
    /**
     * 设置监听器
     */
    public setWatcher(page: any) {
        let data = page.data;
        let watch = page.watch;
        Object.keys(watch).forEach(v => {
            let key = v.split('.'); // 将watch中的属性以'.'切分成数组
            let nowData = data; // 将data赋值给nowData
            for (let i = 0; i < key.length - 1; i++) { // 遍历key数组的元素，除了最后一个！
                nowData = nowData[key[i]]; // 将nowData指向它的key属性对象
            }
            let lastKey = key[key.length - 1];
            // 假设key==='my.name',此时nowData===data['my']===data.my,lastKey==='name'
            let watchFun = watch[v].handler || watch[v]; // 兼容带handler和不带handler的两种写法
            let deep = watch[v].deep; // 若未设置deep,则为undefine
            this.observe(nowData, lastKey, watchFun, deep, page); // 监听nowData对象的lastKey
        })
    }
    /**
     * 监听属性 并执行监听函数
     */
    public observe(obj: any, key: string, watchFun: (newVal: any, oldVal: any) => void, deep: boolean, page: WxPage<any>) {
        let val = obj[key];
        // 判断deep是true 且 val不能为空 且 typeof val==='object'（数组内数值变化也需要深度监听）
        if (deep && val != null && typeof val === 'object') { 
            Object.keys(val).forEach(childKey=>{ // 遍历val对象下的每一个key
                this.observe(val,childKey,watchFun,deep,page); // 递归调用监听函数
            })
        }
        let that = this;
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            set: function(value) {
                // 用page对象调用,改变函数内this指向,以便this.data访问data内的属性值
                watchFun.call(page,value,val); // value是新值，val是旧值
                val = value;
                if(deep){ // 若是深度监听,重新监听该对象，以便监听其属性。
                    that.observe(obj, key, watchFun, deep, page); 
                }
            },
            get: function() {
                return val;
            }     
        })
    }
}
</script>
<style lang="scss">
@import 'icon';
@import 'theme';

.nav-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: $edit;
    color: $editText;
    z-index: 888;
    .bar {
        height: 44px;
        line-height: 44px;
        text-align: center;
        position: relative;
        image {
                width: 20px;
                height: 20px;
                position: absolute;
                left: 10px;
                top: 13px;
        }
    }
    .back-icon {
        position: absolute;
        left: 10px;
    }
    .title {
        font-weight: 700;
        color: #fff;
    }
}

.dialog-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 910;
}

.dialog {
    position: fixed;
    z-index: 920;
    &.dialog-content {
        left: 0;
        right: 0;
        background: #fff;
        min-width: 260px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        bottom: 0px;
        top: 38%;
        animation: fadeInUp 0.5s;

        .dialog-header {
            position: relative;
            height: 40px;
            line-height: 40px;
            text-align: center;
            padding: 5px 10px;
            .dialog-title {
                cursor: move;
                text-align: left;
            }

            .iconfont {
                width: 30px;
                height: 30px;
                border: none;
                position: absolute;
                top: 0;
                line-height: 30px;
            }

            .dialog-close {
                right: 0;
                top: 6px;
            }
        }

        .dialog-body {
            min-height: 100px;
            overflow: auto;
            padding: 10px;
            box-sizing: border-box;
        }

        .dialog-footer {
            padding: 2px;
            text-align: center;
        }
    }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.top-bar {
    background: $edit;
}
.large-header {
    background-color: $edit;
    color: $editText;
    height: 150px;
    position: relative;
    margin-bottom: 20px;
    .title {
        padding: 80px 0 0 20px;
        font-size: 30px;
    }
    .action-icon {
        position: absolute;
        bottom: -20px;
        display: block;
        width: 40px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        right: 20px;
        border-radius: 50%;
        background-color: #1d8686;
        .iconfont {
            font-size: 30px;
        }
        &.disabled {
            background-color: #506969;
            cursor: not-allowed;
        }
    }
    .back-icon {
        position: absolute;
        left: 10px;
        line-height: 44px;
    }
}

.login-type-box,
.login-box,
.register-box {
    text-align: center;
    padding: 10px;

    .logo {
        padding: 30px 0;
        image {
            width: 200rpx;
        }
    }

    .btn,
    button {
        display: block;
        margin: 0 0 10px;
        line-height: 40px;
        height: 40px;
        color: $white;
        border: 1px solid #b4282d;
        background-color: #b4282d;

        &.btn-none {
            background-color: $white;
            color: #b4282d;
        }
    }

    button {
        width: 100%;
    }

    .login-oauth-box {
        position: absolute;
        left: 0;
        width: 100%;
        bottom: 40px;
        text-align: center;
        font-size: 20px;

        navigator {
            display: inline-block;
            padding: 0 10px;

            &:not(:last-child) {
                border-right: $hr;
            }
        }
    }

    .input-group {
        text-align: left;
    }

    .unlogin {
        line-height: 40px;
        text-align: left;
    }

    .input-group {
        .checkbox {
            label::before {
                top: 3px;
            }
        }
    }
}

.input-box,
.code-input {
    border-bottom: $hr;
    input {
        height: 40px;
        border: 0;
        background: transparent;
        width: 100%;
        outline: none;
        text-align: left;
    }
}

.code-input {
    display: grid;
    grid-template-columns: 1fr 80px;

    navigator,
    text {
        border: 1px solid;
        font-size: 12px;
        line-height: 40px;
    }
}

.register-box {
    button {
        margin-top: 10px;
    }
}

.line-item {
    position: relative;
    line-height: 40px;
    padding: 0 10px;
    .icon-chevron-right {
        position: absolute;
        right: 10px;
        top: 0;
    }
    text {
        &:nth-child(3) {
            float: right;
            margin-right: 20px;
        }
    }
}

.btn-cancel,
.btn-primary {
    line-height: 40px;
    text-align: center;
    display: inline-block;
}
.btn-cancel {
    background-color: $cancel;
    color: $cancelText;
}
.btn-primary {
    background-color: $btn;
    color: $btnText;
}

.empty-box {
    line-height: 40px;
    text-align: center;
    font-size: 30px;
    color: #999;
    margin-top: 30vh;
}

.no-more-tip {
    text-align: center;
    color: #ccc;
    line-height: 60px;
}
</style>
export interface IPaging {
    limit: number;
    offset: number;
    total: number;
    more: boolean;
}

export interface IPage<T> {
    paging: IPaging;
    data: T[];
}

export interface IBaseResponse {
    appid?: string;
    sign?: string;
    sign_type?: string;
    timestamp?: string;
    encrypt?: string;
    encrypt_type?: string;
}
export interface IData<T> extends IBaseResponse {
    data?: T[];
}

export interface IDataOne<T> extends IBaseResponse {
    data?: T;
}

export interface IUser {
    id: number;
    email: string;
    name: string;
    avatar: string;
    token?: string;
    birthday?: string;
    sex?: number;
    video_count?: number;
    like_count?: number;
}

export interface ILogin {
    email?: string;
    password?: string;
    mobile?: string;
    code?: string;
}

export interface IRegister {
    name: string;
    email?: string;
    password?: string;
    mobile?: string;
    code?: string;
    rePassword?: string;
    agree: boolean;
}


export interface ISite {
    name: string;
    version: string;
    logo: string;
}

export interface IArticle {
    id: number,
    title: string,
    thumb: string,
    url?: string,
    content: string
}

export interface ICheckIn {
    id: number,
    created_at: string,
    running: number,
    type: number
}

export interface IMusic {
    id: number;
    name: string;
    singer: string;
    path: string;
    status: number;
    duration: number;
    created_at: string;
    updated_at: string;
    is_play?: boolean;
}

export interface IVideo {
    id: number;
    content: string;
    music_id: number;
    music?: IMusic;
    cover: string;
    video_path: string;
    video_duration: number;
    video_width: number;
    video_height: number;
    music_offset: number;
    like_count: number;
    comment_count: number;
    status: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    user?: IUser;
    is_liked?: boolean;
}

export interface IComment {
    id: number;
    user: IUser;
    content: string;
    created_at: string;
    updated_at: string;
}


export interface IVideoData {
    items: IVideo[];
    index: number;
    page: number;
    queries: any;
}
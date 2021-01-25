import { deleteRequest, fetch, post } from "../utils/http";
import { IComment, IDataOne, IMusic, IPage, IVideo } from "./model";


export const musicList = (params: any) => fetch<IPage<IMusic>>('video/music', params);

export const videoList = (params: any) => fetch<IPage<IVideo>>('video/video', params);

export const videoMoreList = (params: any) => fetch<IPage<IVideo>>('video/video/more', params);

export const videoSave = (data: any) => post<IVideo>('video/video/save', data);
export const videoLike = (id: number) => post<IVideo>('video/video/like', {id});
export const videoRemove = (id: any) => deleteRequest<IDataOne<boolean>>('video/video/delete', {id});

export const commentList = (params: any) => fetch<IPage<IComment>>('video/comment', params);
export const commentSave = (data: any) => post<IComment>('video/comment/save', data);
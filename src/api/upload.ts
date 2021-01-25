import { uploadFile } from "../utils/http";

export interface IUploadResult {
    url: string;
    size: number;
    title: string;
    original: string;
    type: string;
    thumb: string;
}

export interface IUploadFile {
    url: string;
    mtime: number;
    thumb: string;
}

export const uploadAnyFile = (file: string) => uploadFile<IUploadResult>(file, {url: 'open/file'});
export const uploadImage = (file: string) => uploadFile<IUploadResult>(file, {url: 'open/file/image'});
export const uploadAudio = (file: string) => uploadFile<IUploadResult>(file, {url: 'open/file/audio'});
export const uploadVideo = (file: string) => uploadFile<IUploadResult>(file, {url: 'open/file/video'});
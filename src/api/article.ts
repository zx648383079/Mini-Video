import { fetch } from "../utils/http";
import { IArticle, IPage } from "./model";


export const articleList = (params: any) => fetch<IPage<IArticle>>('article/help', params);

export const articleDetail = (id: number) => fetch<IArticle>('article/detail', {id});
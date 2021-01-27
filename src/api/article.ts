import { fetch } from "../utils/http";
import { IArticle, IPage } from "./model";


export const articleList = (params: any) => fetch<IPage<IArticle>>('shop/article', params);

export const articleDetail = (id: number) => fetch<IArticle>('shop/article', {id});
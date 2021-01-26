import { fetch, post } from "../utils/http";
import { IDataOne, ISite } from "./model";


export const getSiteInfo = () => fetch<ISite>('seo');

export const saveFeedback = (param: any) => post<IDataOne<boolean>>('contact/home/feedback', param);
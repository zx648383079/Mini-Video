import { fetch } from "../utils/http";
import { ISite } from "./model";


export const getSiteInfo = () => fetch<ISite>('seo');
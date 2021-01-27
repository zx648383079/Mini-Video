import {fetch, post,  } from '../utils/http';
import {IData, IDataOne, IDriver, IUser} from './model';

export const getDriver = () => fetch<IData<IDriver>>('auth/account/driver');

export const saveFeedback = (param: any) => post<IDataOne<boolean>>('contact/home/feedback', param);

export const cancelUser = (param: any) => post<IUser>('auth/account/cancel', param);
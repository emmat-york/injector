import { InjectionToken } from '../injector/injector.constant';
import { Parent } from './class.service';

export const CLASS_TOKEN = new InjectionToken<Parent>('CLASS_TOKEN');
export const VALUE_TOKEN = new InjectionToken<number>('VALUE_TOKEN');
export const FACTORY_TOKEN = new InjectionToken<string>('FACTORY_TOKEN');
export const EXISTING_TOKEN = new InjectionToken<number>('EXISTING_TOKEN');

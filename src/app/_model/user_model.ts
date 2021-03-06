export class UserReq {
  constructor(
    public email: string,
    public pwd: string) { }
}

export class LoginUser {
  UserData: any;
}

export interface LoginUserModel {
  uid: number;
  cmpid: number;
  cmpname:string;
  fy: number;
  fyfrom: any;
  fyto: any;
  ucode: string;
  email: string;
  fullname: string;
  login: string,
  status: boolean,
  errcode: string,
  errmsg: string,
  _sessiondetails: any;
  _globsettings: GlobalSettings;
}

export interface GlobalSettings {
  dateformat: string,
  numberforamt: string,
  language: string

}
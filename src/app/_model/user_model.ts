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
  fyid: number;
  fyfrom: any;
  fyto: any,
  ucode:string,
  email:string
}
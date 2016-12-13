import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserReq } from '../../app/_model/user_model';
import { DataService } from '../_service/dataconnect';


@Injectable()
export class AuthenticationService {

  constructor( private _router: Router, private _dataserver: DataService) { }

  logout() {
    //Cookie.delete('user');
    this._router.navigate(['login']);
  }

  login(user: UserReq) {
    let loginRes: any = this._dataserver.post("getLogin", {
      "email": user.email,
      "pwd": user.pwd
    })
    console.log(loginRes);
    return loginRes;
  }
  

  public checkCredentials(): boolean {
    // if (localStorage.getItem("user") === null) {

    //   this._router.navigate(['login']);

    // }
    return true;
  }
}
import { Component } from '@angular/core';
import { UserService } from '../../../_service/user/user-service'

@Component({
  templateUrl: 'dashboard.comp.html'
})
export class AccountDashboardComp {
  _loginUser: any;
  loginUserName: string;
  constructor(private _userservice: UserService) {


  }

}
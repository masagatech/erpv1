import { Component } from '@angular/core';
import { AuthenticationService } from '../_service/auth-service'
import { UserService } from '../_service/user/user-service'
import { UserReq, LoginUserModel } from '../_model/user_model';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'login.comp.html'
})

export class LoginComp {
    public errorMsg = '';
    public btnLoginText = 'Login';
    _user = new UserReq("", "");

    constructor(private _router: Router, private _service: AuthenticationService, private _loginModel: UserService) {

    }

    login(e) {
        this.btnLoginText = "Loging..";

        this._service.login(this._user).subscribe(d => {
            if (d) {
                if (d.status) {
                    let usrobj = d.data;
                    console.log(usrobj);
                    let userDetails = usrobj[0];

                    if (userDetails.status) {
                        this._loginModel.setUsers(userDetails);
                        if (userDetails.errcode === "chpwd") {
                             this._router.navigate(['/changepwd']);
                        } else {
                            this._router.navigate(['/login-step1']);
                        }
                    } else {
                        this.btnLoginText = "Login";
                        this.errorMsg = userDetails.errmsg;
                    }
                }
            }
        }, err => {
            this.errorMsg = 'Failed to login';
            this.btnLoginText = "Login";
        });

        e.preventDefault();
    }
}
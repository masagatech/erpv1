import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/auth-service'
import { UserService } from '../_service/user/user-service'
import { UserReq, LoginUserModel } from '../_model/user_model';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'login.comp.html',
    styleUrls:['../../assets/css/login.css']
})

export class LoginComp implements OnInit {
    public errorMsg = '';
    public btnLoginText = 'Login';
    _user = new UserReq("", "");

    constructor(private _router: Router, private _service: AuthenticationService, private _loginModel: UserService) {
        var that = this;
        var checks = this._service.checkCredentials();
        if (checks.status) that._router.navigate(['/']);
        if (checks.takefrmdb) {
            that._service.getSession(function (e) {
                if (e == "success")
                    that._router.navigate(['/']);
            }, checks);
        }
    }

    login(e) {
        this.btnLoginText = "Loging..";
        
        this._service.login(this._user).subscribe(d => {
            if (d) {
                if (d.status) {
                    let usrobj = d.data;
                    let userDetails: LoginUserModel = usrobj[0];

                    if (userDetails.status) {
                        this._loginModel.setUsers(userDetails);

                        if (userDetails.cmpid != 0 && userDetails.fy != 0) {
                            this._router.navigate(['/']);
                        } else if (userDetails.errcode === "chpwd") {
                            this._router.navigate(['/changepwd']);
                        } else {
                            this._router.navigate(['/usersettings/defaultcompandfy']);
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

    ngOnInit() {

    }
}
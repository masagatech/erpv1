import { Component, OnInit } from '@angular/core';
import { CompService } from '../_service/company/comp-service';
import { FYService } from '../_service/fy/fy-service';
import { UserService } from '../_service/user/user-service';
import { LoginUserModel } from '../_model/user_model';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'login-step1.comp.html',
    providers: [CompService, FYService]
})
export class LoginStep1Comp implements OnInit {
    fyid: number = 0;
    FYDetails: any = [];
    cmpid: number = 0;
    CompanyDetails: any = [];
    loginUser: LoginUserModel;
    btnLoginText: string = "";

    constructor(private _compservice: CompService, private _fyservice: FYService, private _userService: UserService,
        private _router: Router) {
        this.loginUser = this._userService.getUser();

        this.getCompanyDetails(this.loginUser.uid);
        this.btnLoginText = "Go";
    }

    ngOnInit() { }

    getFYDetails(cmpid) {
        var that = this;

        that._fyservice.getfy({ "flag": "usrcmpwise", "uid": this.loginUser.uid, "cmpid": cmpid }).subscribe(data => {
            that.FYDetails = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyDetails(uid) {
        var that = this;
        that._compservice.getCompany({ "flag": "usrwise", "uid": uid }).subscribe(data => {
            that.CompanyDetails = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    private next_click(e) {
        this.loginUser.cmpid = this.cmpid;
        this.loginUser.fyid = this.fyid;
        this._router.navigate(['/']);
    }
}
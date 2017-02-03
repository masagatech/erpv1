import { Component, OnInit } from '@angular/core';
import { CompService } from '../../../../_service/company/comp-service';
import { FYService } from '../../../../_service/fy/fy-service';
import { UserService } from '../../../../_service/user/user-service';
import { AuthenticationService } from '../../../../_service/auth-service'
import { LoginUserModel } from '../../../../_model/user_model';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'defcmpfy.comp.html',
    providers: [CompService, FYService]
})
export class DefCmpFyComp implements OnInit {
    fy: number = 0;
    FYDetails: any = [];
    cmpid: number = 0;
    CompanyDetails: any = [];
    loginUser: LoginUserModel;
    btnLoginText: string = "";

    constructor(private _compservice: CompService, private _fyservice: FYService, private _authservice: AuthenticationService, private _userService: UserService,
        private _router: Router) {
        this.loginUser = this._userService.getUser();

        var that = this;
        this.getCompanyDetails(this.loginUser.uid);
        this.btnLoginText = "Go";
    }

    ngOnInit() {
        // that._userService.getSettings({ "flag": "single", "uid": this.loginUser.uid }).subscribe(r => {
        //     var d = r.data;
        //     var isvalid = false;
        //     if (d.settings) {
        //         if (d.settings.fy && d.settings.cmpid) {
        //             this.loginUser.fy = d.settings.fy;
        //             this.loginUser.cmpid = d.settings.cmpid;
        //             isvalid = true;
        //         }
        //     }
        //     if (!isvalid) {
        //         this.getCompanyDetails(this.loginUser.uid);
        //     } else {
        //         that._router.navigate(['/']);
        //     }

        // }, err => {
        //     console.log("Error");
        // }, () => {
        //     // console.log("Complete");
        // })

        this.cmpid = this.loginUser.cmpid;
        this.getFYDetails(this.loginUser.cmpid);
        this.fy = this.loginUser.fy;
    }

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
        var that = this;
        this.loginUser.cmpid = this.cmpid;
        this.loginUser.fy = this.fy;
        
        this.loginUser.fyfrom = that.FYDetails.find(d => d.fyid == that.fy).fromdt;
        this.loginUser.fyto = that.FYDetails.find(d => d.fyid == that.fy).todt;
        var settings = [{ "key": "fy", "value": this.fy }, { "key": "cmpid", "value": this.cmpid }];
        this._userService.saveSettings({
            "uid": this.loginUser.uid, "cmpid": this.cmpid,
            settings, "userid": this.loginUser.login
        }).subscribe(d => {

            that._router.navigate(['/']);
        }, err => { }, () => { });


    }

    private logout() {
        this._authservice.logout();
    }
}
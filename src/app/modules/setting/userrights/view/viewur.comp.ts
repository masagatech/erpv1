import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for fy */
import { LoginUserModel } from '../../../../_model/user_model';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewur.comp.html',
    providers: [UserService]
})

export class ViewUserRights implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewUserDT: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _userservice: UserService) {
        this.loginUser = this._userservice.getUser();
        this.getUserRights();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getUserRights() {
        this._userservice.getUserRights({
            "flag": "view",
            "uid": 1,
            "cmpid": 2,
            "fyid": 7
            // "uid": this.loginUser.uid,
            // "cmpid": this.loginUser.cmpid,
            // "fyid": this.loginUser.fyid
        }).subscribe(data => {
            this.viewUserDT = data.data;
            console.log(this.viewUserDT);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    viewUserRights(row) {
        if (row.isopenur == 0) {
            row.isopenur = 1;
        } else {
            row.isopenur = 0;
        }
    }

    openUserRights(row) {
        this._router.navigate(['/setting/userrights/edit', row.UserID]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/userrights/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
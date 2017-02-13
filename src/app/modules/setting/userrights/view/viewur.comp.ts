import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for fy */
import { LoginUserModel } from '../../../../_model/user_model';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewur.comp.html',
    providers: [UserService]
})

export class ViewUserRights implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewUserDT: any[];
    totalRecords: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _userservice: UserService) {
        this.loginUser = this._userservice.getUser();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Setting > User Rights");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getUserRights(from: number, to: number) {
        this._userservice.getUserRights({
            "flag": "view", "uid": 1, "cmpid": 1, "fy": 1, "from": from, "to": to
            // "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(userrights => {
            this.totalRecords = userrights.data[1].recordstotal;
            this.viewUserDT = userrights.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    loadURGrid(event: LazyLoadEvent) {
        this.getUserRights(event.first, (event.first + event.rows));
    }

    // viewUserRights(row) {
    //     if (row.isopenur == 0) {
    //         row.isopenur = 1;
    //     } else {
    //         row.isopenur = 0;
    //     }
    // }

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
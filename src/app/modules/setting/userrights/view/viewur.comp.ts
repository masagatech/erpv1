import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewur.comp.html',
    providers: [UserService]
})

export class ViewUserRights implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewUserDT: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _userservice: UserService) {
        this.getUserRights();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getUserRights() {
        this._userservice.getUserRights({ "UserID": "", "FilterType": "" }).subscribe(data => {
            this.viewUserDT = JSON.parse(data.data);
            console.log(this.viewUserDT);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    viewCompanyDT(row) {
        if (row.IsCollapse == 0) {
            row.IsCollapse = 1;
            if (row.Details.length === 0) {
                this._userservice.getUserRights({ "UserID": row.UserID, "FilterType": "Details" }).subscribe(data => {
                    row.Details = JSON.parse(data.data);
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.IsCollapse = 0;
        }
    }

    openUserRights(row) {
        this._router.navigate(['/setting/edituserrights', row.UserID]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/adduserrights']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
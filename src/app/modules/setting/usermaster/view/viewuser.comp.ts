import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for view User */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewUser.comp.html',
    providers: [UserService]
})

export class ViewUser implements OnInit, OnDestroy {
    type: string = "";
    value: string = "";
    name: string = "";

    title: any;
    EmpName: any;
    autoEmpName: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewUserDT: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _userservice: UserService) {
        this.getUserData();
    }

    ngOnInit() {
        this.title = "View User";

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    selectedItem(e: any) {
        console.log(this.autoEmpName);
    }

    getUserData() {
        this._userservice.getUsers({ "flag": "" }).subscribe(data => {
            this.viewUserDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }    

    openUserDetails(row) {
        this._router.navigate(['/setting/edituser', row.uid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/adduser']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
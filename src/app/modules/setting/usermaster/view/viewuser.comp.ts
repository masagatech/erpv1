import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { LoginUserModel } from '../../../../_model/user_model';
import { UserService } from '../../../../_service/user/user-service' /* add reference for view User */
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewUser.comp.html',
    providers: [UserService]
})

export class ViewUser implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    type: string = "";
    value: string = "";
    name: string = "";

    title: any;
    EmpName: any;
    autoEmpName: any;

    viewUserDT: any[];
    totalRecords: number = 0;
    status: string = "";

    statusDT: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _userservice: UserService) {
        this.loginUser = this._userservice.getUser();
        this.fillStatusDropDown();
        this.resetFYFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Setting > User Master");
        this.title = "View User";

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillStatusDropDown() {
        var that = this;

        this._userservice.getMenuDetails({
            "flag": "trashrights", "ptype": "set", "mtype": "um",
            "uid": 1, "cmpid": 1, "fy": 1
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetFYFields() {
        this.status = "true";
    }

    getUserData(from: number, to: number) {
        this._userservice.getUsers({ "flag": "all", "from": from, "to": to, "isactive": this.status }).subscribe(users => {
            this.totalRecords = users.data[1][0].recordstotal;
            this.viewUserDT = users.data[0];
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadUserGrid(event: LazyLoadEvent) {
        this.getUserData(event.first, (event.first + event.rows));
    }

    searchUserData(dt: DataTable) {
        dt.reset();
    }

    openUserDetails(row) {
        this._router.navigate(['/setting/usermaster/edit', row.uid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/usermaster/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
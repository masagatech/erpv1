import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for view FY */
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewfy.comp.html',
    providers: [FYService]
})

export class ViewFY implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewFYDT: any[];
    totalRecords: number = 0;
    status: string = "";

    statusDT: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _fyservice: FYService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.resetFYFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Financial Year");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "set", "mtype": "fy",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
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

    getFYData(from: number, to: number) {
        var that = this;

        that._fyservice.getfy({
            "flag": "all", "from": from, "to": to, "isactive": that.status
        }).subscribe(fy => {
            that.totalRecords = fy.data[1][0].recordstotal;
            that.viewFYDT = fy.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    loadFYGrid(event: LazyLoadEvent) {
        this.getFYData(event.first, (event.first + event.rows));
    }

    searchFY(dt: DataTable) {
        dt.reset();
    }

    openFYDetails(row) {
        this._router.navigate(['/setting/fy/edit', row.fyid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/fy/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
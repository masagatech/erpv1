import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view budget */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewbdint.comp.html',
    providers: [BudgetService]
})

export class ViewInitiateComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewInitiateDT: any[];
    totalRecords: number = 0;
    status: string = "";

    statusDT: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _budgetservice: BudgetService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.resetInitiateFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Budget Initiate");
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

    resetInitiateFields() {
        this.status = "true";
    }

    getInitiate(from: number, to: number) {
        var that = this;

        that._budgetservice.getInitiate({
            "flag": "all", "from": from, "to": to, "isactive": that.status
        }).subscribe(initiate => {
            that.totalRecords = initiate.data[1][0].recordstotal;
            that.viewInitiateDT = initiate.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    loadInitiateGrid(event: LazyLoadEvent) {
        this.getInitiate(event.first, (event.first + event.rows));
    }

    searchInitiateDetails(dt: DataTable) {
        dt.reset();
    }

    openInitiate(row) {
        this._router.navigate(['/budget/initiate/details', row.bid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/budget/initiate/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
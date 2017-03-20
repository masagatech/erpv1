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
    templateUrl: 'viewbdcmt.comp.html',
    providers: [BudgetService]
})

export class ViewCommitteeComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewCommitteeDT: any = [];
    totalRecords: number = 0;
    status: string = "";

    search: string = "";
    statusDT: any = [];
    budgetDT: any = [];

    selectedbid: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _budgetservice: BudgetService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.fillBudgetDropDown();
        this.resetCommitteeFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Budget Committee");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "set", "mtype": "bdcmt",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    fillBudgetDropDown() {
        var that = this;

        that._budgetservice.getCommittee({ "flag": "dropdown", "search": that.search }).subscribe(data => {
            that.budgetDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    resetCommitteeFields() {
        this.status = "true";
    }

    getCommitteeMaster(row) {
        var that = this;

        that._budgetservice.getCommittee({
            "flag": "all", "bid": row.bid, "from": 0, "to": 10, "isactive": true
        }).subscribe(committee => {
            that.viewCommitteeDT = committee.data[0];
            that.selectedbid = row.bid;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getCommittee(from: number, to: number) {
        var that = this;

        that._budgetservice.getCommittee({
            "flag": "all", "from": from, "to": to, "isactive": true
        }).subscribe(committee => {
            that.totalRecords = committee.data[1][0].recordstotal;
            that.viewCommitteeDT = committee.data[0];
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadCommitteeGrid(event: LazyLoadEvent) {
        this.getCommittee(event.first, (event.first + event.rows));
    }

    searchCommittee(dt: DataTable) {
        dt.reset();
    }

    openCommittee() {
        this._router.navigate(['/budget/committee/details', this.selectedbid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/budget/committee/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
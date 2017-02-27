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
    templateUrl: 'viewbdowners.comp.html',
    providers: [BudgetService]
})

export class ViewOwnershipComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewOwnershipDT: any = [];
    totalRecords: number = 0;
    status: string = "";

    search: string = "";
    statusDT: any = [];
    pendingbudgetDT: any = [];
    allocatedbudgetDT: any = [];

    selectedbid: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _budgetservice: BudgetService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.fillBudgetDropDown();
        this.resetOwnershipFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Budget Ownership");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "set", "mtype": "bdown",
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

        that._budgetservice.getOwnership({ "flag": "dropdown", "search": that.search }).subscribe(data => {
            var budgetDT = data.data[0]._bdgddl;
            
            that.pendingbudgetDT = budgetDT.filter(a => a.countowners === 0);
            that.allocatedbudgetDT = budgetDT.filter(a => a.countowners !== 0);
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    resetOwnershipFields() {
        this.status = "true";
    }

    getOwnershipMaster(row) {
        var that = this;

        that._budgetservice.getOwnership({
            "flag": "all", "bid": row.bid, "from": 0, "to": 10, "isactive": true
        }).subscribe(Ownership => {
            that.viewOwnershipDT = Ownership.data[0];
            that.selectedbid = row.bid;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getOwnership(from: number, to: number) {
        var that = this;

        that._budgetservice.getOwnership({
            "flag": "all", "from": from, "to": to, "isactive": true
        }).subscribe(Ownership => {
            that.totalRecords = Ownership.data[1][0].recordstotal;
            that.viewOwnershipDT = Ownership.data[0];
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadOwnershipGrid(event: LazyLoadEvent) {
        this.getOwnership(event.first, (event.first + event.rows));
    }

    searchOwnership(dt: DataTable) {
        dt.reset();
    }

    openOwnership() {
        this._router.navigate(['/budget/ownership/details', this.selectedbid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/budget/ownership/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
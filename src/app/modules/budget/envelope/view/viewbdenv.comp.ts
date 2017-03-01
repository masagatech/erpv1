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
    templateUrl: 'viewbdenv.comp.html',
    providers: [BudgetService]
})

export class ViewEnvelopeComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewEnvelopeDT: any = [];
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
        this.resetEnvelopeFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Budget Envelope");
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

        that._budgetservice.getEnvelope({ "flag": "dropdown", "search": that.search }).subscribe(data => {
            var budgetDT = data.data;
            that.pendingbudgetDT = budgetDT.filter(a => a.countenv === "0");
            that.allocatedbudgetDT = budgetDT.filter(a => a.countenv !== "0");
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    resetEnvelopeFields() {
        this.status = "true";
    }

    getEnvelopeMaster(row) {
        var that = this;

        that._budgetservice.getEnvelope({
            "flag": "all", "bid": row.bid, "from": 0, "to": 10, "isactive": that.status
        }).subscribe(Envelope => {
            that.viewEnvelopeDT = Envelope.data[0];
            that.selectedbid = row.bid;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getEnvelope(from: number, to: number) {
        var that = this;

        that._budgetservice.getEnvelope({
            "flag": "all", "from": from, "to": to, "isactive": true
        }).subscribe(Envelope => {
            that.totalRecords = Envelope.data[1][0].recordstotal;
            that.viewEnvelopeDT = Envelope.data[0];
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadEnvelopeGrid(event: LazyLoadEvent) {
        this.getEnvelope(event.first, (event.first + event.rows));
    }

    searchEnvelope(dt: DataTable) {
        dt.reset();
    }

    openEnvelope(row) {
        this._router.navigate(['/budget/envelope/details', row.beid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/budget/envelope/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
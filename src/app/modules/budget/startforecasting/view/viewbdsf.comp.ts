import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view budget */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { MessageService, messageType } from "../../../../_service/messages/message-service";

@Component({
    templateUrl: 'viewbdsf.comp.html',
    providers: [BudgetService]
})

export class ViewStartForecastingComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewEnvelopeDT: any = [];
    totalRecords: number = 0;

    search: string = "";
    ctrlcenterDT: any = [];
    bdginitiateDT: any = [];
    bdgtypeDT: any = [];
    bdgstatusDT: any = [];
    statusDT: any = [];
    financialmonthDT: any = [];

    bid: number = 0;
    bdgtype: string = "";
    bdgstatus: string = "";
    status: boolean = false;

    viewSFDT: any = [];

    selectedbid: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _budgetservice: BudgetService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillDropDownList();
        this.fillStatusDropDown();
        this.resetFilterFields();
        this.BindFinancialMonthDT();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Budget Start Forecasting");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/budget/startforecasting/add']);
        }
    }

    BindFinancialMonthDT() {
        var that = this;

        that._budgetservice.getExpenseBudget({
            "flag": "monthhead", "fy": that.loginUser.fy, "bid": that.bid
        }).subscribe(data => {
            that.financialmonthDT = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    resetFilterFields() {
        this.bid = 0;
        this.bdgtype = "";
        this.bdgstatus = "";
        this.status = true;
    }

    fillDropDownList() {
        var that = this;

        that._budgetservice.viewStartForeCasting({ "flag": "dropdown" }).subscribe(data => {
            that.bdginitiateDT = data.data[0];
            that.bdgstatusDT = data.data[1][0]._statusddl;
            that.bdgtypeDT = data.data[1][0]._bdgtypeddl;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "bdg", "mtype": "bdsf",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    getSFDetails(from: number, to: number) {
        var that = this;

        that._budgetservice.viewStartForeCasting({
            "flag": "ctrlcenter", "bid": that.bid, "status": that.bdgstatus, "isactive": that.status, "from": from, "to": to
        }).subscribe(sf => {
            that.totalRecords = sf.data[1].recordstotal;
            that.viewSFDT = sf.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadSFGrid(event: LazyLoadEvent) {
        this.getSFDetails(event.first, (event.first + event.rows));
    }

    expandCCWise(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            this._budgetservice.viewStartForeCasting({
                "flag": "envelope", "bid": that.bid, "ccid": event.ccid, "status": that.bdgstatus, "isactive": that.status
            }).subscribe(details => {
                var dataset = details.data;

                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
                    return;
                }
            }, err => {
                this._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            })
        } catch (error) {

        }
    }

    expandSubItemWise(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            this._budgetservice.viewStartForeCasting({
                "flag": "subitems", "bid": that.bid, "ccid": event.ccid, "envid": event.envid, "status": that.bdgstatus, "isactive": that.status
            }).subscribe(details => {
                var dataset = details.data;

                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
                    return;
                }
            }, err => {
                this._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            })
        } catch (error) {

        }
    }

    BindControlCenterDT() {
        var that = this;

        that._budgetservice.getExpenseBudget({
            "flag": "ccval", "uid": that.loginUser.uid, "fy": that.loginUser.fy, "bid": that.bid
        }).subscribe(data => {
            that.ctrlcenterDT = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    ExpandEnvelopeTypeDT(row) {
        var that = this;

        if (row.issh == 0) {
            row.issh = 1;

            if (row.envtitledt.length === 0) {
                that._budgetservice.getExpenseBudget({
                    "flag": "envtitle", "fy": that.loginUser.fy, "bid": that.bid, "ccid": row.ccid, "uid": that.loginUser.uid
                }).subscribe(data => {
                    row.envtitledt = data.data;
                }, err => {
                    that._msg.Show(messageType.error, "Error", err);
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.issh = 0;
        }
    }

    ExpandExpenseBudgetDT(etrow) {
        var that = this;

        if (etrow.issh == 0) {
            etrow.issh = 1;

            if (etrow.subitemsdt.length === 0) {
                that._budgetservice.getExpenseBudget({
                    "flag": "subitems", "fy": that.loginUser.fy, "bid": that.bid, "beid": etrow.envid, "ccid": etrow.ccid, "uid": that.loginUser.uid
                }).subscribe(data => {
                    etrow.subitemsdt = data.data;
                }, err => {
                    that._msg.Show(messageType.error, "Error", err);
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            etrow.issh = 0;
        }
    }

    totalAmtEnvelopeWise(ccrow) {
        var MonthAmtTotal = 0;

        for (var i = 0; i < ccrow.envtitledt.length; i++) {
            var monthdtls = ccrow.envtitledt[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                MonthAmtTotal += parseInt(monthdtls[j].monthvalue);
            }
        }

        return MonthAmtTotal;
    }

    getTotalCCWise(colindex) {
        var colTotal = 0.00, _rowTotal = 0.00;

        for (var cc = 0; cc <= this.ctrlcenterDT.length - 1; cc++) {
            var monthdetails = this.ctrlcenterDT[cc].monthdetails;

            colTotal += parseFloat(monthdetails[colindex].monthvalue);
        }

        return colTotal;
    }

    getTotalAllAmount() {
        var MonthAmtTotal = 0;

        for (var i = 0; i < this.ctrlcenterDT.length; i++) {
            var monthdtls = this.ctrlcenterDT[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                MonthAmtTotal += parseFloat(monthdtls[j].monthvalue);
            }
        }

        return MonthAmtTotal;
    }

    searchSFDetails(dt: DataTable) {
        if (this.bdgtype === "12") {
            dt.reset();
        }
        else{
            this.BindControlCenterDT();
        }
    }

    openSFDetails(row) {
        this._router.navigate(['/budget/startforecasting/details', row.beid]);
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
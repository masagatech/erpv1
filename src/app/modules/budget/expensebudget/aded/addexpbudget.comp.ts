import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../../../_service/common/common-service" /* add reference for master of master */
import { ExpBudgetService } from "../../../../_service/expensebudget/expbudget-service" /* add reference for Expense Budget */
import { MessageService, messageType } from "../../../../_service/messages/message-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: "addexpbudget.comp.html",
    providers: [CommonService, ExpBudgetService]
})

export class AddExpenseBudgetComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    bdginitiateDT: any = [];
    ctrlcenterDT: any = [];
    statusDT: any = [];
    financialmonthDT: any = [];
    envtypeDT: any = [];
    expbudgetDT: any = [];

    title: string = "";
    id: number = 0;
    bid: number = 0;
    ccid: number = 0;
    status: string = "";
    narration: string = "";

    docno: number = 0;

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _expbudgetservice: ExpBudgetService, private _message: MessageService,
        private _userService: UserService) {

        this.loginUser = this._userService.getUser();
        this.module = "Expense Budget";

        this.fillDropDownList();
        //this.fillCtrlCenterDDL();
        this.BindFinancialMonthDT();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.setActionButtons.setTitle("Start Forecasting");

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillDropDownList() {
        var that = this;

        that._expbudgetservice.getExpenseBudget({ "flag": "dropdown" }).subscribe(data => {
            that.bdginitiateDT = data.data[0]._bdgddl;
            that.statusDT = data.data[0]._statusddl;
        }, err => {
            that._message.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    fillCtrlCenterDDL() {
        var that = this;

        that._expbudgetservice.getExpenseBudget({ "flag": "dropdown", "bid": that.bid }).subscribe(data => {
            that.ctrlcenterDT = data.data[0]._ccddl;
        }, err => {
            that._message.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    BindFinancialMonthDT() {
        var that = this;

        that._expbudgetservice.getExpenseBudget({
            "flag": "monthhead", "fy": that.loginUser.fy, "bid": that.bid, "ccid": that.ccid
        }).subscribe(data => {
            that.financialmonthDT = data.data;
        }, err => {
            that._message.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    BindControlCenterDT() {
        var that = this;

        that._expbudgetservice.getExpenseBudget({
            "flag": "ccval", "fy": that.loginUser.fy, "bid": that.bid
        }).subscribe(data => {
            that.ctrlcenterDT = data.data;
        }, err => {
            that._message.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })

        this.getAmtMonthWise();
    }

    ExpandEnvelopeTypeDT(row) {
        var that = this;

        if (row.issh == 0) {
            row.issh = 1;

            if (row.envtitledt.length === 0) {
                that._expbudgetservice.getExpenseBudget({
                    "flag": "envtitle", "fy": that.loginUser.fy, "bid": that.bid, "ccid": row.ccid
                }).subscribe(data => {
                    row.envtitledt = data.data;
                }, err => {
                    that._message.Show(messageType.error, "Error", err);
                }, () => {
                    // console.log("Complete");
                })
            }

            this.getAmtMonthWise();
        } else {
            row.issh = 0;
        }
    }

    ExpandExpenseBudgetDT(row) {
        var that = this;

        if (row.issh == 0) {
            row.issh = 1;

            if (row.subitemsdt.length === 0) {
                that._expbudgetservice.getExpenseBudget({
                    "flag": "subitems", "fy": that.loginUser.fy, "beid": row.beid
                }).subscribe(data => {
                    row.subitemsdt = data.data;
                }, err => {
                    that._message.Show(messageType.error, "Error", err);
                }, () => {
                    // console.log("Complete");
                })
            }

            this.getAmtMonthWise();
        } else {
            row.issh = 0;
        }
    }

    copyAcrossRow() {
        for (var i = 0; i < this.expbudgetDT.length; i++) {
            var monthdtls = this.expbudgetDT[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                monthdtls[j].monthvalue = monthdtls[0].monthvalue;
            }
        }
    }

    copyAcrossGrid() {
        for (var i = 0; i < this.expbudgetDT.length; i++) {
            var monthdtls = this.expbudgetDT[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                monthdtls[j].monthvalue = this.expbudgetDT[0].monthdetails[0].monthvalue;
            }
        }
    }

    totalAllAmount() {
        var MonthAmtTotal = 0;

        for (var i = 0; i < this.expbudgetDT.length; i++) {
            var monthdtls = this.expbudgetDT[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                MonthAmtTotal += parseInt(monthdtls[j].monthvalue);
            }
        }

        return MonthAmtTotal;
    }

    amtMonthWise: any = [];

    getAmtMonthWise() {
        var that = this;

        that._expbudgetservice.getExpenseBudget({
            "flag": "addedit", "bid": this.bid, "ccid": that.ccid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.amtMonthWise = data.data[2];
        });
    }

    // totalAmtMonthWise(row) {
    //     var MonthAmtTotal = 0;
    //     var that = this;

    //     MonthAmtTotal += parseInt(row.monthvalue);

    //     return MonthAmtTotal;
    // }

    totalAmtYearWise(row) {
        var MonthAmtTotal = 0;

        for (var i = 0; i < row.monthdetails.length; i++) {
            MonthAmtTotal += parseInt(row.monthdetails[i].monthvalue);
        }

        return MonthAmtTotal;
    }

    saveExpenseBudget() {
        var that = this;
        var monthpriceDT: any = [];
        var monthDetailsDT: any = [];
        var expbDetails: any = [];
        var monthname: string = "";
        var monthvalue: string = "";
        var jsonval: string = "";

        var jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec;

        for (var a = 0; a < that.expbudgetDT.length; a++) {
            for (var c = 0; c < that.financialmonthDT.length; c++) {
                monthname = that.financialmonthDT[c].monthname;
                monthvalue = that.expbudgetDT[a].monthdetails[c].monthvalue;

                jsonval += '"' + monthname.trim() + '":  "' + monthvalue + '",';
            }

            monthpriceDT.push(JSON.parse("{" + jsonval.substring(0, jsonval.length - 1) + "}"));

            expbDetails.push({
                "sfid": that.expbudgetDT[a].sfid,
                "bid": that.bid,
                "ccid": that.ccid,
                "envid": that.expbudgetDT[a].envid,
                "jan": monthpriceDT[a].jan,
                "feb": monthpriceDT[a].feb,
                "mar": monthpriceDT[a].mar,
                "apr": monthpriceDT[a].apr,
                "may": monthpriceDT[a].may,
                "jun": monthpriceDT[a].jun,
                "jul": monthpriceDT[a].jul,
                "aug": monthpriceDT[a].aug,
                "sep": monthpriceDT[a].sep,
                "oct": monthpriceDT[a].oct,
                "nov": monthpriceDT[a].nov,
                "dec": monthpriceDT[a].dec,
                "status": that.status,
                "narration": that.narration,
                "uidcode": that.loginUser.login
            })
        }

        var saveEB = {
            "expensebudget": expbDetails
        }

        that._expbudgetservice.saveExpenseBudget(saveEB).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_expensebudget.msgid != "-1") {
                that._message.Show(messageType.success, "Confirmed", dataResult[0].funsave_expensebudget.msg.toString());
            }
            else {
                that._message.Show(messageType.error, "Error", dataResult[0].funsave_expensebudget.msg.toString());
            }
        }, err => {
            that._message.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveExpenseBudget();
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
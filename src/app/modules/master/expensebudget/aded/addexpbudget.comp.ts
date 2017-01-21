import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../../../_service/common/common-service" /* add reference for master of master */
import { ExpBudgetService } from "../../../../_service/expenseBudget/expBudget-service" /* add reference for Expense Budget */
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

    ctrlcenterDT: any = [];
    financialmonthDT: any = [];
    expbudgetDT: any = [];

    title: string = "";
    id: number = 0;
    ccid: number = 0;

    docno: number = 0;

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _expbudgetservice: ExpBudgetService, private _message: MessageService,
        private _userService: UserService) {

        this.loginUser = this._userService.getUser();
        this.module = "Expense Budget";

        this.BindFinancialMonthDT();
        this.fillControlCenterDDL();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params["docno"] !== undefined) {
                this.title = "Expesne Budget : Edit";
                this.docno = params["docno"];
            }
            else {
                this.title = "Expesne Budget : Add";
            }
        });
    }

    fillControlCenterDDL() {
        var that = this;

        that._commonservice.getAutoData({ "type": "ctrlddl" }).subscribe(data => {
            that.ctrlcenterDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    BindExpenseBudgetDT() {
        var that = this;

        that._expbudgetservice.getAllExpenseBudget({
            "flag": "addedit", "ccid": that.ccid, "cmpid": this.loginUser.cmpid, "fyid": this.loginUser.fyid
        }).subscribe(data => {
            that.expbudgetDT = data.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })

        this.getAmtMonthWise();
    }

    BindFinancialMonthDT() {
        var that = this;

        that._expbudgetservice.getAllExpenseBudget({
            "flag": "addedit", "ccid": that.ccid, "fyid": that.loginUser.fyid
        }).subscribe(data => {
            that.financialmonthDT = data.data[1];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
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

        that._expbudgetservice.getAllExpenseBudget({
            "flag": "addedit", "ccid": that.ccid, "cmpid": this.loginUser.cmpid, "fyid": this.loginUser.fyid
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
                "expbid": that.expbudgetDT[a].expbid,
                "cmpid": this.loginUser.cmpid,
                "fyid": this.loginUser.fyid,
                "ccid": this.ccid,
                "expheadid": that.expbudgetDT[a].expheadid,
                "exptype": that.expbudgetDT[a].exptype,
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
                "uidcode": this.loginUser.login
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
                alert("Error");
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this._message.confirm("Are you sure that you want to save?", () => {
                this.saveExpenseBudget();
            });
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
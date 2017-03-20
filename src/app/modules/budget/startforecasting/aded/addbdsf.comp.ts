import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from "../../../../_model/action_buttons";
import { Subscription } from "rxjs/Subscription";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../../../_service/common/common-service" /* add reference for master of master */
import { BudgetService } from '../../../../_service/budget/budget-service'; /* add reference for view budget */
import { MessageService, messageType } from "../../../../_service/messages/message-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: "addbdsf.comp.html",
    providers: [CommonService, BudgetService]
})

export class AddStartForecastingComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    bdginitiateDT: any = [];
    ctrlcenterDT: any = [];
    statusDT: any = [];
    financialmonthDT: any = [];
    envtypeDT: any = [];

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
        private _commonservice: CommonService, private _budgetservice: BudgetService, private _msg: MessageService,
        private _userService: UserService) {

        this.loginUser = this._userService.getUser();
        this.module = "Expense Budget";

        this.fillDropDownList();
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

        that._budgetservice.getExpenseBudget({ "flag": "dropdown" }).subscribe(data => {
            that.bdginitiateDT = data.data[0]._bdgddl;
            that.statusDT = data.data[0]._statusddl;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    BindFinancialMonthDT() {
        var that = this;

        that._budgetservice.getExpenseBudget({
            "flag": "monthhead", "fy": that.loginUser.fy, "bid": that.bid, "ccid": that.ccid
        }).subscribe(data => {
            that.financialmonthDT = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
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

        this.getAmtMonthWise();
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

            this.getAmtMonthWise();
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

            this.getAmtMonthWise();
        } else {
            etrow.issh = 0;
        }
    }

    copyAcrossRow() {
        for (var i = 0; i < this.ctrlcenterDT.length; i++) {
            var monthdtls = this.ctrlcenterDT[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                monthdtls[j].monthvalue = monthdtls[0].monthvalue;
            }
        }
    }

    copyAcrossGrid() {
        for (var i = 0; i < this.ctrlcenterDT.length; i++) {
            var monthdtls = this.ctrlcenterDT[i].monthdetails;

            for (var j = 0; j < monthdtls.length; j++) {
                monthdtls[j].monthvalue = this.ctrlcenterDT[0].monthdetails[0].monthvalue;
            }
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

    getTotalEnvWise(event, ccrow, etrow, colindex) {
        var colTotal = 0.00, _rowTotal = 0.00;
        var envTitels = ccrow.envtitledt;

        for (var cc = 0; cc <= envTitels.length - 1; cc++) {
            var cc_1details = envTitels[cc].monthdetails;
            colTotal += parseFloat(cc_1details[colindex].monthvalue);
        }

        for (var cc_1 = 0; cc_1 <= etrow.monthdetails.length - 1; cc_1++) {
            _rowTotal += parseFloat(etrow.monthdetails[cc_1].monthvalue);
        }

        ccrow.monthdetails[colindex].monthvalue = colTotal;
        etrow.rowTotal = _rowTotal;
    }

    getTotalSubItemWise(event, ccrow, etrow, sirow, colindex) {
        var colTotal = 0.00, _rowTotal = 0.00;
        var envItems = etrow.subitemsdt;

        for (var cc = 0; cc <= envItems.length - 1; cc++) {
            var cc_1details = envItems[cc].monthdetails;
            colTotal += parseFloat(cc_1details[colindex].monthvalue);
        }

        for (var cc_1 = 0; cc_1 <= sirow.monthdetails.length - 1; cc_1++) {
            _rowTotal += parseFloat(sirow.monthdetails[cc_1].monthvalue);
        }

        etrow.monthdetails[colindex].monthvalue = colTotal;
        sirow.rowTotal = _rowTotal;

        this.getTotalEnvWise(event, ccrow, etrow, colindex);
    }

    amtMonthWise: any = [];

    getAmtMonthWise() {
        var that = this;

        that._budgetservice.getExpenseBudget({
            "flag": "subitems", "bid": this.bid, "ccid": that.ccid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.amtMonthWise = data.data[2];
        });
    }

    saveExpenseBudget() {
        var that = this;

        if (that.bid === 0) {
            that._msg.Show(messageType.error, "Error", "Please select Budget");
            return;
        }

        if (that.status === "") {
            that._msg.Show(messageType.error, "Error", "Please select Status");
            return;
        }

        if (that.narration === "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Narration");
            return;
        }

        var monthpriceDT: any = [];
        var monthDetailsDT: any = [];
        var expbDetails: any = [];
        var monthname: string = "";
        var ccmvalue: string = "";
        var etmvalue: string = "";
        var simvalue: string = "";

        var ccmjson: string = "";
        var etmjson: string = "";
        var simjson: string = "";

        //var jsonval: string = "";

        var etrowdt: any = [];
        var sirowdt: any = [];

        for (var a = 0; a < that.ctrlcenterDT.length; a++) {
            etrowdt = that.ctrlcenterDT[a].envtitledt;

            for (var b = 0; b < etrowdt.length; b++) {
                sirowdt = etrowdt[b].subitemsdt;

                for (var c = 0; c < sirowdt.length; c++) {
                    for (var d = 0; d < that.financialmonthDT.length; d++) {
                        monthname = that.financialmonthDT[d].monthname;

                        ccmvalue = that.ctrlcenterDT[a].monthdetails[d].monthvalue;
                        etmvalue = etrowdt[b].monthdetails[d].monthvalue;
                        simvalue = sirowdt[c].monthdetails[d].monthvalue;

                        ccmjson += '"' + monthname.trim() + '":"' + ccmvalue + '", "ccid":"' + that.ctrlcenterDT[a].ccid + '", "envid":"0", "subitem":"",';
                        etmjson += '"' + monthname.trim() + '":"' + etmvalue + '", "ccid":"' + etrowdt[b].ccid + '", "envid":"' + etrowdt[b].envid + '", "subitem":"",';
                        simjson += '"' + monthname.trim() + '":"' + simvalue + '", "ccid":"' + sirowdt[c].ccid + '", "envid":"' + sirowdt[c].envid + '", "subitem":"' + sirowdt[c].subitem + '",';
                    }

                    monthpriceDT.push({
                        "ccdt": JSON.parse("{" + ccmjson.substring(0, ccmjson.length - 1) + "}"),
                        "etmdt": JSON.parse("{" + etmjson.substring(0, etmjson.length - 1) + "}"),
                        "simdt": JSON.parse("{" + simjson.substring(0, simjson.length - 1) + "}")
                    });

                    //monthpriceDT.push(JSON.parse("{" + jsonval.substring(0, jsonval.length - 1) + "}"));
                    //console.log(monthpriceDT);
                }
            }
        }

        for (var md = 0; md < monthpriceDT.length; md++) {
            expbDetails.push({
                "sfid": 0,
                "bid": that.bid,
                "ccid": monthpriceDT[md].ccdt.ccid,
                "envid": monthpriceDT[md].ccdt.envid,
                "subitem": monthpriceDT[md].ccdt.subitem,
                "jan": monthpriceDT[md].ccdt.jan,
                "feb": monthpriceDT[md].ccdt.feb,
                "mar": monthpriceDT[md].ccdt.mar,
                "apr": monthpriceDT[md].ccdt.apr,
                "may": monthpriceDT[md].ccdt.may,
                "jun": monthpriceDT[md].ccdt.jun,
                "jul": monthpriceDT[md].ccdt.jul,
                "aug": monthpriceDT[md].ccdt.aug,
                "sep": monthpriceDT[md].ccdt.sep,
                "oct": monthpriceDT[md].ccdt.oct,
                "nov": monthpriceDT[md].ccdt.nov,
                "dec": monthpriceDT[md].ccdt.dec,
                "status": that.status,
                "narration": that.narration,
                "uidcode": that.loginUser.login
            });

            expbDetails.push({
                "sfid": 0,
                "bid": that.bid,
                "ccid": monthpriceDT[md].etmdt.ccid,
                "envid": monthpriceDT[md].etmdt.envid,
                "subitem": monthpriceDT[md].etmdt.subitem,
                "jan": monthpriceDT[md].etmdt.jan,
                "feb": monthpriceDT[md].etmdt.feb,
                "mar": monthpriceDT[md].etmdt.mar,
                "apr": monthpriceDT[md].etmdt.apr,
                "may": monthpriceDT[md].etmdt.may,
                "jun": monthpriceDT[md].etmdt.jun,
                "jul": monthpriceDT[md].etmdt.jul,
                "aug": monthpriceDT[md].etmdt.aug,
                "sep": monthpriceDT[md].etmdt.sep,
                "oct": monthpriceDT[md].etmdt.oct,
                "nov": monthpriceDT[md].etmdt.nov,
                "dec": monthpriceDT[md].etmdt.dec,
                "status": that.status,
                "narration": that.narration,
                "uidcode": that.loginUser.login
            });

            expbDetails.push({
                "sfid": 0,
                "bid": that.bid,
                "ccid": monthpriceDT[md].simdt.ccid,
                "envid": monthpriceDT[md].simdt.envid,
                "subitem": monthpriceDT[md].simdt.subitem,
                "jan": monthpriceDT[md].simdt.jan,
                "feb": monthpriceDT[md].simdt.feb,
                "mar": monthpriceDT[md].simdt.mar,
                "apr": monthpriceDT[md].simdt.apr,
                "may": monthpriceDT[md].simdt.may,
                "jun": monthpriceDT[md].simdt.jun,
                "jul": monthpriceDT[md].simdt.jul,
                "aug": monthpriceDT[md].simdt.aug,
                "sep": monthpriceDT[md].simdt.sep,
                "oct": monthpriceDT[md].simdt.oct,
                "nov": monthpriceDT[md].simdt.nov,
                "dec": monthpriceDT[md].simdt.dec,
                "status": that.status,
                "narration": that.narration,
                "uidcode": that.loginUser.login
            });
        }

        console.log(expbDetails);

        var saveEB = {
            "startforecasting": expbDetails
        }

        that._budgetservice.saveExpenseBudget(saveEB).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_startforecasting.msgid != "-1") {
                that._msg.Show(messageType.success, "Confirmed", dataResult[0].funsave_startforecasting.msg.toString());
            }
            else {
                that._msg.Show(messageType.error, "Error", dataResult[0].funsave_startforecasting.msg.toString());
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
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
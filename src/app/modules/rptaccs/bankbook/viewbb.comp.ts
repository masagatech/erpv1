import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { ReportsService } from '../../../_service/reports/rpt-service' /* add reference for reports */
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'viewbb.comp.html',
    providers: [ReportsService]
})

export class ViewBankBook implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // Veriable Declare
    bankid: string = "";
    group: string = "nonreco";
    isviewnarr: boolean = true;

    enterdate: any = "";

    bankDT: any = [];
    bankwiseDT: any = [];
    monthwiseDT: any = [];

    fromdt: string = "";
    todt: string = "";

    gridTotal: any = {
        OpeningBalTotal: 0, BankDebitAmtTotal: 0, BankCreditAmtTotal: 0, MonthDebitAmtTotal: 0, MonthCreditAmtTotal: 0
    };

    // Page Init

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _rptservice: ReportsService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillDropDownList();
    }

    // Page Load

    ngOnInit() {
        // if (this.monthwiseDT.length !== 0) {
        //     this.enterdate.initialize(this.loginUser);
        //     this.enterdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        //     var date = new Date();
        //     this.enterdate.setDate(date);
        // }

        this.setActionButtons.setTitle("Bank Book");

        var actbtn = [];
        actbtn.push(new ActionBtnProp("print", "Print", "save", true, false));
        actbtn.push(new ActionBtnProp("exppdf", "Export to PDF", "exppdf", true, false));
        actbtn.push(new ActionBtnProp("expexcel", "Export to Excel", "save", true, false));

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, true));
        this.actionButton.push(new ActionBtnProp("download", "Export", "download", true, false, actbtn));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "exppdf") {
            if (this.bankid !== "") {
                var query = { "flag": "bankwise", "bankid": this.bankid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy, "uid": this.loginUser.uid };
                var param = $.param(query);
                var url = "http://localhost:3006/bankbook?" + param;
                commonfun.openurl(url, "_blank");
            }
            else {
                this._msg.Show(messageType.error, "Error", "Please select Bank");
            }
        } else if (evt === "back") {
            this.monthwiseDT = [];
            this.actionButton.find(a => a.id === "back").hide = true;
        }
    }

    // DropDown for Bank

    fillDropDownList() {
        var that = this;

        that._rptservice.getBankBook({
            "flag": "dropdown", "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy, "uid": that.loginUser.uid
        }).subscribe(data => {
            that.bankDT = data.data[0]._bank;
        });
    }

    // View Bank Wiae Bank Book

    GetBankWiseGrid() {
        var that = this;
        that.bankwiseDT = [];
        commonfun.loader();

        that._rptservice.getBankBook({
            "flag": "bankwise", "bankid": that.bankid, "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy, "uid": that.loginUser.uid
        }).subscribe(bankbook => {
            if (bankbook.data.length > 0) {
                that.bankwiseDT = bankbook.data;
                that.TotalAmountBankWise();
                that.monthwiseDT = [];
            }
            else {
                //that._msg.Show(messageType.info, "Info", "No bookrds found");
                that.bankwiseDT = [];
                return false;
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    filterBankWiseGrid() {
        if (this.bankid !== "") {
            this.GetBankWiseGrid();
        }
        else {
            this._msg.Show(messageType.error, "Error", "Please select Bank");
        }
    }

    // Get Month Wise Bank Book

    GetMonthWiseGrid(row) {
        var that = this;
        commonfun.loader();

        that._rptservice.getBankBook({
            "flag": that.group, "bankid": that.bankid, "fromdt": row.fromdt, "todt": row.todt,
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid
        }).subscribe(bankbook => {
            if (bankbook.data.length > 0) {
                that.monthwiseDT = bankbook.data;
                that.actionButton.find(a => a.id === "back").hide = false;
                that.TotalAmountMonthWise();
            }
            else {
                that.monthwiseDT = [];
                this._msg.Show(messageType.error, "Error", "No any " + that.group === "nonreco" ? "Non Reco" : "Reco" + " Data");
                return false;
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    TotalAmountBankWise() {
        var that = this;
        that.gridTotal = {
            BankDebitAmtTotal: 0, BankCreditAmtTotal: 0, MonthDebitAmtTotal: 0, MonthCreditAmtTotal: 0,
            ClosingBalTotal: 0, countbook: 0, notcountbook: 0
        };

        for (var i = 0; i < this.bankwiseDT.length; i++) {
            var items = this.bankwiseDT[i];
            if (i < this.bankwiseDT.length - 1) {
                var nextRow = this.bankwiseDT[i + 1];
                nextRow.openingbal = parseFloat(items.closingbal);
                nextRow.closingbal = (parseFloat(nextRow.openingbal) + parseFloat(nextRow.dramt)) - parseFloat(nextRow.cramt);
            }

            that.gridTotal.OpeningBalTotal += parseFloat(items.openingbal);
            that.gridTotal.BankDebitAmtTotal += parseFloat(items.dramt);
            that.gridTotal.BankCreditAmtTotal += parseFloat(items.cramt);
            that.gridTotal.ClosingBalTotal += parseFloat(items.closingbal);
        }
    }

    TotalAmountMonthWise() {
        var that = this;
        that.gridTotal = {
            BankDebitAmtTotal: 0, BankCreditAmtTotal: 0, MonthDebitAmtTotal: 0, MonthCreditAmtTotal: 0,
            ClosingBalTotal: 0, countbook: 0, notcountbook: 0
        };

        for (var i = 0; i < this.monthwiseDT.length; i++) {
            var items = this.monthwiseDT[i];
            that.gridTotal.MonthDebitAmtTotal += parseFloat(items.dramt);
            that.gridTotal.MonthCreditAmtTotal += parseFloat(items.cramt);
        }
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
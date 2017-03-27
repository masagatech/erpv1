import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { ReportsService } from '../../../_service/reports/rpt-service' /* add reference for emp */
import { Schedule } from 'primeng/primeng';

@Component({
    templateUrl: 'viewbv.comp.html',
    providers: [ReportsService]
})

export class BankViewReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;
    viewaparDT: any = [];
    fliterBankDT: any = [];
    fliterBankTypeDT: any = [];
    fliterAPARDT: any = [];
    monthwiseapar: any = [];

    events: any[];
    header: any;
    event: MyEvent;

    defaultDate: any = "";
    searchparty: string = "";

    rowheader: string = "";
    rowname: string = "";
    rowdate: string = "";

    isdebug: boolean = false;

    selectedAll: boolean = true;
    selectedAPARType: string[] = [];
    selectedBankType: string[] = [];
    selectedBank: string[] = [];

    calendarSelectedRow: any = [];
    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
        this.getDefaultDate();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Bank View");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(this.actionButton);

        that.header = {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,filterevt'
        };
    }

    // For Debug

    debug(log: any): any {
        if (this.isdebug)
            console.log(log);
    }

    // Select All Checkbox for View All AP/AR Data

    selectAllCheckboxes() {
        var that = this;

        if (that.selectedAll === true) {
            that.selectedAPARType = Object.keys(that.fliterAPARDT).map(function (k) { return that.fliterAPARDT[k].key });
            that.selectedBankType = Object.keys(that.fliterBankTypeDT).map(function (k) { return that.fliterBankTypeDT[k].key });
            that.selectedBank = Object.keys(that.fliterBankDT).map(function (k) { return that.fliterBankDT[k].key });
        }
        else {
            that.selectedAPARType = [];
            that.selectedBankType = [];
            that.selectedBank = [];
        }
    }

    // Formatted Date

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Get Default Date for View Events Calendar

    getDefaultDate() {
        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.defaultDate = this.formatDate(today);
    }

    // For View Data on Events Calendar

    getAPARDropDown(row) {
        var that = this;

        that._rptservice.getAPARReports({
            "flag": "dropdown", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid, "monthname": row.view.title
        }).subscribe(data => {
            try {
                that.fliterAPARDT = data.data[0]._apartype;
                that.fliterBankDT = data.data[0]._bank;
                that.fliterBankTypeDT = data.data[0]._banktype;

                that.selectedAPARType = Object.keys(that.fliterAPARDT).map(function (k) { return that.fliterAPARDT[k].key });
                that.selectedBank = Object.keys(that.fliterBankDT).map(function (k) { return that.fliterBankDT[k].key });
                that.selectedBankType = Object.keys(that.fliterBankTypeDT).map(function (k) { return that.fliterBankTypeDT[k].key });

                that.getAPARReports(row);
                that.getMonthWiseAPAR(row);
            }
            catch (e) {
                //that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    getAPARReports(row) {
        this.calendarSelectedRow = row;
        this.events = [];
        var that = this;

        var _apartype: string = "";
        var _banktype: string = "";
        var _bankid: string = "";

        for (let apar of that.selectedAPARType) {
            _apartype += apar + ",";
        }

        for (let bt of that.selectedBankType) {
            _banktype += bt + ",";
        }

        for (let bank of that.selectedBank) {
            _bankid += bank + ",";
        }

        //var year = row.view.title.split(' ')[1].toString();

        that._rptservice.getAPARReports({
            "flag": "calendar", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "monthname": row.view.title, "apartype": _apartype, "banktype": _banktype, "bankid": _bankid
        }).subscribe(data => {
            that.events = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    getMonthWiseAPAR(row) {
        var that = this;

        var _apartype: string = "";
        var _banktype: string = "";
        var _bankid: string = "";

        for (let apar of that.selectedAPARType) {
            _apartype += apar + ",";
        }

        for (let bt of that.selectedBankType) {
            _banktype += bt + ",";
        }

        for (let bank of that.selectedBank) {
            _bankid += bank + ",";
        }

        that._rptservice.getAPARReports({
            "flag": "monthwise", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "apartype": _apartype, "banktype": _banktype, "bankid": _bankid, "monthname": row.view.title
        }).subscribe(data => {
            try {
                console.log(row.view);
                if (data.data.length !== 0) {
                    that.monthwiseapar = data.data;
                }
                else {
                    that.monthwiseapar = [];
                }
            }
            catch (e) {
                //that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    filterAPARReports() {
        this.getAPARReports(this.calendarSelectedRow);
        this.getMonthWiseAPAR(this.calendarSelectedRow);
    }

    getAPARByType(row) {
        var that = this;

        var _banktype: string = "";
        var _bankid: string = "";

        for (let bt of that.selectedBankType) {
            _banktype += bt + ",";
        }

        for (let bank of that.selectedBank) {
            _bankid += bank + ",";
        }

        if (row.calEvent !== undefined) {
            that._rptservice.getAPARReports({
                "flag": "apartype", "apartype": row.calEvent.apartype, "docdate": row.calEvent.start,
                "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
                "monthname": row.calEvent.monthname, "banktype": _banktype, "bankid": _bankid
            }).subscribe(data => {
                that.viewaparDT = data.data;
                that.rowheader = data.data[0].aparhead;
                that.rowname = data.data[0].aparname;
                that.rowdate = data.data[0].docdate;
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
            }, () => {
                // console.log("Complete");
            })
        }
    }

    TotalAPARAmt() {
        var APARAmtTotal = 0;

        for (var i = 0; i < this.viewaparDT.length; i++) {
            var items = this.viewaparDT[i];
            APARAmtTotal += parseInt(items.amount);
        }

        return APARAmtTotal;
    }

    openDetailsForm(row) {
        if (row.apartype === "ap") {
            this._router.navigate(['/accounts/bankpayment/details/', row.autoid]);
        }
        else {
            this._router.navigate(['/accounts/bankreceipt/details/', row.autoid]);
        }
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}

export class MyEvent {
    id: number;
    apartype: string;
    monthname: string;
    title: string;
    start: string;
}
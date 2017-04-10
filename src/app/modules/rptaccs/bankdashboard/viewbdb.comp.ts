import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { ReportsService } from '../../../_service/reports/rpt-service' /* add reference for reports */
import { SelectItem } from 'primeng/primeng';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'viewbdb.comp.html',
    providers: [ReportsService]
})

export class BankDashboardReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    selectedAll: boolean = true;
    selectedMonth: string[] = [];
    dbtype: SelectItem[];
    selectedDBType: string = "all";
    fullscreen: string = "";
    halfscreen: string = "";

    bankdbDT: any = [];
    fliterMonthDT: any = [];
    fliterTypeDT: any = [];

    status: boolean = false;
    statustitle: string = "";

    colors: any = {};

    istable: boolean = true;
    ischart: boolean = true;

    gridTotal: any = {
        DebitAmtTotal: 0, CreditAmtTotal: 0
    };

    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
        this.getBankDBType();
        this.GetMonthDropDown();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Bank Dashboard");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(this.actionButton);
    }

    getBankDBType() {
        this.dbtype = [];
        this.dbtype.push({ label: 'All Bank', value: 'all' });
        this.dbtype.push({ label: 'Bank Wise', value: 'bank' });
    }

    // Hide When For View Table or Chart

    // View Bank Wise Dashboard

    selectAllMonth() {
        var that = this;

        if (that.selectedAll === true) {
            that.selectedMonth = Object.keys(that.fliterMonthDT).map(function (k) { return that.fliterMonthDT[k].monthno });
        }
        else {
            that.selectedMonth = [];
        }
    }

    // Bind DropDown For Month List

    GetMonthDropDown() {
        var that = this;
        that.fliterMonthDT = [];
        commonfun.loader();

        that._rptservice.getBankDashboard({
            "flag": "dropdown", "fy": that.loginUser.fy
        }).subscribe(bankdb => {
            if (bankdb.data.length > 0) {
                that.fliterMonthDT = bankdb.data[0]._month;
                that.fliterTypeDT = bankdb.data[0]._type;
                that.selectedMonth = Object.keys(that.fliterMonthDT).map(function (k) { return that.fliterMonthDT[k].monthno });
                that.GetBankWiseGrid();
            }
            else {
                that.fliterMonthDT = [];
                return false;
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    // Bind Bank Wise Data

    GetBankWiseGrid() {
        var that = this;
        that.bankdbDT = [];
        commonfun.loader();

        var _monthno: string = "";

        for (let monthno of that.selectedMonth) {
            _monthno += monthno + ",";
        }

        if (that.selectedDBType === "all") {
            that.fullscreen = "col-md-12 col-xs-12";
            that.halfscreen = "col-md-6 col-xs-12";
        }
        else {
            that.fullscreen = "col-md-3 col-xs-12";
            that.halfscreen = "";
        }

        that._rptservice.getBankDashboard({
            "flag": "bankwise", "dbtype": that.selectedDBType, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy,
            "uid": that.loginUser.uid, "monthno": _monthno
        }).subscribe(bankdb => {
            if (bankdb.data.length > 0) {
                that.bankdbDT = bankdb.data;
            }
            else {
                that.bankdbDT = [];
                return false;
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    // Get Chart Data

    getBankWiseChartData(row) {
        var that = this;
        var maindata = { labels: [], datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }] };
        var _labels = [];
        var _datasets = [];
        var drtotal = 0, crtotal = 0, amttotal = 0;

        for (var i = 0; i <= row.length - 1; i++) {
            var btype = row[i].banktype;
            _labels.push(btype);
            that.colors[btype] = that.colors[btype] || commonfun.randomColor(5);
            _datasets.push(parseFloat(row[i].totamt));
            maindata.datasets[0].backgroundColor.push(that.colors[btype]);
            drtotal += parseFloat(row[i].totdramt);
            crtotal += parseFloat(row[i].totcramt);
            amttotal += parseFloat(row[i].totamt);
        }

        row["drtotal"] = drtotal;
        row["crtotal"] = crtotal;
        row["amttotal"] = amttotal;

        maindata.labels = _labels;
        maindata.datasets[0].data = _datasets;
        return maindata;
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
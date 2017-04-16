import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { CommonService } from '../../../_service/common/common-service' /* add reference for view employee */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { ReportsService } from '../../../_service/reports/rpt-service' /* add reference for emp */
import { CalendarComp } from '../../usercontrol/calendar';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'viewldr.comp.html',
    providers: [ReportsService, CommonService]
})

export class LedgerReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    accountsDT: any = [];
    custwiseDT: any = [];
    totalRecords: number = 0;

    custid: number = 0;
    custcode: string = "";
    custname: string = "";
    typ: string = "";

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    gridTotal: any = { DrAmtTotal: 0, CrAmtTotal: 0 };

    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _autoservice: CommonService, private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        setTimeout(function () {
            $(".custname input").focus();
        }, 0);

        that.setActionButtons.setTitle("Ledger");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(this.actionButton);

        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        this.fromdate.initialize(this.loginUser);
        this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.fromdate.setDate(today);

        this.todate.initialize(this.loginUser);
        this.todate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todate.setDate(today);
    }

    // Auto Completed Customer

    getAutoAccounts(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "custwithcgrp",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "uid": this.loginUser.uid,
            "typ": "",
            "search": query
        }).then(data => {
            this.accountsDT = data;
        });
    }

    // Selected Customer

    selectAutoAccounts(event) {
        this.custcode = event.custcode;
        this.custname = event.label;
        this.typ = event.typ;
    }

    GetLedgerReport(from: number, to: number) {
        var that = this;
        that.custwiseDT = [];
        commonfun.loader();

        that.gridTotal = { DrAmtTotal: 0, CrAmtTotal: 0 };

        var frmdt = that.fromdate.getDate();
        var todt = that.todate.getDate();

        that._rptservice.getLedger({
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "frmdt": frmdt.length !== 0 ? frmdt : null, "todt": todt.length !== 0 ? todt : null,
            "from": from, "to": to, "search": that.custname
        }).subscribe(ledger => {
            that.totalRecords = ledger.data[1][0].recordstotal;
            that.custwiseDT = ledger.data[0];
            that.gridTotal.DrAmtTotal += parseFloat(ledger.data[1][0]._totdramt);
            that.gridTotal.CrAmtTotal += parseFloat(ledger.data[1][0]._totcramt);
            //that.TotalAmountMonthWise();
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    loadLedgerReport(event: LazyLoadEvent) {
        this.GetLedgerReport(event.first, (event.first + event.rows));
    }

    filterLedgerReport(dt: DataTable) {
        dt.reset();
    }

    TotalAmountMonthWise() {
        var that = this;
        that.gridTotal = { DrAmtTotal: 0, CrAmtTotal: 0 };

        for (var i = 0; i < this.custwiseDT.length; i++) {
            var items = this.custwiseDT[i];
            that.gridTotal.DrAmtTotal += parseFloat(items.dramt);
            that.gridTotal.CrAmtTotal += parseFloat(items.cramt);
        }
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}
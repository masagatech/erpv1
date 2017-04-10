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
    templateUrl: 'viewdr.comp.html',
    providers: [ReportsService, CommonService]
})

export class DebtorsReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    debtorsDT: any = [];
    totalRecords: number = 0;

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    gridTotalPageWise: any = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };
    gridTotalAll: any = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _autoservice: CommonService, private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Debtors");
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

    GetDebtorsReport(from: number, to: number) {
        var that = this;

        that.debtorsDT = [];
        commonfun.loader();

        that.gridTotalAll = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

        var frmdt = this.fromdate.getDate();
        var todt = this.todate.getDate();

        that._rptservice.getDebtorsRpt({
            "flag": "dr", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid, "attrid": "",
            "frmdt": frmdt.length !== 0 ? frmdt : null, "todt": todt.length !== 0 ? todt : null, "from": from, "to": to
        }).subscribe(debtors => {
            that.totalRecords = debtors.data[1][0].recordstotal;
            that.debtorsDT = debtors.data[0];
            that.TotalAmountPageWise();
            that.gridTotalAll.OPBalTotal += parseFloat(debtors.data[1][0]._opbal);
            that.gridTotalAll.BillAmtTotal += parseFloat(debtors.data[1][0]._billamt);
            that.gridTotalAll.OthAmtTotal += parseFloat(debtors.data[1][0]._othamt);
            that.gridTotalAll.RecAmtTotal += parseFloat(debtors.data[1][0]._recamt);
            that.gridTotalAll.CNAmtTotal += parseFloat(debtors.data[1][0]._cnamt);
            that.gridTotalAll.NetAmtTotal += parseFloat(debtors.data[1][0]._netamt);
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    loadDebtorsReport(event: LazyLoadEvent) {
        this.GetDebtorsReport(event.first, (event.first + event.rows));
    }

    filterDebtorsReport(dt: DataTable) {
        dt.reset();
    }

    // Get Tatal Amount

    TotalAmountPageWise() {
        var that = this;
        that.gridTotalPageWise = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

        for (var i = 0; i < this.debtorsDT.length; i++) {
            var items = this.debtorsDT[i];
            that.gridTotalPageWise.OPBalTotal += parseFloat(items.opbal);
            that.gridTotalPageWise.BillAmtTotal += parseFloat(items.billamt);
            that.gridTotalPageWise.OthAmtTotal += parseFloat(items.othamt);
            that.gridTotalPageWise.RecAmtTotal += parseFloat(items.recamt);
            that.gridTotalPageWise.CNAmtTotal += parseFloat(items.cnamt);
            that.gridTotalPageWise.NetAmtTotal += parseFloat(items.netamt);
        }
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}
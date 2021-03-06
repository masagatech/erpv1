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
    templateUrl: 'viewsv.comp.html',
    providers: [ReportsService, CommonService]
})

export class SalesView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    salesSummaryDT: any = [];

    gridTotalPageWise: any = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };
    gridTotalAll: any = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _autoservice: CommonService, private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
        this.GetSalesSummary();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Sales Summary");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(that.actionButton);
    }

    // Get Sales Summary

    GetSalesSummary() {
        var that = this;

        that.salesSummaryDT = [];
        commonfun.loader();

        that.gridTotalAll = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

        that._rptservice.getSalesReport({
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid
        }).subscribe(sales => {
            that.salesSummaryDT = sales.data[0];
            that.gridTotalAll.OPBalTotal += parseFloat(sales.data[1][0]._opbal);
            that.gridTotalAll.BillAmtTotal += parseFloat(sales.data[1][0]._billamt);
            that.gridTotalAll.OthAmtTotal += parseFloat(sales.data[1][0]._othamt);
            that.gridTotalAll.RecAmtTotal += parseFloat(sales.data[1][0]._recamt);
            that.gridTotalAll.CNAmtTotal += parseFloat(sales.data[1][0]._cnamt);
            that.gridTotalAll.NetAmtTotal += parseFloat(sales.data[1][0]._netamt);
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}
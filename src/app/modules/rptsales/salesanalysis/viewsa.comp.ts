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
    templateUrl: 'viewsa.comp.html',
    providers: [ReportsService, CommonService]
})

export class SalesAnalysis implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    attrlistDT: any = [];
    attrid: number = 0;
    attrname: any = [];

    salesAnalysisDT: any = [];
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

        that.setActionButtons.setTitle("Sales Analysis");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(that.actionButton);

        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        that.fromdate.initialize(that.loginUser);
        that.fromdate.setMinMaxDate(new Date(that.loginUser.fyfrom), new Date(that.loginUser.fyto));
        that.fromdate.setDate(today);

        that.todate.initialize(that.loginUser);
        that.todate.setMinMaxDate(new Date(that.loginUser.fyfrom), new Date(that.loginUser.fyto));
        that.todate.setDate(today);
    }

    // Auto Completed Attributes

    getAutoAttr(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "custattr",
            "attgroup": "115",
            "cmpid": this.loginUser.cmpid,
            "search": query
        }).then(data => {
            this.attrlistDT = data;
        });
    }

    // Read Get Attributes

    attrjson() {
        var attrlist = [];

        if (this.attrname.length > 0) {
            for (let item of this.attrname) {
                attrlist.push(item.value);
            }
        }

        return JSON.stringify(attrlist).replace('[', '').replace(']', '');
    }

    // Get Sales Analysis

    GetSalesAnalysis(from: number, to: number) {
        var that = this;

        that.salesAnalysisDT = [];
        commonfun.loader();

        that.gridTotalAll = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

        var frmdt = this.fromdate.getDate();
        var todt = this.todate.getDate();

        that._rptservice.getDebtorsRpt({
            "flag": "sa", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid, "attrid": that.attrjson(),
            "frmdt": frmdt.length !== 0 ? frmdt : null, "todt": todt.length !== 0 ? todt : null, "from": from, "to": to
        }).subscribe(sales => {
            that.totalRecords = sales.data[1][0].recordstotal;
            that.salesAnalysisDT = sales.data[0];
            that.TotalAmountPageWise();
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

    loadSalesAnalysis(event: LazyLoadEvent) {
        this.GetSalesAnalysis(event.first, (event.first + event.rows));
    }

    filterSalesAnalysis(dt: DataTable) {
        dt.reset();
    }

    // Get Tatal Amount

    TotalAmountPageWise() {
        var that = this;
        that.gridTotalPageWise = { OPBalTotal: 0, BillAmtTotal: 0, OthAmtTotal: 0, RecAmtTotal: 0, CNAmtTotal: 0, NetAmtTotal: 0 };

        for (var i = 0; i < this.salesAnalysisDT.length; i++) {
            var items = this.salesAnalysisDT[i];
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
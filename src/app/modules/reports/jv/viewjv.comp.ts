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
    templateUrl: 'viewjv.comp.html',
    providers: [ReportsService, CommonService]
})

export class JVReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    jvRptDT: any = [];
    totalRecords: number = 0;

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

        that.setActionButtons.setTitle("JV Report");
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

    GetJVReport(from: number, to: number) {
        var that = this;
        that.jvRptDT = [];
        that.gridTotal = { DrAmtTotal: 0, CrAmtTotal: 0 };
        commonfun.loader();

        var frmdt = this.fromdate.getDate();
        var todt = this.todate.getDate();

        that._rptservice.getJVReport({
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "frmdt": frmdt.length !== 0 ? frmdt : null, "todt": todt.length !== 0 ? todt : null,
            "from": from, "to": to
        }).subscribe(jvrpt => {
            that.totalRecords = jvrpt.data[1][0].recordstotal;
            that.jvRptDT = jvrpt.data[0];
            that.gridTotal.DrAmtTotal += parseFloat(jvrpt.data[1][0]._totdramt);
            that.gridTotal.CrAmtTotal += parseFloat(jvrpt.data[1][0]._totcramt);
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    loadJVReport(event: LazyLoadEvent) {
        this.GetJVReport(event.first, (event.first + event.rows));
    }

    filterJVReport(dt: DataTable) {
        dt.reset();
    }

    // Get Tatal Amount

    TotalAmount() {
        var that = this;
        that.gridTotal = { DrAmtTotal: 0, CrAmtTotal: 0 };

        for (var i = 0; i < this.jvRptDT.length; i++) {
            var items = this.jvRptDT[i];
            that.gridTotal.DrAmtTotal += parseFloat(items.dramt);
            that.gridTotal.CrAmtTotal += parseFloat(items.cramt);
        }
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}
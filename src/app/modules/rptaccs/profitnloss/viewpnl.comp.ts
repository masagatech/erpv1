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

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'viewpnl.comp.html',
    providers: [ReportsService, CommonService]
})

export class PNLReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    pnlDT: any = [];
    pnlExpenseDT: any = [];
    pnlIncomeDT: any = [];

    gridTotal: any = { ExpAmtTotal: 0, IncAmtTotal: 0 };

    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _autoservice: CommonService, private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
        this.GetProfitNLoss();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Profit And Loss");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(this.actionButton);
    }

    // Get PNL Grid

    GetProfitNLoss() {
        var that = this;
        that.pnlExpenseDT = [];
        commonfun.loader();

        that._rptservice.getProfitNLoss({
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid
        }).subscribe(pnl => {
            that.pnlDT = pnl.data[0];
            var netProfit = pnl.data[1][0].netprofit;
            var netLoss = pnl.data[1][0].netloss;
            that.pnlDT.push({ "pname":"EXPENSE", "custname": "Net Profit", "amount": "" + netProfit + "" });
            that.pnlDT.push({ "pname":"INCOME", "custname": "Net Loss", "amount": "" + netLoss + "" });
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            commonfun.loaderhide();
        }, () => {
            commonfun.loaderhide();
        });
    }

    TotalAmount(row) {
        var that = this;
        var AmtTotal = 0;

        for (var i = 0; i <= row.length - 1; i++) {
            AmtTotal += parseFloat(row[i].amount);
        }

        return AmtTotal;
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}
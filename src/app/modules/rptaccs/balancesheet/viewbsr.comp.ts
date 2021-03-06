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
    templateUrl: 'viewbsr.comp.html',
    providers: [ReportsService, CommonService]
})

export class BSRReports implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    bsrDT: any = [];
    bsrAssetsDT: any = [];
    bsrLiabilitiyDT: any = [];

    gridTotal: any = { LIAmtTotal: 0, ASAmtTotal: 0 };

    // Page Init

    constructor(private _router: Router, private _rptservice: ReportsService, private setActionButtons: SharedVariableService,
        private _autoservice: CommonService, private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
        this.GetBalanceSheet();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Balance Sheet");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(this.actionButton);
    }

    // Get bsr Grid

    GetBalanceSheet() {
        var that = this;
        that.bsrAssetsDT = [];
        commonfun.loader();

        that._rptservice.getBalanceSheet({
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid
        }).subscribe(bsr => {
            // that.bsrLiabilitiyDT = bsr.data.filter(a => a.pid === "LI");
            // that.bsrAssetsDT = bsr.data.filter(a => a.pid === "AS");

            that.bsrDT = bsr.data[0];
            var libcfamt = bsr.data[1][0].libcfamt;
            var asscfamt = bsr.data[1][0].asscfamt;
            that.bsrDT.push({ "pname":"LIABILITY", "scname": "BALANCE C/F", "amount": "" + libcfamt + "" });
            that.bsrDT.push({ "pname":"ASSETS", "scname": "BALANCE C/F", "amount": "" + asscfamt + "" });
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
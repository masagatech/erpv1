import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { warstockViewService } from "../../../../_service/warstockledger/view/view-service";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [warstockViewService, CommonService]

}) export class WhStockLed implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    whstocklist: any = [];
    totalRecords: number = 0;
    whname: any = "";
    whid: any = 0;
    itemname: any = "";
    itemId: any = 0;
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private whservice: warstockViewService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("refresh", "Refresh", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Stock Ledger");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            commonfun.addrequire();
            $(".whname").focus();
        }, 0);
    }

    //Auto Completed warehouse Name  Data
    getAutoCompleteWH(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouse",
            "search": _me.whname,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy
        }).subscribe(data => {
            $(".whname").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.whid = ui.item.value;
                    me.whname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Auto Completed Item Data
    getAutoCompleteItem(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouseTrasnfer",
            "search": me.itemname,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "warehouse": this.whid,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".item").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.itemname = ui.item.label;
                    me.itemId = ui.item.value;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Get Stock Ledger Data
    getWhStockLedger() {
        var validateme = commonfun.validate();
        if (!validateme.status) {
            this._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }
        try {
            var that = this;
            that.whservice.getStockLedger({
                "cmpid": that.loginUser.cmpid,
                "whid": that.whid,
                "fy": that.loginUser.fy,
                "itemid": that.itemId,
                "flag": ""
            }).subscribe(result => {
                var dataset = result.data;
                console.log(dataset);
                //total row
                that.totalRecords = dataset[1][0].recordstotal;
                that.whstocklist = dataset[0];
            }, err => {
                console.log("Error");
            }, () => {
                'Final'
            });
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
            return;
        }
    }

    loadRBIGrid(event: LazyLoadEvent) {
    }

    //Refresh Button Click Event 
    clearControl() {
        this.whname = "";
        this.whid = 0;
        this.itemId = 0;
        this.itemname = "";
        this.whstocklist = [];
        $(".whname").focus();
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "refresh") {
            this.clearControl();
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
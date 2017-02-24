import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { warstockViewService } from "../../../../_service/warstockledger/view/view-service";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { ALSService } from '../../../../_service/auditlock/als-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [warstockViewService, CommonService, ALSService]

}) export class WhStockLed implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    whstocklist: any = [];
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;
    whname: any = "";
    whid: any = 0;
    itemname: any = "";
    itemId: any = 0;
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("stockfrom")
    stockfrom: CalendarComp;

    //Calendor
    @ViewChild("stockto")
    stockto: CalendarComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private whservice: warstockViewService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService,
        private _userService: UserService, private _alsservice: ALSService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }

    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "sl", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.stockfrom.setMinMaxDate(new Date(lockdate), null);
            that.stockto.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.stockfrom.initialize(this.loginUser);
        this.stockfrom.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.stockto.initialize(this.loginUser);
        this.stockto.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("refresh", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Stock Ledger");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            commonfun.addrequire();
            $(".item").focus();
        }, 0);
        var date = new Date();
        this.stockfrom.setDate(date);
        this.stockto.setDate(date);
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
            "type": "CatProdName",
            "search": me.itemname,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            //"warehouse": this.whid,
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

    expandDetails(event) {
        if (event.details && event.details.length > 0) { return; }
        try {
            var that = this;
            var row = event;
            row.loading = false;
            that.whservice.getStockLedger({
                "cmpid": that.loginUser.cmpid,
                "whid": row.warid,
                "fy": that.loginUser.fy,
                "itemid": that.itemId,
                "flag": ""
            }).subscribe(result => {
                var dataset = result.data;
                that.totalDetailsRecords = dataset[1][0].recordstotal;
                if (dataset[0].length > 0) {
                    row.loading = true;
                    row.details = dataset[0];
                    $(".get").prop("disabled", false);
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
                    that.whstocklist = [];
                    $(".get").prop("disabled", false);
                    $(".item").focus();
                    return;
                }

            }, err => {
                console.log("Error");
                $(".get").prop("disabled", false);
            }, () => {
                'Final'
            });
        } catch (error) {

        }
    }

    TotalHand() {
        var hand = 0;
        if (this.whstocklist.length > 0) {
            for (let item of this.whstocklist) {
                hand += parseFloat(item.hand);
            }
        }
        return hand;
    }


    whfocusout() {
        if ($(".whname").val() == "") {
            this.whid = 0;
        }
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
            that.whstocklist = [];
            $(".get").prop("disabled", true);
            that.whservice.getStockLedger({
                "cmpid": that.loginUser.cmpid,
                "whid": that.whid,
                "fy": that.loginUser.fy,
                "itemid": that.itemId,
                "flag": "expand"
            }).subscribe(result => {
                var dataset = result.data;
                //total row
                that.totalRecords = dataset[1][0].recordstotal;
                if (dataset[0].length > 0) {
                    that.whstocklist = dataset[0];
                    $(".get").prop("disabled", false);
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
                    that.whstocklist = [];
                    $(".get").prop("disabled", false);
                    $(".item").focus();
                    return;
                }

            }, err => {
                console.log("Error");
                $(".get").prop("disabled", false);
            }, () => {
                'Final'
            });
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
            $(".get").prop("disabled", false);
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
        $(".item").focus();
    }

    //Total Debit Amount
    TotalDebit() {
        var debitamt = 0;
        if (this.whstocklist.length > 0) {
            for (let item of this.whstocklist) {
                debitamt += item.outword;
            }
        }
        return debitamt;
    }

    //Total Credit Amount
    TotalCredit() {
        var Creditamt = 0;
        if (this.whstocklist.length > 0) {
            for (let item of this.whstocklist) {
                Creditamt += item.inword;
            }
        }
        return Creditamt;
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
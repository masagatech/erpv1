import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for view employee */
import { dcviewService } from "../../../../_service/dcmaster/view/dcview-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { CalendarComp } from '../../../usercontrol/calendar';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'adedview.comp.html',
    providers: [dcviewService, CommonService, ALSService]
})

export class dcview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Declare Veriable Local
    CustName: any = '';
    CustID: any = 0;

    FromData: any;
    ToData: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Calendor
    @ViewChild("fromdatecal")
    fromdatecal: CalendarComp;

    @ViewChild("todatecal")
    todatecal: CalendarComp;

    CustomerAutodata: any[];
    salesorderview: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private SalesOrdViewServies: dcviewService, private _autoservice: CommonService,
        private _userService: UserService, private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    //Date 
    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "so", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.fromdatecal.setMinMaxDate(new Date(lockdate), null);
            that.todatecal.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.fromdatecal.initialize(this.loginUser);
        this.fromdatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todatecal.initialize(this.loginUser);
        this.todatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Sales Order");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            $("#Custcode input").focus();
        }, 0);
        var date = new Date();
        this.fromdatecal.setDate(date);
        this.todatecal.setDate(date);
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        if (evt === 'clear') {
            this.ClearControl();
        }
        if (evt === "add") {
            this._router.navigate(['/transaction/dcmaster/add']);
            //this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Clear Control
    ClearControl() {
        var that = this;
        that.salesorderview = [];
        that.CustID = 0;
        that.CustName = "";
        $("#Custcode input").focus();
    }

    //Get Button Click Event 
    private GetData() {
        try {
            if ($("#Custcode input").val() == "") {
                this.CustID = 0;
            }
            this.salesorderview = [];
            this.SalesOrdViewServies.GetSalesOrderView({                     //User getdcdropdown
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "acid": this.CustID,
                "from": this.fromdatecal.getDate(),
                "to": this.todatecal.getDate(),
                "typ": "order"
            }).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].length > 0) {
                    this.salesorderview = dataset[0];
                }
                else {
                    this._msg.Show(messageType.error, "error", "Record Not Found");
                    $("#Custcode input").focus();
                }
            }, err => {
                this._msg.Show(messageType.error, "error", "Technical issues");
            }, () => {
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Row Click 
    OpenEdit(event) {
        var data = event.data;
        if (!data.IsLocked && data.status != "Confirm") {
            this._router.navigate(['/transaction/dcmaster/edit', data.docno]);
        }
        else{
            this._msg.Show(messageType.info,"info","This sales order confirm");
            return;
        }
    }

    //Document Details
    expandDetails(event) {
        try {
            if (event.details && event.details.length > 0) { return; }
            var that = this;
            var row = event;
            row.loading = false;
            this.SalesOrdViewServies.GetSalesOrderView({
                "flag": "detail",
                "docno": row.data.docno,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "typ": "order"
            }).subscribe(data => {
                row.loading = true;
                var dataset = data.data;
                row.details = dataset[0];
                // row.subtotal = 0;
                // row.subqty = 0;
                // row.confirmqty = 0;
                // for (let item of row.details) {
                //     row.subtotal += parseFloat(item.amount);
                //     row.subqty += parseFloat(item.ordqty);
                //     row.confirmqty += parseFloat(item.confqty);
                // }
            }, err => {
                this._msg.Show(messageType.error, "error", "Service Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Customer Autoextender
    CustomerAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "customer",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query,
                "typ": ""
            }).then(data => {
                this.CustomerAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Selected Customer Id And Name
    CustomerSelect(event) {
        this.CustID = event.value;
        this.CustName = event.label;
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");

    }

}
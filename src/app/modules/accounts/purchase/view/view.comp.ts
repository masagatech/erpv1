import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { PurchaseviewService } from "../../../../_service/suppurchase/view/purchaseview-service";
import { CommonService } from '../../../../_service/common/common-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable, AutoCompleteModule } from 'primeng/primeng';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [PurchaseviewService, CommonService, ALSService]
})

export class purchaseview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable Declare 
    PODetails: any = [];
    SupplierName: any = "";
    SupplierID: number = 0;
    TableHide: any;
    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Auto Completed 
    SupplierAutodata: any = [];

    //Calendor
    @ViewChild("fromdatecal")
    fromdatecal: CalendarComp;

    @ViewChild("todatecal")
    todatecal: CalendarComp;


    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private _autoservice: CommonService, private PurchaseServies: PurchaseviewService,
        private _userService: UserService, private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    setAuditDate() {
        var that = this;
        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "pur", "fy": that.loginUser.fy
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

    ngOnInit() {
        this.fromdatecal.initialize(this.loginUser);
        this.fromdatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todatecal.initialize(this.loginUser);
        this.todatecal.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Purchase Order");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        //Get All Record
        setTimeout(function () {
            $(".SupplierName input").focus();
        }, 0)
        var date = new Date();
        this.fromdatecal.setDate(date);
        this.todatecal.setDate(date);

    }

    loadRBIGrid(event: LazyLoadEvent) {
        // this.GetSupplierDetails(event.first, (event.first + event.rows));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/purchase/add']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Supplier Selected
    SupplierSelect(event) {
        try {
            this.SupplierID = event.value;
            this.SupplierName = event.label;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Supplier Auto Extender 
    SupplierAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "supplier",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query
            }).then(data => {
                this.SupplierAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //More Button Click Event
    GetSupplierDetails() {
        this.PurchaseServies.getpurchaseview({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "fromdate": this.fromdatecal.getDate(),
            "todate": this.todatecal.getDate(),
            // "from": from,
            // "to": to,
            "suppId": this.SupplierID
        }).subscribe(details => {
            var dataset = details.data;
            if (dataset[0].length > 0) {
                this.PODetails = dataset[0];
            }
            else {
                this.PODetails = [];
                this._msg.Show(messageType.error, "error", "Record not found")
                $(".SupplierName input").focus();
            }
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Edit Row
    EditPO(event) {
        try {
            var data = event.data;
            if (data != undefined) {
                data = event.data;
            }
            else {
                data = event;
            }
            if (!data.islocked) {
                this._router.navigate(['/accounts/purchase/edit', data.purordid]);
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //More Button Click
    expandDetails(event) {
        try {
            if (event.details && event.details.length > 0) { return; }
            var that = this;
            var row = event;
            row.loading = false;
            this.PurchaseServies.getpurchaseview({
                "flag": "details",
                "docno": row.purordid,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
            }).subscribe(data => {
                var dataset = data.data;
                if (dataset.length > 0) {
                    row.loading = true;
                    row.details = dataset[0];
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Total AMount 
    TotalAmt() {
        if (this.PODetails.length > 0) {
            var total = 0;
            for (var i = 0; i < this.PODetails.length; i++) {
                total += parseInt(this.PODetails[i].Amount);
            }
            return total;
        }
    }

    //Total Qunatity
    TotalQty() {
        if (this.PODetails.length > 0) {
            var total = 0;
            for (var i = 0; i < this.PODetails.length; i++) {
                total += parseInt(this.PODetails[i].Qty);
            }
            return total;
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }

}
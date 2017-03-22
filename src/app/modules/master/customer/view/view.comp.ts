import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { CustomerViewService } from "../../../../_service/customer/view/view-service";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router } from '@angular/router';
declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [CustomerViewService, CommonService]
    //,AutoService
}) export class CustView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    customerlist: any = [];
    totalRecords: number = 0;
    CustID: number = 0;
    CustName: any = "";

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    CustomerAutodata: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private CustViewServies: CustomerViewService, private _autoservice: CommonService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Customer Master");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            $("#CustName input").focus();
        }, 0)
    }

    //AutoCompletd Customer
    CustomerAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "customer",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "typ":"",
                "search": query
            }).then(data => {
                this.CustomerAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Selected Customer
    CustomerSelect(event) {
        try {
            this.CustID = event.value;
            this.CustName = event.label;
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Get Customer Details
    getcustomer(from: number, to: number) {
        try {
            var that = this;
            that.CustViewServies.getcustomer({
                "cmpid": that.loginUser.cmpid,
                "from": from,
                "to": to,
                "custid": that.CustID,
                "createdby": that.loginUser.login
            }).subscribe(result => {
                debugger;
                that.totalRecords = result.data[1][0].recordstotal;
                that.customerlist = result.data[0];
            }, err => {
                console.log("Error");
            }, () => {
                'Final'
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Pagination Grid View 
    loadRBIGrid(event: LazyLoadEvent) {
        this.getcustomer(event.first, (event.first + event.rows));
    }

    //Edit Customer 
    EditItem(event) {
        try {
            var data = event.data;
            if (data != undefined) {
                data = event.data;
            }
            else {
                data = event;
            }
            if (!data.islocked) {
                this._router.navigate(['master/customer/edit', data.autoid]);
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "clear") {
            $("#CustName input").val("");
            this.customerlist = [];
            this.CustID = 0;
            this.getcustomer(0, 10);
            $("#CustName input").focus();
        }
        else if (evt === "add") {
            this._router.navigate(['/master/customer/add']);
        }
        if (evt === "save") {
            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { warTransferViewService } from "../../../../_service/wartransfer/view/view-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';


import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [warTransferViewService, CommonService]                         //Provides Add Service

}) export class WarehouseView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    wareid: any = 0;
    warename: any = "";
    warehousedetails: any = [];
    totalRecords: number = 0;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: warTransferViewService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService,
        private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setTitle("Stock Transfer");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".ware").focus();
        setTimeout(function () {
            commonfun.addrequire();
        }, 0);
    }

    //get button click event
    getWarehouseDetails(from: number, to: number) {
        try {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            this.wareServies.getwarehouseTransfer({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "whid": this.wareid,
                "from": from,
                "to": to
            }).subscribe(result => {
                if (result.data.length > 0) {
                    this.warehousedetails = result.data;
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

    //Pagination Grid View 
    loadRBIGrid(event: LazyLoadEvent) {
        this.getWarehouseDetails(event.first, (event.first + event.rows));
    }

    //From Warehouse
    getwarehouse(me: any) {
        try {
            var _me = this;
            this._autoservice.getAutoData({
                "type": "warehouse",
                "search": _me.warename,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login
            }).subscribe(data => {
                $(".ware").autocomplete({
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
                        me.wareid = ui.item.value;
                        me.warename = ui.item.label;
                    }
                });
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    EditItem(dt, event) {
        var data = event.data;
        if (!data.islocked) {
            this._router.navigate(['/warehouse/warestock/edit', data.docno]);
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['warehouse/warestock/add']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // $('input').removeAttr('disabled');
            // $('select').removeAttr('disabled');
            // $('textarea').removeAttr('disabled');
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "edit").hide = true;
            // $(".warehouse").focus();
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
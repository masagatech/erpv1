import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { itemGroupService } from "../../../../_service/itemgroup/itemgroup-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [itemGroupService, CommonService]
    //,AutoService
}) export class itemgroupView implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    itemgrouplist: any = [];
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;
    totalqty: any = 0
    totalamt: any = 0

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private ItemgroupServies: itemGroupService, private _autoservice: CommonService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setTitle("Item Group");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getItemgroup(from: number, to: number) {
        try {
            var that = this;
            that.ItemgroupServies.getitemdetail({
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "from": from,
                "to": to,
                "createdby": that.loginUser.login
            }).subscribe(result => {
                that.totalRecords = result.data[1][0].recordstotal;
                that.itemgrouplist = result.data[0];
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
        try {
            this.getItemgroup(event.first, (event.first + event.rows));
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //More Button Click Event
    expandDetails(event) {
        if (event.details && event.details.length > 0) { return; }
        try {
            var that = this;
            var row = event;
            row.loading = false;
            that.ItemgroupServies.getitemdetail({
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "createdby": that.loginUser.login,
                "docno": row.docno,
                "flag": "expdetails"
            }).subscribe(result => {
                var dataset = result.data;
                that.totalDetailsRecords = dataset[1][0].recordstotal;
                if (dataset[0].length > 0) {
                    row.loading = true;
                    row.details = dataset[0];

                    for (let item of row.details) {
                        that.totalqty += parseFloat(item.qty);
                        that.totalamt += parseFloat(item.amt);
                    }
                    $(".get").prop("disabled", false);
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
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

    // //Group Code (Edit) Group
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
                this._router.navigate(['/supplier/itemgroup/edit', data.docno]);
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/itemgroup/add']);
        }
        else if (evt === "save") {
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
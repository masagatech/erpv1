import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ItemViewService } from "../../../../_service/itemmaster/view/itemview-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [ItemViewService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
}) export class itemview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    itemsName: any = "";
    itemsid: any = 0;
    ItemDetails: any = [];
    totalRecords: number = 0;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private itemViewServies: ItemViewService, private _autoservice: CommonService,
        private _userService: UserService, private _msg: MessageService) { //Inherit Service dcmasterService
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".items").focus();
    }

    getAutoCompleteProductName(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "CatProdName", "search": that.itemsName, "cmpid": 1, "FY": 5 }).subscribe(data => {
            $(".items").autocomplete({
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
                    me.itemsid = ui.item.value;
                    me.itemsName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getItemsMaster(from: number, to: number) {
        if ($(".items").val() == "") {
            this.itemsid = "";
        }
        this.itemViewServies.getItemsMaster({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "flag": "",
            "from": from,
            "to": to,
            "itemsid": this.itemsid
        }).subscribe(details => {
            var dataset = details.data;
            console.log(dataset);
            if (dataset.length > 0) {
                this.totalRecords = dataset[1][0].recordstotal;
                this.ItemDetails = dataset[0];
            }
            else {
                this.ItemDetails = [];
                this._msg.Show(messageType.info, "info", "Record not found");
                $(".Items").focus();
            }

        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Pagination Grid View 
    loadRBIGrid(event: LazyLoadEvent) {
        this.getItemsMaster(event.first, (event.first + event.rows));
    }

    //Edit Row
    EditItem(row) {
        if (!row.islocked) {
            this._router.navigate(['/supplier/itemsmaster/edit', row.itemsid]);
        }
    }

    //More Button Click
    // expandDetails(row) {
    //     row.attribute = [];
    //     row.saleprice = [];
    //     if (row.issh == 0) {
    //         row.issh = 1;
    //         if (row.attribute.length === 0) {
    //             this.itemViewServies.getItemsMaster({
    //                 "flag": "Details",
    //                 "itemsid": row.itemsid,
    //                 "cmpid": this.loginUser.cmpid,
    //                 "fy": this.loginUser.fy
    //             }).subscribe(data => {
    //                 var dataset = data.data;
    //                 row.attribute = dataset[0]._attributejson;
    //                 row.saleprice = dataset[0]._salesjson;
    //             }, err => {
    //                 console.log("Error");
    //             }, () => {
    //                 // console.log("Complete");
    //             })
    //         }
    //     } else {
    //         row.issh = 0;
    //     }
    // }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/itemsmaster/add']);
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
    }
}
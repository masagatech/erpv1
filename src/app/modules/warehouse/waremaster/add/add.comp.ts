import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { WarehouseAddService } from "../../../../_service/warehouse/add/add-service";
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [WarehouseAddService, CommonService]                         //Provides Add Service

}) export class WarehouseAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    name: any = "";
    code: any = "";
    remark: any = "";
    wareid: any = 0;

    //other module
    adrbookid: any = [];
    adrid: number = 0;
    docfile: any = [];
    module: string = "";
    uploadedFiles: any = [];
    adrcsvid: any = "";
    adrmodule: string = "";
    accode: string = "";
    private subscribeParameters: any;

    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: WarehouseAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService) { //Inherit Service
        this.module = "warehouse";
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").focus();

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.wareid = params['id']
                this.EditItem(params['id']);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    EditItem(wareid) {
        this.wareServies.getwarehouse({
            "cmpid": 1,
            "wareid": wareid
        }).subscribe(result => {
            var dataset = result.data;
            this.name = dataset[0][0].nam;
            this.code = dataset[0][0].code;
            this.remark = dataset[0][0].remark;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //File Upload Start 
    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    //File Upload Complete 
    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.docfile.push({ "id": e[i].id });
        }
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
    }

    Clearcontroll() {
        this.name = "";
        this.code = "";
        this.remark = "";
        this.adrbookid = [];
        this.addressBook.ClearArray();
        $(".code").focus();
    }

    paramterjson() {
        var param = {
            "wareid": this.wareid,
            "name": this.name,
            "code": this.code,
            "remark": this.remark,
            "cmpid": 1,
            "createdby": "admin",
            "adrid": this.adrbookid,
            "docfile": this.docfile
        }
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/warehouse/view']);
        }
        if (evt === "save") {
            if (this.adrbookid.length > 0) {
                this.wareServies.save(
                    this.paramterjson()
                ).subscribe(result => {
                    var dataset = result.data;
                    if (dataset[0].funsave_warehouse.maxid == -1) {
                        this._msg.Show(messageType.info, "info", "Warehouse already exists");
                        $(".code").focus();
                        return;
                    }
                    if (dataset[0].funsave_warehouse.maxid > 0) {
                        this._msg.Show(messageType.success, "success", "Data Save Successfully");
                        this.Clearcontroll();
                    }
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                });
            }
            else
            {
                 this._msg.Show(messageType.info, "into", "Please enter warehouse address");
                 return;
            }

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".warehouse").focus();
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
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { WarehouseAddService } from "../../../../_service/warehouse/add/add-service";
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
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
    attrname: any = "";
    attrid: any = 0;

    //other module
    adrbookid: any = [];
    adrid: number = 0;
    suppdoc: any = [];
    module: string = "";
    uploadedFiles: any = [];
    adrcsvid: any = "";
    adrmodule: string = "";
    accode: string = "";
    Duplicateflag: boolean;
    attrlist: any = [];
    isactive: boolean = false;
    editmode: boolean = false;

    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;


    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: WarehouseAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) { //Inherit Service
        this.module = "warehouse";
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Warehouse Master");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").removeAttr('disabled', 'disabled');
        $(".code").focus();

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

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

    //attribute list Add Div
    AttributeAdd() {
        try {
            if (this.attrid > 0) {
                this.Duplicateflag = true;
                if (this.attrlist.length > 0) {
                    for (var i = 0; i < this.attrlist.length; i++) {
                        if (this.attrlist[i].attrname == this.attrname) {
                            this.Duplicateflag = false;
                            break;
                        }
                    }
                }
                if (this.Duplicateflag == true) {
                    this.attrlist.push({
                        'attrname': this.attrname,
                        'value': this.attrid
                    });
                    this.attrname = "";
                    $(".attr").focus();
                }
                else {
                    this._msg.Show(messageType.info, "info", "Duplicate Attribute");
                    $(".attr").focus();
                    return;
                }

            }
            else {
                this._msg.Show(messageType.info, "info", "Please enter valied attribute name");
                $(".attr").focus();
                return;
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }


    }

    //Remove Attribute
    Removeattr(row) {
        try {
            var index = -1;
            for (var i = 0; i < this.attrlist.length; i++) {
                if (this.attrlist[i].value === row.value) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                console.log("Wrong Delete Entry");
            }
            this.attrlist.splice(index, 1);
            $(".attr").focus();
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    createattrjson() {
        var attrid = [];
        if (this.attrlist.length > 0) {
            for (let items of this.attrlist) {
                attrid.push({ "id": items.value });
            }
            return attrid;
        }
    }

    //Autocompleted Attribute Name
    getAutoCompleteattr(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "attribute",
            "search": that.attrname,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fy,
            "filter": "Warehouse Attribute",
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".attr").autocomplete({
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
                    me.attrid = ui.item.value;
                    me.attrname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    EditItem(wareid) {
        var that = this;
        try {
            that.wareServies.getwarehouse({
                "cmpid": that.loginUser.cmpid,
                "wareid": wareid,
                "flag": "Edit"
            }).subscribe(result => {
                var dataset = result.data;
                var _uploadedfile = dataset[0][0]._uploadedfile;
                var _suppdoc = dataset[0][0]._suppdoc;
                this.editmode = true;
                that.name = dataset[0][0].nam;
                that.code = dataset[0][0].code;
                that.remark = dataset[0][0].remark;
                that.isactive = dataset[0][0].isactive;
                that.attrlist = dataset[0][0]._attr == null ? [] : dataset[0][0]._attr;

                if (_uploadedfile != null) {
                    that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
                    that.suppdoc = _suppdoc == null ? [] : _suppdoc;
                }
                that.adrcsvid = "";
                for (let items of dataset[0][0].adr) {
                    that.adrcsvid += items.adrid + ',';
                }
                that.addressBook.getAddress(that.adrcsvid.slice(0, -1));

            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
        }

    }

    //File Upload Start 
    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    //File Upload Complete 
    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
        this.adrbookid = [];
    }

    Clearcontroll() {
        this.name = "";
        this.code = "";
        this.remark = "";
        this.adrbookid = [];
        this.attrlist = [];
        this.editmode = false;
        this.addressBook.ClearArray();
        $(".code").focus();
    }

    Attr() {
        setTimeout(function () {
            this.attrname = "";
            $(".attr").focus();
        }, 0);


    }

    paramterjson() {
        try {
            var param = {
                "wareid": this.wareid,
                "name": this.name,
                "code": this.code,
                "remark": this.remark,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "isactive": this.isactive,
                "attr": this.createattrjson(),
                "adrid": this.adrbookid,
                "suppdoc": this.suppdoc
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/warehouse']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            try {
                if (this.adrbookid.length == 0) {
                    this._msg.Show(messageType.error, "error", "Please enter contact address");
                    return;
                }
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
                else {
                    this._msg.Show(messageType.info, "into", "Please enter warehouse address");
                    return;
                }
            } catch (e) {
                this._msg.Show(messageType.error, "error", e.message);
            }
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".code").attr('disabled', 'disabled');
            this.Getcode();
            $(".warehouse").focus();
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
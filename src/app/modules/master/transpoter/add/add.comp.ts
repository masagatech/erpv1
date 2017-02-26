import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { TranspoterAddService } from "../../../../_service/transpoter/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;


@Component({
    templateUrl: 'add.comp.html',
    providers: [TranspoterAddService, CommonService]

}) export class transadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Local Veriable
    code: any = "";
    transname: any = "";
    desc: any = "";
    remark: any = "";

    //Address And File Upload
    adrbookid: any = [];
    adrid: number = 0;
    adrcsvid: string = "";
    suppdoc: any = [];
    module: string = "";
    uploadedFiles: any = [];
    accode: string = "";
    transid: number = 0;
    editmode: boolean = false;
    isactive: boolean = false;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    @ViewChild('attribute')
    attribute: AttributeComp;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private transpoter_service: TranspoterAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) {
        this.module = "trans";
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setTitle("Transpoter Master");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").prop('disabled', false);
        $(".code").focus();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.transid = params['id'];
                this.EditTranspoter(this.transid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.attribute.attrparam = ["item_attr"];
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

    //On Blur Event Cust Code
    Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
        this.adrbookid = [];
    }

    //Edit Transpoter 
    EditTranspoter(id) {
        var that = this;
        that.transpoter_service.getTranspoter({
            "cmpid": that.loginUser.cmpid,
            "flag": "Edit",
            "transid": id,
            "fy": that.loginUser.fy,
            "createdby": that.loginUser.login
        }).subscribe(result => {
            that.editmode = true;
            var _Transdata = result.data[0][0]._transdata;
            var _uploadedfile = result.data[0][0]._uploadedfile;
            var _suppdoc = result.data[0][0]._suppdoc;

            that.code = _Transdata[0].transcode;
            that.transname = _Transdata[0].transname;
            that.desc = _Transdata[0].descp;
            that.remark = _Transdata[0].remark;
            that.remark = _Transdata[0].remark;
            that.isactive = _Transdata[0].isactive;
            that.attribute.attrlist = result.data[0][0]._attributejson == null ? [] : result.data[0][0]._attributejson;

            if (_uploadedfile != null) {
                that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
                that.suppdoc = _suppdoc == null ? [] : _suppdoc;
            }

            that.adrcsvid = "";
            if (_Transdata[0].adr.length > 0) {
                for (let items of _Transdata[0].adr) {
                    that.adrcsvid += items.adrid + ',';
                }
                that.addressBook.getAddress(that.adrcsvid.slice(0, -1));
            }
        }, err => {
            console.log("error");
        }, () => {
            //Done
        })
    }
    createattrjson() {
        var attrid = [];
        if (this.attribute.attrlist.length > 0) {
            for (let items of this.attribute.attrlist) {
                attrid.push({ "id": items.value });
            }
            return attrid;
        }
    }

    paramterjson() {
        var param = {
            "transid": this.transid,
            "code": this.code,
            "transname": this.transname,
            "desc": this.desc,
            "adr": this.adrbookid,
            "attr": this.createattrjson(),
            "suppdoc": this.suppdoc,
            "fy": this.loginUser.fy,
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login,
            "remark": this.remark,
            "isactive": this.isactive,
            "remark1": "",
            "remark2": "",
            "remark3": []
        }
        return param;
    }

    clearcontrol() {
        this.code = "";
        this.transname = "";
        this.desc = "";
        this.remark = "";
        this.attribute.attrlist = [];
        this.addressBook.ClearArray();
    }

    Attr() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 0);
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
         if (evt === "clear") {
            this.clearcontrol();
            $(".code").focus();
        }
        if (evt === "back") {
            this._router.navigate(['master/transpoter']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (this.adrbookid.length == 0) {
                this._msg.Show(messageType.error, "error", "Please enter contact address");
                return;
            }
            this.actionButton.find(a => a.id === "save").enabled = false;
            this.transpoter_service.saveTranspoter(
                this.paramterjson()
            ).subscribe(result => {
                if (result.data[0].funsave_transpoter.maxid == -1) {
                    this._msg.Show(messageType.info, "info", "Dulpicate Transpoter");
                    $(".code").focus();
                    return;
                }
                else if (result.data[0].funsave_transpoter.maxid > 0) {
                    this._msg.Show(messageType.success, "success", "Data Save Successfully");
                    this.clearcontrol();
                    $(".code").prop('disabled', false);
                    $(".code").focus();
                    if (this.editmode) {
                        this._router.navigate(['master/transpoter']);
                    }
                    this.editmode = false;
                    return;
                }
            }, err => {
                console.log("error");
            }, () => {
                this.actionButton.find(a => a.id === "save").enabled = true;
            })

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".code").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".tranname").focus();
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

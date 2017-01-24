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

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
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
    docfile: any = [];
    module: string = "";
    uploadedFiles: any = [];
    accode: string = "";

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    @ViewChild('addrbook')
    addressBook: AddrbookComp;

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
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").focus();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                //this.venid = params['id'];
                //  this.EditVen(this.venid);

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

    //On Blur Event Cust Code
    Getcode() {
        this.addressBook.AddBook(this.code);
        this.accode = this.code;
    }

    //Edit Transpoter 
    EditVen(id) {
        var that = this;
        that.transpoter_service.getTranspoter({
            "cmpid": that.loginUser.cmpid,
            "flag": "Edit",
            "transid": id,
            "fy": that.loginUser.fyid,
            "createdby": that.loginUser.login
        }).subscribe(result => {
            var _Transdata = result.data[0][0]._transdata;
            var _uploadedfile = result.data[0][0]._uploadedfile;
            var _docfile = result.data[0][0]._docfile;

            that.code = _Transdata[0].code;
            that.transname = _Transdata[0].transname;
            that.desc = _Transdata[0].descp;
            that.remark = _Transdata[0].remark;

            if (_uploadedfile != null) {
                that.uploadedFiles = _docfile == null ? [] : _uploadedfile;
                that.docfile = _docfile == null ? [] : _docfile;
            }
            if (_Transdata[0].adr.length > 0) {
                for (let items of _Transdata[0].adr) {
                    that.adrcsvid += items.adrid + ',';
                }
                that.addressBook.getAddress(that.adrcsvid.slice(0, -1));
            }
        }, err => {
            console.log("error");
        }, () => {
            console.log("Done");
        })
    }

    paramterjson() {
        var param = {
            "code": this.accode,
            "transname": this.transname,
            "descp": this.desc,
            "adr": this.adrbookid,
            "docfile": this.docfile,
            "fy": this.loginUser.fyid,
            "cmpid": this.loginUser.cmpid,
            "createdby": this.loginUser.login,
            "remark": this.remark,
            "remark1": "",
            "remark2": "",
            "remark3": ""
        }
        return param;
    }

    clearcontrol() {
        this.code = "";
        this.transname = "";
        this.desc = "";
        this.remark = "";
        this.addressBook.ClearArray();
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['master/transpoter/view']);
        }
        if (evt === "save") {
            this.transpoter_service.saveTranspoter(
                this.paramterjson()
            ).subscribe(result => {
                console.log(result.data);
                if (result.data[0].funsave_transpoter.maxid == -1) {
                    this._msg.Show(messageType.info, "info", "Dulpicate Transpoter");
                    $(".code").focus();
                    return;
                }
                else if (result.data[0].funsave_transpoter.maxid > 0) {
                    this._msg.Show(messageType.success, "success", "Data Save Successfully");
                    this.clearcontrol();
                    $(".code").focus();
                    return;
                }
            }, err => {
                console.log("error");
            }, () => {
                console.log("Done");
            })

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // $('input').removeAttr('disabled');
            // $('select').removeAttr('disabled');
            // $('textarea').removeAttr('disabled');
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "save").hide = false;
            // this.actionButton.find(a => a.id === "edit").hide = true;
            // $(".code").focus();
            // this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
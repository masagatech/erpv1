import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { materialAddService } from "../../../../_service/materialmaster/add/add-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [materialAddService, CommonService]

}) export class materialAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    mid: number = 0;
    code: any = "";
    name: any = "";
    uom: number = 0;
    uomlist: any = [];
    description: any = "";
    isactive: boolean = false;
    editmode: boolean = false;
    private subscribeParameters: any;

    @ViewChild('attribute')
    attribute: AttributeComp;


    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private materialAddServies: materialAddService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _userService: UserService,
        private _msg: MessageService) {
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
        $(".code").prop('disabled', false);
        $(".code").focus();
        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.mid = params['id'];
                this.Editrow(this.mid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
        this.getuom();
        this.attribute.attrparam = ["item_attr"];
    }

    //Get Uom Dropdown 
    getuom() {
        var that = this;
        this._autoservice.getMOM({
            "group": 'uom',
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            this.uomlist = data.data;
            console.log(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            //Done
        })
    }

    //Clear Control
    ClearControl() {
        this.mid = 0;
        this.code = "";
        this.name = "";
        this.uom = 0;
        this.description = "";
        this.attribute.attrlist;
        $(".code").focus();
    }

    Editrow(mid: number) {
        var that = this;
        that.materialAddServies.getMaterialMaster({
            "cmpid": that.loginUser.cmpid,
            "flag": "Edit",
            "mid": that.mid,
            "fy": that.loginUser.fy,
            "createdby": that.loginUser.login
        }).subscribe(result => {
            var dataset = result.data[0];
            that.editmode = true;
            that.isactive = dataset[0].isactive;
            that.code = dataset[0].mcode;
            that.name = dataset[0].mname;
            that.uom = dataset[0].uom;
            that.attribute.attrlist = dataset[0]._attr === null ? [] : dataset[0]._attr;
            that.description = dataset[0].descrip;

        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    private CreatejsonAttribute() {
        var attrlist = [];
        if (this.attribute.attrlist.length > 0) {
            for (let item of this.attribute.attrlist) {
                attrlist.push({ "id": item.value });
            }
            return attrlist;
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['supplier/material']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            this.materialAddServies.saveMaterialmaster({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "mid": this.mid,
                "mcode": this.code,
                "mname": this.name,
                "uom": this.uom,
                "isactive": this.isactive,
                "attr": this.CreatejsonAttribute(),
                "desc": this.description,
                "remark1": "",
                "remark2": "",
                "remark3": []
            }).subscribe(data => {
                console.log(data.data);
                var dataset = data.data;
                if (dataset[0].funsave_materialmaster.maxid == -1) {
                    this._msg.Show(messageType.error, "error", dataset[0].funsave_materialmaster.msg);
                    $(".code").focus();
                }
                if (dataset[0].funsave_materialmaster.maxid > 0) {
                    this._msg.Show(messageType.success, "success", dataset[0].funsave_materialmaster.msg);
                    this.ClearControl();
                }
                if (this.editmode == true) {
                    this._router.navigate(['supplier/material']);
                }
                this.editmode = false;

            }, err => {
                console.log("Error");
            }, () => {
                //Done
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
            $(".name").focus();
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
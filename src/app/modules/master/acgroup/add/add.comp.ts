import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { acgroupadd } from "../../../../_service/acgroup/add/add-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [acgroupadd, CommonService]

}) export class acadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    groupid: any = 0;
    groupcode: any = "";
    groupName: any = "";
    parentgr: any = 0;
    neturname: any = "";
    neturid: any = 0;
    category: any = "";
    remark: any = "";
    appfrom: any = 0;
    chkall: boolean;
    financiallist: any = [];
    isactive: boolean = false;
    editmode: boolean = false;

    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private acgroupServies: acgroupadd,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _userService: UserService,
        private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        //applicable From
        this.getApplicableFrom();

    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".groupcode").removeAttr('disabled', 'disabled');
        $(".groupcode").focus();
        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.groupid = params['id'];
                this.Editgroup(this.groupid);

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

    //Applicable From Bind 
    getApplicableFrom() {
        this.acgroupServies.acApplicableFrom({
            "flag": "",
            "createdby": this.loginUser.login
        }).subscribe(data => {
            this.financiallist = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            //Completed
        })
    }

    //Auto Completed Nature
    getAutoCompleteNature(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "nature",
            "search": that.neturname,
            "cmpid": this.loginUser.cmpid,
            "FY": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".neturofgr").autocomplete({
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
                    me.neturid = ui.item.value;
                    me.neturname = ui.item.label;
                    me.category = ui.item.category;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Edit Account Group
    Editgroup(groupid) {
        this.acgroupServies.acGroupView({
            "flag": "",
            "groupid": groupid,
            "neturid": 0,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            this.editmode = true;
            var dataset = data.data;
            this.groupcode = dataset[0].groupcode;
            this.groupName = dataset[0].groupname;
            this.neturname = dataset[0].val;
            this.neturid = dataset[0].natureofg;
            this.appfrom = dataset[0].appfromedit;
            this.isactive = dataset[0].isactive;
            if (this.appfrom == 0) {
                this.chkall = true;
            }
            this.remark = dataset[0].remark;
            //$(".groupcode").focus();
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Clear All Control
    ClearControll() {
        this.groupcode = "";
        this.groupName = "";
        this.neturname = "";
        this.neturid = 0;
        this.remark = "";
        this.appfrom = "";
        this.chkall = false;
        this.editmode=false;
        $(".groupcode").removeAttr('disabled', 'disabled');
        $(".groupcode").focus();
    }

    //Check All 
    checkall() {
        if (this.chkall == undefined) {
            this.chkall = true;
        }

        if (this.chkall == true) {
            this.appfrom = "";
        }
    }

    //Return Json Param
    JsonParam() {
        if (this.chkall == true) {
            this.appfrom = 0;
        }
        var Param = {
            "groupid": this.groupid,
            "groupcode": this.groupcode,
            "groupname": this.groupName,
            "parentgr": this.parentgr == "" ? 0 : this.parentgr,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "applyfrom": this.appfrom,
            "createdby": this.loginUser.login,
            "neturid": this.neturid,
            "remark": this.remark,
            "isactive": this.isactive,
            "remark1": "remark1",
            "remark2": "remark2",
            "remark3": "remark3"
        }
        return Param;

    }


    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['master/acgroup']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            this.acgroupServies.acGroupSave(
                this.JsonParam()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_acgroup.maxid === "exists") {
                    this._msg.Show(messageType.info, "info", dataset[0].funsave_acgroup.msg);
                    this.ClearControll();
                    return;
                }
                if (dataset[0].funsave_acgroup.maxid > 0) {
                    this._msg.Show(messageType.success, "success", dataset[0].funsave_acgroup.msg);
                    $(".code").removeAttr('disabled', 'disabled');
                    this.ClearControll();
                    return;
                }
                else {
                    alert('Save Error');
                    return;
                }
            }, err => {
                console.log("Error");
            }, () => {
                'Final'
            });

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".groupcode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".groupName").focus();
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
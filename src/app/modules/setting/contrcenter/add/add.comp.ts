import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ContrService } from "../../../../_service/contrcenter/contr-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'add.comp.html',
    providers: [ContrService, CommonService]
})

export class contradd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    autoid: any = 0;
    ctrlname: any = "";
    profitcode: any = "";
    costcode: any = "";
    empid: any = 0;
    empname: any = "";
    narration: any = "";
    editmode: boolean = false;
    isactive: boolean = false;
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private ctrlServies: ContrService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute,
        private _userService: UserService,
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

        $(".ctrlname").focus();

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.autoid = params['id'];
                this.EditCtrl(this.autoid);

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

    EditCtrl(autoid) {
        this.ctrlServies.getCtrlcenter({
            "cmpid": this.loginUser.cmpid,
            "ctrlid": autoid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            var dataset = result.data;
            this.editmode = true;
            this.ctrlname = dataset[0][0].ctrlname;
            this.profitcode = dataset[0][0].profitctr;
            this.costcode = dataset[0][0].costctr;
            this.empid = dataset[0][0].empid;
            this.empname = dataset[0][0].person;
            this.narration = dataset[0][0].narration;
            this.isactive = dataset[0][0].isactive;
            $(".ctrlname").focus();
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
    }

    getPersonAuto(me: any) {
        var that = this;
        this._autoservice.getAutoData({
            "type": "userwithcode",
            "search": that.empname,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            $(".empname").autocomplete({
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
                    me.empid = ui.item.value;
                    me.empname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ClearControll() {
        this.ctrlname = "";
        this.profitcode = "";
        this.costcode = "";
        this.empname = "";
        this.empid = 0;
        this.editmode = false;
        this.narration = "";
    }

    paramjson() {
        var param = {
            "ctrlid": this.autoid,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "ctrlname": this.ctrlname,
            "profitcode": this.profitcode,
            "costcode": this.costcode,
            "empid": this.empid,
            "isactive": this.isactive,
            "createdby": this.loginUser.login,
            "narration": this.narration
        }

        return param;
    }


    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['/setting/contrcenter']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();

            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }

            this.ctrlServies.saveCtrlcenter(this.paramjson()).subscribe(result => {
                var dataset = result.data;

                if (dataset[0].funsave_ctrlcenter.maxid == -1) {
                    this._msg.Show(messageType.info, "info", "Center Name already exists");
                    $(".ctrlname").focus();
                    return;
                }
                if (dataset[0].funsave_ctrlcenter.maxid > 0) {
                    this._msg.Show(messageType.success, "success", "Data Save Successfully");
                    this.ClearControll();
                    $(".ctrlname").focus();
                    return;
                }
                else {
                    console.log(dataset);
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

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;

            $(".ctrlname").focus();
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
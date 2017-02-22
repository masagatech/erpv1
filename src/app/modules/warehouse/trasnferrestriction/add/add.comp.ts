import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { TransferrestrictionService } from "../../../../_service/transferrestriction/transferres-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [TransferrestrictionService, CommonService]

}) export class TRAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    froma: any = "";
    fromaid: any = 0;
    fromb: any = "";
    frombid: any = 0;
    whlist: any = [];
    Duplicateflag: boolean;
    counter: number = 0;
    remark: any = "";
    trid: number = 0;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;



    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private TRServies: TransferrestrictionService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService) { //Inherit Service
        this.loginUser = this._userService.getUser();
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, true));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Transfer Restriction");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        setTimeout(function () {
            commonfun.addrequire();
        }, 0);
        $(".wha").focus();
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.trid = params['id'];
                this.editMode(this.trid);

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


    loadRBIGrid(event: LazyLoadEvent) {
    }

    //New Add Warehouse
    NewAddWH() {
        var that = this;
        var validateme = commonfun.validate();
        if (!validateme.status) {
            this._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }
        if ($('.wha').val() == $('.whb').val()) {
            that._msg.Show(messageType.info, "info", "From A And From B Same");
            return;
        }
        try {
            if (that.frombid > 0) {
                $(".add").prop("disabled", true);
                that.Duplicateflag = true;
                for (var i = 0; i < that.whlist.length; i++) {
                    if (that.whlist[i].whname == that.fromb.split(':')[1]) {
                        that.Duplicateflag = false;
                        break;
                    }
                }
                if (that.Duplicateflag == true) {
                    that.whlist.push({
                        'whid': that.frombid,
                        'whcode': that.fromb.split(':')[0],
                        'whname': that.fromb.split(':')[1],
                        'counter': that.counter
                    });
                    that.counter++;
                    that.fromb = "";
                    that.frombid = 0;
                    $(".whb").focus();
                }
                else {
                    that._msg.Show(messageType.info, "info", "Duplicate Warehouse");
                    $(".add").prop("disabled", false);
                    return;
                }
            }
            else {
                that._msg.Show(messageType.info, "info", "Please Enter Valied Warehouse");
                $(".whb").focus();
                return;
            }

        } catch (e) {
            that._msg.Show(messageType.error, "error", e.message);
            $(".wha").focus();
            return;
        }
        $(".add").prop("disabled", false);
    }

    //Edit Mode
    editMode(trid: number) {
        this.TRServies.getTransferRes({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "edit",
            "trid": trid,
            "createdby": this.loginUser.login
        }).subscribe(itemsdata => {
            var Result = itemsdata.data;
            if (Result.length > 0) {
                debugger;
                this.froma = Result[0][0].whname;
                this.fromaid = Result[0][0].autoid;
                this.remark = Result[0][0].remark;
                this.whlist = Result[0][0]._details;
            }
        }, err => {
            console.log("Error");
        }, () => {
            //console.log("Done");
        });
    }

    //Delete Row
    DeleteRow(item) {
        try {
            var index = -1;
            for (var i = 0; i < this.whlist.length; i++) {
                if (this.whlist[i].counter === item.counter) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                console.log("Wrong Delete Entry");
            }
            this.whlist.splice(index, 1);
            $("#foot_custname").focus();
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Warehouse AutoExtender From A
    getAutoCompleteWha(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouse",
            "search": _me.froma,
            "cmpid": _me.loginUser.cmpid
        }).subscribe(data => {
            $(".wha").autocomplete({
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
                    me.fromaid = ui.item.value;
                    me.froma = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Warehouse AutoExtender From A
    getAutoCompleteWhb(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouse",
            "search": _me.fromb,
            "cmpid": _me.loginUser.cmpid
        }).subscribe(data => {
            $(".whb").autocomplete({
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
                    me.frombid = ui.item.value;
                    me.fromb = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Refresh Button Click Event
    ClearControl() {
        var that = this;
        that.froma = "";
        that.fromaid = 0;
        that.fromb = "";
        that.frombid = 0;
        that.remark = "";
        that.whlist = [];
        $(".wha").prop('disabled', false);
        $(".wha").focus();
    }

    createjson() {
        var arry = [];
        for (let item of this.whlist) {
            arry.push({
                'id': item.whid
            })
        }
        return arry;
    }

    paramster() {
        var param = {
            'trid': this.trid,
            'cmpid': this.loginUser.cmpid,
            'fy': this.loginUser.fy,
            'froma': this.fromaid,
            'fromb': this.createjson(),
            'createdby': this.loginUser.login,
            'remark': this.remark,
            'remark1': '',
            'remark2': '',
            'remark3': []
        }
        return param;
    }

    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/transferres']);
        }
        if (evt === "clear") {
            this.ClearControl();
        }
        if (evt === "save") {
            this.TRServies.saveTransferRes(
                this.paramster()
            ).subscribe(data => {
                console.log(data.data);
                if (data.data[0].funsave_transferrestriction.maxid > 0) {
                    this._msg.Show(messageType.success, 'success', data.data[0].funsave_transferrestriction.msg);
                    this.ClearControl();
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".wha").prop('disabled', true);
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".whb").focus();
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
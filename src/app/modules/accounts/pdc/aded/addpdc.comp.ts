import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for customer */
import { PDCService } from '../../../../_service/pdc/pdc-service' /* add reference for emp */
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addpdc.comp.html',
    providers: [CommonService, PDCService, ALSService]
})

export class AddPDC implements OnInit, OnDestroy {
    title: string = "";
    loginUser: LoginUserModel;

    pdcid: number = 0;
    acid: number = 0;
    acname: string = "";
    bankid: string = "";
    chequeno: string = "";
    amount: any = "";
    pdctype: string = "";
    narration: string = "";
    isactive: boolean = false;

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    pdctypeDT: any = [];
    bankDT: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    formvals: string = "";

    @ViewChild("chequedate")
    chequedate: CalendarComp;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _userservice: UserService, private _pdcservice: PDCService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userservice.getUser();

        this.module = "PDC";
        this.fillDropDownList();
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "pdc", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.chequedate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    setMinMaxDate() {
        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.chequedate.setMinMaxDate(today, null);
    }

    ngOnInit() {
        this.chequedate.initialize(this.loginUser);
        //this.chequedate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        //this.setAuditDate();
        this.setMinMaxDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.setActionButtons.setTitle("Edit Post Dated Cheque");

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = true;
                $(".pdctype").focus();

                this.pdcid = params['id'];
                this.getPDCById(this.pdcid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.setActionButtons.setTitle("Add Post Dated Cheque");

                var date = new Date();
                this.chequedate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
                $(".pdctype").focus();

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.savePDCData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        } else if (evt === "back") {
            this._router.navigate(['/accounts/pdc']);
        }
    }

    fillDropDownList() {
        var that = this;

        that._pdcservice.getPDCDetails({ "flag": "dropdown" }).subscribe(data => {
            var d = data.data;
            
            this.pdctypeDT = d.filter(a => a.group === "pdctype");
            this.bankDT = d.filter(a => a.group === "bank");
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    existCustAuto() {
        var that = this;

        that._commonservice.getAutoData({
            "type": "customer", "cmpid": that.loginUser.cmpid, "search": that.acname
        }).subscribe(data => {
            if (data.data.length === 0) {
                that._msg.Show(messageType.info, "info", "This party not exists !!!");
                that.acname = "";
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCustAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "customer", "cmpid": that.loginUser.cmpid, "search": that.acname }).subscribe(data => {
            $(".acname").autocomplete({
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
                    me.acid = ui.item.value;
                    me.acname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // save pdc

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        var that = this;

        for (var i = 0; i < e.length; i++) {
            that.suppdoc.push({ "id": e[i].id });
        }

        that.actionButton.find(a => a.id === "save").enabled = true;
    }

    private isFormChange() {
        return (this.formvals == $("#frmpdc").serialize());
    }

    savePDCData() {
        var that = this;

        if (that.isFormChange()) {
            that._msg.Show(messageType.info, "info", "No save! There is no change!");
            return;
        };

        var validateme = commonfun.validate();

        if (!validateme.status) {
            that._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }

        var savepdc = {
            "pdcid": that.pdcid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "acid": that.acid,
            "amount": that.amount,
            "bankid": that.bankid,
            "chequeno": that.chequeno,
            "chequedate": that.chequedate.getDate(),
            "pdctype": that.pdctype,
            "narration": that.narration,
            "suppdoc": that.suppdoc,
            "uidcode": that.loginUser.login,
            "isactive": that.isactive
        }

        that._pdcservice.savePDCDetails(savepdc).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_pdc.msgid != "-1") {
                that._msg.Show(messageType.success, "Success", dataResult[0].funsave_pdc.msg);
                that._router.navigate(['/accounts/pdc']);
            }
            else {
                that._msg.Show(messageType.error, "Error", dataResult[0].funsave_pdc.msg);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    // get pdc

    getPDCById(id) {
        var that = this;

        that._pdcservice.getPDCDetails({ "flag": "id", "pdcid": id }).subscribe(data => {
            var _pdcdata = data.data[0]._pdcdata;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            that.pdcid = _pdcdata[0].pdcid;
            that.pdctype = _pdcdata[0].pdctype;
            that.acid = _pdcdata[0].acid;
            that.acname = _pdcdata[0].acname;

            var date = new Date(_pdcdata[0].chequedate);
            that.chequedate.setDate(date);

            that.amount = _pdcdata[0].amount;
            that.bankid = _pdcdata[0].bankid;
            that.chequeno = _pdcdata[0].chequeno;
            that.narration = _pdcdata[0].narration;
            that.isactive = _pdcdata[0].isactive;

            that.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            that.suppdoc = _suppdoc == null ? [] : _suppdoc;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
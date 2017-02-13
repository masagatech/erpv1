import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { BankReceiptService } from "../../../../_service/bankreceipt/bankreceipt-service";  //Service Add Refrence Bankpay-service.ts
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;

@Component({
    templateUrl: 'braded.comp.html',
    providers: [BankReceiptService, CommonService, ALSService] //Provides Add Service dcmaster-service.ts, AutoService
})

export class bankreceiptaddedit implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    autoid: number = 0;
    bankid: number = 0;

    @ViewChild("depdate")
    depdate: CalendarComp;

    typ: number = 0;
    acid: number = 0;
    acname: string = "";
    cheqno: string = "";
    amount: any = "";
    refno: string = "";
    narration: string = "";

    banknamelistDT: any = [];
    typelistDT: any = [];

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    //Page Load

    constructor(private setActionButtons: SharedVariableService, private _nrService: BankReceiptService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _router: Router, private _userService: UserService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Bank Receipt";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;

        this.getBankMasterDrop();
        this.getTypDrop();
    }

    resetBankReceipt() {
        this.autoid = 0;
        this.bankid = 0;
        var date = new Date();
        this.depdate.setDate(date);
        this.typ = 0;
        this.acid = 0;
        this.acname = "";
        this.cheqno = "";
        this.amount = "";
        this.refno = "";
        this.narration = "";
    }

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "br", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;

            if (lockdate != "")
                that.depdate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Document Ready

    ngOnInit() {
        this.depdate.initialize(this.loginUser);
        this.depdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".bankid").focus();

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                this.setActionButtons.setTitle("Accounts > Bank Receipt > Add");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.autoid = 0;
                this.resetBankReceipt();

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("Accounts > Bank Receipt > Edit");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);

                this.autoid = params['id'];
                this.GetBankReceipt(this.autoid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                this.setActionButtons.setTitle("Accounts > Bank Receipt > Details");

                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.autoid = params['id'];
                this.GetBankReceipt(this.autoid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    // Any Button Click

    actionBarEvt(evt) {
        if (evt === "save") {
            this.SaveBankReceipt(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/bankreceipt/edit/', this.autoid]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.SaveBankReceipt(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/bankreceipt']);
        }
    }

    // Get And Fill Edit Mode

    GetBankReceipt(pautoid) {
        this._nrService.getBankReceipt({ "flag": "edit", "autoid": pautoid }).subscribe(data => {
            var _bankreceipt = data.data[0]._bankreceipt;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            this.bankid = _bankreceipt[0].bankid;
            this.depdate = _bankreceipt[0].depdate;
            this.acname = _bankreceipt[0].partyname;
            this.acid = _bankreceipt[0].acid;
            this.refno = _bankreceipt[0].refno;
            this.typ = _bankreceipt[0].typ;
            this.cheqno = _bankreceipt[0].cheqno;
            this.amount = _bankreceipt[0].amount;
            this.narration = _bankreceipt[0].narration;

            this.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            this.suppdoc = _suppdoc == null ? [] : _suppdoc;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Clear All Controll After Saving

    ClearControll() {
        this.bankid = 0;
        this.depdate.setDate("");
        this.acname = "";
        this.refno = "";
        this.typ = 0;
        this.cheqno = "";
        this.amount = "";
        this.narration = "";
    }

    //Send Paramter In Save Method

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    SaveBankReceipt(isactive: boolean) {
        var that = this;

        // if (this.bankid == 0) {
        //     that._msg.Show(messageType.success, "Success", "Please Select Bank");
        //     $(".bankname").focus();
        //     return false;
        // }
        if (this.depdate.setDate("")) {
            that._msg.Show(messageType.success, "Success", "Please Enter Deposit Date");
            $(".depdate").focus();
            return false;
        }
        if (this.acname == "") {
            that._msg.Show(messageType.success, "Success", "Please Select Account Code");
            $(".custcode").focus();
            return false;
        }

        var ParamName = {
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "depdate": this.depdate.getDate(),
            "refno": this.refno,
            "bankid": this.bankid,
            "typ": this.typ,
            "acid": this.acid,
            "cheqno": this.cheqno,
            "amount": this.amount,
            "narration": this.narration,
            "uidcode": this.loginUser.login,
            "suppdoc": this.suppdoc,
            "isactive": isactive
        }

        this._nrService.saveBankReceipt(ParamName).subscribe(bank => {
            var dataResult = bank.data;

            if (dataResult[0].funsave_bankreceipt.msgid == 1) {
                that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bankreceipt.msg);
                this._router.navigate(['/accounts/bankreceipt']);
                return false;
            }
            else {
                that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bankreceipt.msg);
                return false;
            }
        }, err => {
            that._msg.Show(messageType.success, "Success", err);
            console.log(err);
        }, () => {
            //Done Process
        });
    }

    //Auto Completed Customer Name

    getAutoComplete(me: any) {
        var _me = this;
        var that = this;
        this._autoservice.getAutoData({ "type": "customer", "cmpid": this.loginUser.cmpid, "search": that.acname }).subscribe(data => {
            $(".custcode").autocomplete({
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

    // Get Bank Master And Type

    getBankMasterDrop() {
        this._nrService.getBankMaster({
            "type": "bank"
        }).subscribe(bank => {
            this.banknamelistDT = bank.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    getTypDrop() {
        this._nrService.getBankMaster({
            "type": "banktype"
        }).subscribe(banktype => {
            this.typelistDT = banktype.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
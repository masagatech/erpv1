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
declare var commonfun: any;

@Component({
    templateUrl: 'braded.comp.html',
    providers: [BankReceiptService, CommonService, ALSService] //Provides Add Service dcmaster-service.ts, AutoService
})

export class AddEditBankReceipt implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    // Declare Ledger Variable
    ledgerid: number = 0;
    ledgerParamDT: any = [];

    autoid: number = 0;
    bankid: number = 0;

    @ViewChild("depdate")
    depdate: CalendarComp;

    typ: string = "";
    custid: number = 0;
    custcode: string = "";
    custname: string = "";
    ccid: number = 0;
    cheqno: string = "";
    amount: any = "";
    refno: string = "";
    narration: string = "";

    accountsDT: any = [];
    bankDT: any = [];
    banktypeDT: any = [];

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;
    ispdc: boolean = false;

    private subscribeParameters: any;

    //Page Load

    constructor(private setActionButtons: SharedVariableService, private _brService: BankReceiptService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _router: Router, private _userService: UserService, private _msg: MessageService,
        private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Bank Receipt";
        this.fillBankDDL();
        this.fillBankTypeDDL();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
        this.ispdc = _router.url.indexOf("pdc") > -1;
    }

    // Reset Fields

    resetBankReceipt() {
        this.autoid = 0;
        this.bankid = 0;
        var date = new Date();
        this.depdate.setDate(date);
        this.typ = "";
        this.custid = 0;
        this.custcode = "";
        this.custname = "";
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

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("A/C Receivable");

        setTimeout(function () {
            $(".custname input").focus();
        }, 0);

        this.depdate.initialize(this.loginUser);
        this.depdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
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
            else if (this.isdetails) {
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
            else if (this.ispdc) {
                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $('.cheqno').prop('disabled', true);

                this.autoid = params['pdcid'];
                this.GetBankReceiptByPDC(this.autoid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
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

    //AutoCompletd Customer

    getAutoAccounts(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "customercc",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "uid": this.loginUser.uid,
            "typ": "",
            "search": query
        }).then(data => {
            this.accountsDT = data;
        });
    }

    //Selected Customer

    selectAutoAccounts(event) {
        this.custid = event.value;
        this.custcode = event.custcode;
        this.custname = event.label;
        this.ccid = event.ccid;
    }

    // Get Bank Master And Type

    fillBankDDL() {
        this._brService.getBankReceipt({
            "flag": "dropdown", "group": "bank", "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy, "uid": this.loginUser.uid
        }).subscribe(data => {
            this.bankDT = data.data;
        });
    }

    fillBankTypeDDL() {
        this._brService.getBankReceipt({
            "flag": "dropdown", "group": "banktype"
        }).subscribe(data => {
            this.banktypeDT = data.data;
        });
    }

    // Get And Fill Edit Mode

    GetBankReceipt(pautoid) {
        this._brService.getBankReceipt({ "flag": "edit", "autoid": pautoid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy }).subscribe(data => {
            var _bankreceipt = data.data[0]._bankreceipt;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;
            var _ledgerparam = data.data[0]._acledger;

            this.bankid = _bankreceipt[0].bankid;
            var chequedate = new Date(_bankreceipt[0].chequedate);
            this.depdate.setDate(chequedate);
            this.custid = _bankreceipt[0].acid;
            this.custcode = _bankreceipt[0].custcode;
            this.custname = _bankreceipt[0].partyname;
            this.ccid = _bankreceipt[0].ccid;
            this.refno = _bankreceipt[0].refno;
            this.typ = _bankreceipt[0].typ;
            this.cheqno = _bankreceipt[0].cheqno;
            this.amount = _bankreceipt[0].amount;
            this.narration = _bankreceipt[0].narration;

            this.uploadedFiles = _suppdoc === null ? [] : _suppdoc.length === 0 ? [] : _uploadedfile;
            this.suppdoc = _suppdoc === null ? [] : _suppdoc.length === 0 ? [] : _suppdoc;
            this.ledgerParamDT = _ledgerparam === null ? [] : _ledgerparam.length === 0 ? [] : _ledgerparam;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    GetBankReceiptByPDC(pautoid) {
        this._brService.getBankReceipt({ "flag": "pdc", "autoid": pautoid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy }).subscribe(data => {
            var _bankreceipt = data.data;

            this.bankid = _bankreceipt[0].bankid;
            var chequedate = new Date(_bankreceipt[0].chequedate);
            this.depdate.setDate(chequedate);
            this.custid = _bankreceipt[0].acid;
            this.custcode = _bankreceipt[0].custcode;
            this.custname = _bankreceipt[0].partyname;
            this.ccid = _bankreceipt[0].ccid;
            this.refno = "";
            this.typ = _bankreceipt[0].typ;
            this.cheqno = _bankreceipt[0].cheqno;
            this.amount = _bankreceipt[0].amount;
            this.narration = _bankreceipt[0].narration;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
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
        var validateme = commonfun.validate();

        if (that.custname === "") {
            that._msg.Show(messageType.error, "error", "Enter Account Code");
            $(".custname input").focus();
            return;
        }
        if (!validateme.status) {
            that._msg.Show(messageType.error, "error", validateme.msglist);
            validateme.data[0].input.focus();
            return;
        }

        if (that.ledgerParamDT.length === 0) {
            that.ledgerParamDT.push({
                "autoid": 0,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "module": "ar",
                "trndate": that.depdate.getDate(),
                "actype": "ac",
                "code": that.custcode,
                "name": that.custname,
                "dualac": { "typ": that.typ, "cheqno": that.cheqno, "code": that.bankid, "name": that.bankid },
                "dramt": 0,
                "cramt": that.amount,
                "narration": that.narration,
                "ccid": that.ccid,
                "createdby": that.loginUser.login
            });

            that.ledgerParamDT.push({
                "autoid": 0,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "module": "ar",
                "trndate": that.depdate.getDate(),
                "actype": "bank",
                "code": that.bankid,
                "name": that.bankid,
                "dualac": { "typ": that.typ, "cheqno": that.cheqno, "code": that.custcode, "name": that.custcode },
                "dramt": that.amount,
                "cramt": 0,
                "narration": that.narration,
                "ccid": that.ccid,
                "createdby": that.loginUser.login
            });
        }

        var ParamName = {
            "autoid": that.autoid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "depdate": that.depdate.getDate(),
            "refno": that.refno,
            "bankid": that.bankid,
            "typ": that.typ,
            "acid": that.custid,
            "cheqno": that.cheqno,
            "amount": that.amount,
            "narration": that.narration,
            "uidcode": that.loginUser.login,
            "suppdoc": that.suppdoc,
            "isactive": isactive,
            "ledgerparam": that.ledgerParamDT
        }

        that._brService.saveBankReceipt(ParamName).subscribe(bank => {
            try {
                var dataResult = bank.data;

                if (dataResult[0].funsave_bankreceipt.msgid == 1) {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bankreceipt.msg);
                    this._router.navigate(['/accounts/bankreceipt']);
                    return false;
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bankreceipt.msg);
                    return false;
                }
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            //Done Process
        });
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
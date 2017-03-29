import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { BankPaymentService } from "../../../../_service/bankpayment/bankpayment-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'bpae.comp.html',
    providers: [BankPaymentService, CommonService, ALSService]
})

export class AddEditBankPayment implements OnInit, OnDestroy {
    // Button
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    // Declare Ledger Variable
    ledgerParamDT: any = [];

    // Declare local Veriable
    autoid: number = 0;
    bankpayid: number = 0;
    custid: number = 0;
    custcode: string = "";
    custname: string = "";
    bankid: number = 0;
    bankcode: string = "";
    amount: number = 0;
    cheqno: string = "";
    narration: string = "";
    refno: string = "";
    typ: string = "";
    ischeqbounce: boolean = false;

    accountsDT: any = [];
    bankDT: any = [];
    banktypeDT: any = [];

    @ViewChild("issuedate")
    issuedate: CalendarComp;

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    // On Page Load

    constructor(private setActionButtons: SharedVariableService, private _bpservice: BankPaymentService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _router: Router,
        private _userService: UserService, private _msg: MessageService, private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Bank Payment";
        this.fillBankDDL();
        this.fillBankTypeDDL();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // On Pre Render

    setAuditDate() {
        var that = this;

        that._alsservice.getAuditLockSetting({
            "flag": "modulewise", "dispnm": "bpae", "fy": that.loginUser.fy
        }).subscribe(data => {
            var dataResult = data.data;
            var lockdate = dataResult[0].lockdate;
            if (lockdate != "")
                that.issuedate.setMinMaxDate(new Date(lockdate), null);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("A/C Payble");

        setTimeout(function () {
            $(".custname input").focus();
        }, 0);

        this.issuedate.initialize(this.loginUser);
        this.issuedate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.setAuditDate();

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        //Edit Mode
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (this.isadd) {
                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $(".custcode").focus();

                var date = new Date();
                this.issuedate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $(".custcode").focus();

                this.autoid = params['id'];
                this.GetBankPayment(this.autoid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                $('button').prop('disabled', true);
                $('input').prop('disabled', true);
                $('select').prop('disabled', true);
                $('textarea').prop('disabled', true);

                this.autoid = params['id'];
                this.GetBankPayment(this.autoid);

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
        });
    }

    //Any Button Click Event Add Edit And Save

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveBankPayment(true);
        } else if (evt === "edit") {
            this._router.navigate(['/accounts/bankpayment/edit/', this.autoid]);
        } else if (evt === "delete") {
            this._msg.confirm('Are you sure that you want to delete?', () => {
                this.saveBankPayment(false);
            });
        } else if (evt === "back") {
            this._router.navigate(['/accounts/bankpayment']);
        }
    }

    // Clear All Fields

    ClearFields() {
        this.autoid = 0;
        this.bankid = 0;
        this.issuedate.setDate("");
        this.custname = "";
        this.refno = "";
        this.typ = "";
        this.amount = 0;
        this.cheqno = "";
        this.narration = "";
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
    }

    // Get Bank Master And Type

    fillBankDDL() {
        this._bpservice.getBankPayment({
            "flag": "dropdown", "group": "bank", "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy, "uid": this.loginUser.uid
        }).subscribe(data => {
            this.bankDT = data.data;
        });
    }

    fillBankTypeDDL() {
        this._bpservice.getBankPayment({
            "flag": "dropdown", "group": "banktype"
        }).subscribe(data => {
            this.banktypeDT = data.data;
        });
    }

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    //Get Data With Row

    GetBankPayment(pautoid) {
        this._bpservice.getBankPayment({ "flag": "edit", "autoid": pautoid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy }).subscribe(data => {
            var _bankpayment = data.data[0]._bankpayment;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;
            var _ledgerparam = data.data[0]._acledger;

            this.autoid = _bankpayment[0].autoid;
            this.bankid = _bankpayment[0].bankid;
            var _issuedate = new Date(_bankpayment[0].issuedate);
            this.issuedate.setDate(_issuedate);
            this.custid = _bankpayment[0].custid;
            this.custcode = _bankpayment[0].custcode;
            this.custname = _bankpayment[0].custname;
            this.refno = _bankpayment[0].refno;
            this.typ = _bankpayment[0].typ;
            this.cheqno = _bankpayment[0].cheqno;
            this.amount = _bankpayment[0].amount;
            this.narration = _bankpayment[0].narration;
            this.ischeqbounce = _bankpayment[0].ischeqbounce;

            this.uploadedFiles = _suppdoc === null ? [] : _suppdoc.length === 0 ? [] : _uploadedfile;
            this.suppdoc = _suppdoc === null ? [] : _suppdoc.length === 0 ? [] : _suppdoc;
            this.ledgerParamDT = _ledgerparam === null ? [] : _ledgerparam.length === 0 ? [] : _ledgerparam;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Send Paramter In Save Method

    saveBankPayment(isactive) {
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
                "module": "ap",
                "trndate": that.issuedate.getDate(),
                "actype": "ac",
                "code": that.custcode,
                "dualac": { "typ": that.typ, "cheqno": that.cheqno, "code": that.bankid, "name": that.bankid },
                "dramt": that.amount,
                "cramt": 0,
                "narration": that.narration,
                "createdby": that.loginUser.login
            });

            that.ledgerParamDT.push({
                "autoid": 0,
                "cmpid": that.loginUser.cmpid,
                "fy": that.loginUser.fy,
                "module": "ap",
                "trndate": that.issuedate.getDate(),
                "actype": "bank",
                "code": that.bankid,
                "dualac": { "typ": that.typ, "cheqno": that.cheqno, "code": that.custcode, "name": that.custcode },
                "dramt": 0,
                "cramt": that.amount,
                "narration": that.narration,
                "createdby": that.loginUser.login
            });
        }

        var ParamName = {
            "autoid": that.autoid,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "bankpayid": that.bankpayid,
            "refno": that.refno,
            "acid": that.custid,
            "bankid": that.bankid,
            "issuedate": that.issuedate.getDate(),
            "uidcode": that.loginUser.login,
            "suppdoc": that.suppdoc,
            "typ": that.typ,
            "amount": that.amount,
            "cheqno": that.cheqno,
            "narration": that.narration,
            "ischeqbounce": that.ischeqbounce,
            "isactive": isactive,
            "ledgerparam": that.ledgerParamDT
        }

        that._bpservice.saveBankPayment(ParamName).subscribe(result => {
            try {
                var dataResult = result.data;

                if (dataResult[0].funsave_bankpayment.msgid == "1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bankpayment.msg);
                    that._router.navigate(['/accounts/bankpayment']);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bankpayment.msg);
                }
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            //Complete
        })
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
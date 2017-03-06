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

@Component({
    templateUrl: 'bpae.comp.html',
    providers: [BankPaymentService, CommonService, ALSService]
})

export class AddEditBankPayment implements OnInit, OnDestroy {
    // Button
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    // Declare local Veriable
    autoid: number = 0;
    bankpayid: number = 0;
    custid: number = 0;
    custname: string = "";
    bankid: number = 0;
    bankcode: string = "";
    amount: number = 0;
    cheqno: string = "";
    narration: string = "";
    refno: string = "";
    typ: number = 0;

    banknameListDT: any = [];
    typelistDT: any = [];

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
        this.getBankMasterDrop();
        this.getTypDrop();

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

    ngOnInit() {
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
                this.setActionButtons.setTitle("A/C Payble > Add");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $(".bankpay").focus();

                var date = new Date();
                this.issuedate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = true;
            }
            else if (this.isedit) {
                this.setActionButtons.setTitle("A/C Payble > Edit");

                $('button').prop('disabled', false);
                $('input').prop('disabled', false);
                $('select').prop('disabled', false);
                $('textarea').prop('disabled', false);
                $(".bankpay").focus();

                this.autoid = params['id'];
                this.GetBankPayment(this.autoid);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
                this.actionButton.find(a => a.id === "delete").hide = false;
            }
            else {
                this.setActionButtons.setTitle("A/C Payble > Details");

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
        this.typ = 0;
        this.amount = 0;
        this.cheqno = "";
        this.narration = "";

        $(".bankpay").focus();
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
        this._bpservice.getBankPayment({ "autoid": pautoid, "flag": "edit" }).subscribe(data => {
            var _bankpayment = data.data[0]._bankpayment;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            this.autoid = _bankpayment[0].autoid;
            this.bankid = _bankpayment[0].bank;
            var _issuedate = new Date(_bankpayment[0].issuedate);
            this.issuedate.setDate(_issuedate);
            this.custid = _bankpayment[0].custid;
            this.custname = _bankpayment[0].partyname;
            this.refno = _bankpayment[0].refno;
            this.typ = _bankpayment[0].typ;
            this.cheqno = _bankpayment[0].cheqno;
            this.amount = _bankpayment[0].amount;
            this.narration = _bankpayment[0].narration;

            this.uploadedFiles = _suppdoc.length === 0 ? [] : _uploadedfile;
            this.suppdoc = _suppdoc.length === 0 ? [] : _suppdoc;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Auto Completed Customer Name

    getAutoComplete(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "customer", "cmpid": this.loginUser.cmpid, "search": this.custname }).subscribe(data => {
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
                    me.custid = ui.item.value;
                    me.custname = ui.item.label;
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
        this._bpservice.getBankMaster({
            "type": "bank"
        }).subscribe(BankName => {
            var dataset = BankName.data;
            this.banknameListDT = BankName.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    getTypDrop() {
        this._bpservice.getBankMaster({
            "type": "banktype"
        }).subscribe(BankType => {
            this.typelistDT = BankType.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Send Paramter In Save Method

    saveBankPayment(isactive) {
        // if (this.bankid == 0) {
        //     this._msg.Show(messageType.info, "Info", "Please Select Bank");
        //     return false;
        // }
        if (this.issuedate.setDate("")) {
            this._msg.Show(messageType.info, "Info", "Please Enter Issues Date");
            return false;
        }
        if (this.custname == undefined || this.custname == null) {
            this._msg.Show(messageType.info, "Info", "Please Enter Account");
            return false;
        }

        var Param = {
            "autoid": this.autoid,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "bankpayid": this.bankpayid,
            "refno": this.refno,
            "acid": this.custid,
            "bankid": this.bankid,
            "issuedate": this.issuedate.getDate(),
            "uidcode": this.loginUser.login,
            "suppdoc": this.suppdoc,
            "typ": this.typ,
            "amount": this.amount,
            "cheqno": this.cheqno,
            "narration": this.narration,
            "isactive": isactive
        }

        this._bpservice.saveBankPayment(Param).subscribe(result => {
            var dataResult = result.data;

            if (dataResult[0].funsave_bankpayment.msgid == "1") {
                this._msg.Show(messageType.success, "Success", dataResult[0].funsave_bankpayment.msg);
                this._router.navigate(['/accounts/bankpayment']);
            }
            else {
                this._msg.Show(messageType.error, "Error", dataResult[0].funsave_bankpayment.msg);
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
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
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { bankpaymentService } from "../../../../_service/bankpayment/aded/bankpayment-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { Router, ActivatedRoute } from '@angular/router';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

declare var $: any;
@Component({
    templateUrl: 'bpae.comp.html',
    providers: [bankpaymentService, CommonService, ALSService]
})

export class bankpaymentaddedit implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    //Declare local Veriable
    BankPayId: any = 0;
    BankNamelist: any = [];
    Typelist: any = [];
    custname: any = "";
    custid: any = 0;
    Bankid: any = 0;
    BankCode: any = '';
    Amount: any = 0;
    ChequeNo: any = 0;
    Remark: any = '';
    Remark1: any = '';
    Remark2: any = '';
    Remark3: any = '';
    Refno: any = '';
    Type: any = 0;

    @ViewChild("issuedate")
    issuedate: CalendarComp;

    module: string = "";
    suppdoc: any = [];
    uploadedFiles: any = [];

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private BankServies: bankpaymentService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _router: Router,
        private _userService: UserService, private _alsservice: ALSService) {
        this.loginUser = this._userService.getUser();
        this.module = "Bank Payment";
        this.getBankMasterDrop();
        this.getTypDrop();
    }

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

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".bankpay").focus();

        //Edit Mode
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.BankPayId = params['id'];
                this.GetBankPayment(this.BankPayId);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                var date = new Date();
                this.issuedate.setDate(date);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    //CLear All Controll

    ClearControll() {
        this.Bankid = "";
        this.issuedate.setDate("");
        this.custname = "";
        this.Refno = "";
        this.Type = "";
        this.Amount = "";
        this.ChequeNo = "";
        this.Remark = "";
        this.Remark1 = "";
        this.Remark2 = "";
        this.Remark3 = "";
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

    GetBankPayment(BankPayId) {
        this.BankServies.getBankPaymentView({
            "bankpayid": this.BankPayId,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "edit"
        }).subscribe(data => {
            console.log(data.data);

            var _bankpayment = data.data[0]._bankpayment;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _suppdoc = data.data[0]._suppdoc;

            this.Bankid = _bankpayment[0].bank;

            var _issuedate = new Date(_bankpayment[0].issuedate);
            this.issuedate.setDate(_issuedate);
            this.custid = _bankpayment[0].custid;
            this.custname = _bankpayment[0].partyname;
            this.Refno = _bankpayment[0].refno;
            this.Type = _bankpayment[0].typ;
            this.ChequeNo = _bankpayment[0].cheqno;
            this.Amount = _bankpayment[0].amount;
            this.Remark = _bankpayment[0].remark;

            this.uploadedFiles = _suppdoc == null ? [] : _uploadedfile;
            this.suppdoc = _suppdoc == null ? [] : _suppdoc;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Send Paramter In Save Method

    ParamJson() {
        var Param = {
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "bankpayid": this.BankPayId,
            "refno": this.Refno,
            "acid": this.custid,
            "bankid": this.Bankid,
            "issuedate": this.issuedate.getDate(),
            "createdby": this.loginUser.login,
            "suppdoc": this.suppdoc,
            "typ": this.Type,
            "amount": this.Amount,
            "cheqno": this.ChequeNo,
            "remark": this.Remark,
            "remark1": this.Remark1,
            "remark2": this.Remark2,
            "remark3": this.Remark3
        }
        return Param;

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
        this.BankServies.getBankMaster({
            "type": "bank"
        }).subscribe(BankName => {
            var dataset = BankName.data;
            this.BankNamelist = BankName.data;
            //this.Typelist = dataset.Table1;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    getTypDrop() {
        this.BankServies.getBankMaster({
            "type": "BankType"
        }).subscribe(BankType => {
            this.Typelist = BankType.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Any Button Click Event Add Edit And Save

    actionBarEvt(evt) {
        if (evt === "save") {
            if (this.Bankid == undefined || this.Bankid == null) {
                alert('Please Selected Bank');
                return false;
            }
            if ($('#issuedate').val() == "") {
                alert('Please Selected Issues Date');
                return false;
            }
            if (this.custname == undefined || this.custname == null) {
                alert('Please Selected Account Code');
                return false;
            }

            this.BankServies.saveBankPayment(this.ParamJson()).subscribe(result => {
                var returndata = result.data;
                console.log(returndata);
                if (returndata[0].funsave_bankpayment.msg == "Saved") {
                    alert('Data Save Successfully');
                    this._router.navigate(['/accounts/bankpayment']);
                }
            }, err => {
                console.log(err);
            }, () => {
                //Complete
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".bankpay").focus();
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
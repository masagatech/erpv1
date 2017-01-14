import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { bankpaymentService } from "../../../../_service/bankpayment/aded/bankpayment-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'bpae.comp.html',
    providers: [bankpaymentService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
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
    CustName: any = "";
    CustID: any = 0;
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
    Issuesdate: any;

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private BankServies: bankpaymentService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _router: Router,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.module = "Bank Payment";
        this.getBankMasterDrop();
        this.getTypDrop();
    }

    //CLear All Controll

    ClearControll() {
        this.Bankid = "";
        this.Issuesdate = "";
        this.CustName = "";
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
            this.docfile.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    //Get Data With Row

    GetBankPayment(BankPayId) {
        this.BankServies.getBankPaymentView({
            "bankpayid": this.BankPayId,
            "cmpid": this.loginUser.cmpid,
            "fyid": this.loginUser.fyid,
            "flag": "edit"
        }).subscribe(data => {
            console.log(data.data);

            var _bankpayment = data.data[0]._bankpayment;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _docfile = data.data[0]._docfile;

            this.Bankid = _bankpayment[0].bank;
            this.Issuesdate = _bankpayment[0].issuedate;
            this.CustID = _bankpayment[0].custid;
            this.CustName = _bankpayment[0].partyname;
            this.Refno = _bankpayment[0].refno;
            this.Type = _bankpayment[0].typ;
            this.ChequeNo = _bankpayment[0].cheqno;
            this.Amount = _bankpayment[0].amount;
            this.Remark = _bankpayment[0].remark;

            this.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            this.docfile = _docfile == null ? [] : _docfile;
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
            "fy": this.loginUser.fyid,
            "bankpayid": this.BankPayId,
            "refno": this.Refno,
            "acid": this.CustID,
            "bankid": this.Bankid,
            "issuedate": $('#Issuesdate').datepicker('getDate'),
            "createdby": this.loginUser.login,
            "docfile": this.docfile,
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
        this._autoservice.getAutoData({ "type": "customer", "search": this.CustName }).subscribe(data => {
            $(".Custcode").autocomplete({
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
                    me.CustID = ui.item.value;
                    me.CustName = ui.item.label;
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

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".bankpay").focus();

        // setTimeout(function () {
        //     var date = new Date();
        //     var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        //     //From Date 
        //     $("#Issuesdate").datepicker({
        //         dateFormat: "dd/mm/yy",
        //         autoclose: true,
        //         setDate: new Date()
        //     });
        //     $("#Issuesdate").datepicker('setDate', today);
        // }, 0);

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
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    //Any Button Click Event Add Edit And Save

    actionBarEvt(evt) {
        if (evt === "save") {
            if (this.Bankid == undefined || this.Bankid == null) {
                alert('Please Selected Bank');
                return false;
            }
            if ($('#Issuesdate').val() == "") {
                alert('Please Selected Issues Date');
                return false;
            }
            if (this.CustName == undefined || this.CustName == null) {
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
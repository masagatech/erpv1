import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { bankReceiptService } from "../../../../_service/bankreceipt/aded/bankreceipt-service";  //Service Add Refrence Bankpay-service.ts

import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
    templateUrl: 'braded.comp.html',
    providers: [bankReceiptService, CommonService] //Provides Add Service dcmaster-service.ts, AutoService
})

export class bankreceiptaddedit implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Declare Local Veriable 
    private subscribeParameters: any;
    BankName: any = "";
    BankRecpId: any = 0;
    Issuesdate: any = "";
    CustName: any = "";
    CustID: any = 0;
    Refno: any = "";
    DepDate: any = "";
    TypeName: any = 0;
    Amount: any = 0;
    ChequeNo: any = 0;
    Naration: any = "";
    Remark1: any = "";
    Remark2: any = "";
    Remark3: any = "";
    BankNamelist: any = [];
    Typelist: any = [];

    module: string = "";
    docfile: any = [];
    uploadedFiles: any = [];

    //constructor Call Method 

    constructor(private setActionButtons: SharedVariableService, private BankServies: bankReceiptService,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _router: Router ) {
        this.module = "Bank Receipt";
        this.getBankMasterDrop();
        this.getTypDrop();
    }

    //Get And Fill Edit Mode

    GetBankPayment(BankPayId) {
        this.BankServies.getBankReceiptView({ "bankreid": this.BankRecpId, "cmpid": 1, "fyid": 5, "flag": "edit" }).subscribe(data => {
            var _bankreceipt = data.data[0]._bankreceipt;
            var _uploadedfile = data.data[0]._uploadedfile;
            var _docfile = data.data[0]._docfile;

            this.BankName = _bankreceipt[0].bank;
            this.DepDate = _bankreceipt[0].depdate;
            this.CustName = _bankreceipt[0].partyname;
            this.CustID = _bankreceipt[0].custid;
            this.Refno = _bankreceipt[0].refno;
            this.TypeName = _bankreceipt[0].typ;
            this.ChequeNo = _bankreceipt[0].cheqno;
            this.Amount = _bankreceipt[0].amount;
            this.Naration = _bankreceipt[0].naration;

            this.uploadedFiles = _docfile == null ? [] : _uploadedfile;
            this.docfile = _docfile == null ? [] : _docfile;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Clear All Controll After Saving

    ClearControll() {
        this.BankName = "";
        this.DepDate = "";
        this.CustName = "";
        this.Refno = "";
        this.TypeName = "";
        this.ChequeNo = "";
        this.Amount = "";
        this.Naration = "";
    }

    //Send Paramter In Save Method

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.docfile.push({ "id": e[i].id });
        }

        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    ParamJson() {
        var ParamName = {
            "cmpid": 1,
            "createdby": "Admin",
            "fyid": 5,
            "refno": this.Refno,
            "bankreid": this.BankRecpId,
            //"depdate": $('#DepDate').datepicker('getDate'),
            "bankid": this.BankName,
            "typ": this.TypeName,
            "acid": this.CustID,
            "cheqno": this.ChequeNo,
            "amount": this.Amount,
            "naration": this.Naration,
            "docfile": this.docfile
        }
        return ParamName;
    }

    //Auto Completed Customer Name

    getAutoComplete(me: any) {
        var _me = this;
        var that = this;
        this._autoservice.getAutoData({ "type": "customer", "search": that.CustName }).subscribe(data => {
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

    // Any Button Click

    actionBarEvt(evt) {
        if (evt === "save") {
            this.DepDate = $('#DepDate').val();

            if (this.BankName == "") {
                alert('Please Selected Bank');
                $(".bankname").focus();
                return false;
            }
            if (this.DepDate == undefined || this.DepDate == null) {
                alert('Please Selected Depside Date');
                $("#DepDate").focus();
                return false;
            }
            if (this.CustName == undefined || this.CustName == null) {
                alert('Please Selected Account Code');
                $(".Custcode").focus();
                return false;
            }

            this.BankServies.saveBankReceipt(this.ParamJson()).subscribe(BankName => {
                var dataset = BankName.data;

                if (dataset[0].funsave_bankreceipt.msg == 'save') {
                    alert("Data Save Successfully");
                    this._router.navigate(['/accounts/bankreceipt']);
                    return false;
                }
                else {
                    alert("Error");
                    return false;
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });

            this.actionButton.find(a => a.id === "save").hide = true;
            this.actionButton.find(a => a.id === "edit").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".bankname").focus();

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Document Ready

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".bankname").focus();

        // setTimeout(function () {
        //     var date = new Date();
        //     var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        //     //DepDate 
        //     $("#DepDate").datepicker({
        //         dateFormat: "dd-mm-yy",
        //         //startDate: new Date(),        //Disable Past Date
        //         autoclose: true,
        //         setDate: new Date()
        //     });
        //     $("#DepDate").datepicker('setDate', today);

        // }, 0);

        //Table Row a Tag Click  
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.BankRecpId = params['id'];
                this.GetBankPayment(this.BankRecpId);

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

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
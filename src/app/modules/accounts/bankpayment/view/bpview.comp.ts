import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { bankpaymentViewService } from "../../../../_service/bankpayment/view/bankview-service";  //Service Add Refrence Bankpay-service.ts

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'bpview.comp.html',
    providers: [bankpaymentViewService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
})

export class bankpaymentview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Veriable Declare 
    BankPayId: any=0;
    BankNamelist: any=[];
    BankPaymentView: any=[];
    Bankid: any=0;
    FromDate: any="";
    ToDate: any="";
    tableLength: any;



    constructor(private _router: Router, private setActionButtons: SharedVariableService, private BankServies: bankpaymentViewService) { //Inherit Service dcmasterService
        this.getBankMasterDrop();

    }
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableLength = true;

        setTimeout(function () {
            var date = new Date();
            var Fromtoday = new Date(date.getFullYear(), date.getMonth(), date.getDate()-1);
            var Totoday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
              $("#FromDate").datepicker('setDate',Fromtoday);

            //To Date
            $("#ToDate").datepicker({
                dateFormat: 'dd/mm/yy',
                 minDate: 0,
                setDate: new Date(),
                autoclose: true
            });
              $("#ToDate").datepicker('setDate',Totoday);
        }, 0);

    }

    //Open Edit Mode 
    OpenEdit(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/accounts/bpedit', row.id]);
        }
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/bpadd']);
        }
        if (evt === "save") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }



    //Get Button Click Event
    GetBankPayment() {
        this.FromDate=$('#FromDate').val();
        this.ToDate=$("#ToDate").val();
        this.tableLength = true;
        this.BankPaymentView = [];
        if (this.Bankid == undefined || this.Bankid == '') {
            alert('Please Select Bank');
            return false;
        }
        if (this.FromDate == undefined || this.FromDate == '' || this.ToDate == undefined || this.ToDate == '') {
            alert('Please Select Date');
            return false;
        }
        this.BankServies.getBankPaymentView({
            "cmpid": 1,
            "fy": 5,
            "flag":"",
            "bankid": this.Bankid,
            "fromdate": $('#FromDate').datepicker('getDate'),
            "todate": $('#ToDate').datepicker('getDate')
        }).subscribe(PaymentDetails => {
            var dataset = PaymentDetails.data;
            //if (dataset[0].length > 0) {
                this.tableLength = false;
                this.BankPaymentView = dataset;
            //}
            //else {
            //     alert('No record found');
            //     this.BankPaymentView = [];
            //     this.tableLength = true;
            //     return false;
            // }
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

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

    //+ AND - Button Click 
    expandDetails(row) {
        row.Details=[];
        if (row.issh == 0) {
            row.issh = 1;
            console.log(row);
            if (row.Details.length === 0) {
                this.BankServies.getBankPaymentView({ 
                    "flag": "Details",
                    "bankid": row.id,
                    "cmpid":1,
                    "fy":5
               }).subscribe(data => {
                    row.Details = data.data;
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.issh = 0;
        }
    }


    //Total Sum in Bank Payment Amount
    TotalAmount() {
        if (this.BankPaymentView != undefined) {
            var total = 0;
            for (var i = 0; i < this.BankPaymentView.length; i++) {
                total += parseInt(this.BankPaymentView[i].amount);
            }
            return total;
        }

    }
    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }

}
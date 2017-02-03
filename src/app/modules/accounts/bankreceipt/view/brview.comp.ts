import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { bankreceiptViewService } from "../../../../_service/bankreceipt/view/bankview-service";  //Service Add Refrence Bankpay-service.ts
import { Router } from '@angular/router';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

declare var $: any;

@Component({
    templateUrl: 'brview.comp.html',
    providers: [bankreceiptViewService] //Provides Add Service dcmaster-service.ts, AutoService
})

export class bankreceiptview implements OnInit, OnDestroy {
    //Button

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    //Veriable Local declare

    BankreId: any = 0;
    BankNamelist: any = [];
    BankRecepitView: any = [];
    BankCode: any = "";
    FromDate: any = "";
    ToDate: any = "";
    tableLength: any;

    //constructor

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private BankServies: bankreceiptViewService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.getBankMasterDrop();
    }

    //Open Edit Mode

    OpenEdit(row) {
        if (!row.islocked) {
            this._router.navigate(['/accounts/bankreceipt/add', row.id]);
        }
    }

    //Bank Dropdown Bind

    getBankMasterDrop() {
        this.BankServies.getBankMaster({
            "type": "bank"
        }).subscribe(BankName => {
            this.BankNamelist = BankName.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Button Click

    expandDetails(row) {
        row.Details = [];
        if (row.issh == 0) {
            row.issh = 1;
            if (row.Details.length === 0) {
                this.BankServies.getBankRecieptView({
                    "flag": "Details",
                    "bankreid": row.id,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fy
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

    //Bind Bank Receipt Table

    GetBankRecepit() {
        this.FromDate = $('#FromDate').val();
        this.ToDate = $("#ToDate").val();
        this.tableLength = true;
        this.BankRecepitView = [];
        if (this.BankCode == undefined || this.BankCode == '') {
            alert('Please Select Bank');
            return false;
        }
        if (this.FromDate == undefined || this.FromDate == '' || this.ToDate == undefined || this.ToDate == '') {
            alert('Please Select Date');
            return false;
        }

        this.BankServies.getBankRecieptView({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "bankid": this.BankCode,
            "flag": "",
            "fromdate": $('#FromDate').datepicker('getDate'),
            "todate": $('#ToDate').datepicker('getDate')
        }).subscribe(RecepitDetails => {
            var dataset = RecepitDetails.data;
            if (dataset.length > 0) {
                this.tableLength = false;
                this.BankRecepitView = dataset;
            }
            else {
                alert('No record found');
                this.BankRecepitView = [];
                this.tableLength = true;
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Total Sum in Bank Payment Amount

    TotalAmount() {
        if (this.BankRecepitView != undefined) {
            var total = 0;
            for (var i = 0; i < this.BankRecepitView.length; i++) {
                var items = this.BankRecepitView[i];
                total += parseInt(items.amount);
            }

            return total;
        }
    }

    //Any Button Click Event

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/bankreceipt/braded']);
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

    // Document Ready

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableLength = true;

        $(".bankname").focus();

        setTimeout(function () {
            var date = new Date();
            var Fromtoday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            var Totoday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 

            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                autoclose: true,
                setDate: new Date()
            });

            $("#FromDate").datepicker('setDate', Fromtoday);

            //To Date

            $("#ToDate").datepicker({
                dateFormat: 'dd/mm/yy',
                minDate: 0,
                setDate: new Date(),
                autoclose: true
            });
            $("#ToDate").datepicker('setDate', Totoday);
        }, 0);
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
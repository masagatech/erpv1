import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { bankpaymentViewService } from "../../../../_service/bankpayment/view/bankview-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'bpview.comp.html',
    providers: [bankpaymentViewService, ALSService]
})

export class bankpaymentview implements OnInit, OnDestroy {
    //Button 
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    //Veriable Declare 
    BankPayId: any = 0;
    BankNamelist: any = [];
    BankPaymentView: any = [];
    Bankid: any = 0;
    tableLength: any;

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private BankServies: bankpaymentViewService,
        private _userService: UserService, private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.getBankMasterDrop();
    }

    ngOnInit() {
        this.fromdate.initialize(this.loginUser);
        this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.fromdate.setDate(new Date(this.loginUser.fyfrom));

        this.todate.initialize(this.loginUser);
        this.todate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todate.setDate(new Date(this.loginUser.fyto));

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableLength = true;
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/bankpayment/add']);
        }
    }

    //Open Edit Mode

    OpenEdit(row) {
        if (!row.IsLocked) {
            this._router.navigate(['accounts/bankpayment/edit', row.id]);
        }
    }

    //Get Button Click Event

    GetBankPayment() {
        this.tableLength = true;
        this.BankPaymentView = [];

        this.BankServies.getBankPaymentView({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "flag": "",
            "bankid": this.Bankid,
            "fromdate": this.fromdate.getDate(),
            "todate": this.todate.getDate()
        }).subscribe(PaymentDetails => {
            var dataset = PaymentDetails.data;
            if (dataset.length > 0) {
                this.tableLength = false;
                this.BankPaymentView = dataset;
            }
            else {
                this._msg.Show(messageType.info, "Info", "No record found");
                this.BankPaymentView = [];
                this.tableLength = true;
                return false;
            }
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

    //Button Click 

    expandDetails(row) {
        row.Details = [];
        if (row.issh == 0) {
            row.issh = 1;
            console.log(row);
            if (row.Details.length === 0) {
                this.BankServies.getBankPaymentView({
                    "flag": "Details",
                    "bankid": row.id,
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
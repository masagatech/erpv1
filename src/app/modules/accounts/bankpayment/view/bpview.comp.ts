import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { BankPaymentService } from "../../../../_service/bankpayment/bankpayment-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ALSService } from '../../../../_service/auditlock/als-service';
import { CalendarComp } from '../../../usercontrol/calendar';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'bpview.comp.html',
    providers: [BankPaymentService, ALSService]
})

export class ViewBankPayment implements OnInit, OnDestroy {
    // Button
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    // Veriable Declare
    BankPayId: any = 0;
    banknameListDT: any = [];
    bankpaymentDT: any = [];
    bankid: any = 0;
    tableLength: any;
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    //constructor

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _bpservice: BankPaymentService,
        private _userService: UserService, private _alsservice: ALSService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.getBankMasterDrop();
    }

    // Document Ready

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

    // Open Edit Mode
    OpenBPDetails(row) {
        if (!row.IsLocked) {
            this._router.navigate(['accounts/bankpayment/edit', row.autoid]);
        }
        else {
            this._msg.Show(messageType.info, "Info", "This Bank Payment is Locked");
        }
    }

    // Get Button Click Event
    GetBankPayment(from: number, to: number) {
        this.tableLength = true;
        this.bankpaymentDT = [];

        var params = {
            "flag": "all",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "bankid": this.bankid,
            // "fromdate": this.fromdate.getDate(),
            // "todate": this.todate.getDate(),
            "from": from,
            "to": to
        }

        this._bpservice.getBankPayment(params).subscribe(bankpayment => {
            this.totalRecords = bankpayment.data[1].recordstotal;

            if (bankpayment.data[0].length > 0) {
                this.tableLength = false;
                this.bankpaymentDT = bankpayment.data[0];
            }
            else {
                this._msg.Show(messageType.info, "Info", "No record found");
                this.bankpaymentDT = [];
                this.tableLength = true;
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    loadBPGrid(event: LazyLoadEvent) {
        this.GetBankPayment(event.first, (event.first + event.rows));
    }

    getBankMasterDrop() {
        this._bpservice.getBankMaster({
            "type": "bank"
        }).subscribe(BankName => {
            var dataset = BankName.data;
            this.banknameListDT = BankName.data;
            //this.Typelist = dataset.Table1;
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    // Button Click
    expandDetails(dt, event) {
        var that = this;
        var row = event.data;

        if (row.details.length === 0) {
            that._bpservice.getBankPayment({
                "flag": "details", "autoid": row.autoid,
                "from": event.first, "to": (event.first + event.rows)
            }).subscribe(details => {
                that.totalDetailsRecords = details.data[1][0].recordstotal;
                row.details = details.data[0];
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } else {
            dt.toggleRow(event.data);
        }
    }

    // Total Sum in Bank Payment Amount
    TotalAmount() {
        if (this.bankpaymentDT != undefined) {
            var total = 0;
            for (var i = 0; i < this.bankpaymentDT.length; i++) {
                total += parseInt(this.bankpaymentDT[i].amount);
            }
            return total;
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
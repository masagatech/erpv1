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
    bankpayid: any = 0;
    bankid: any = 0;
    status: string = "";
    
    banknamelistDT: any = [];
    bankpaymentDT: any = [];
    statusDT: any = [];

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
        this.fillStatusDropDown();
        this.resetBPFields();
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("Bank Payment");
        // this.fromdate.initialize(this.loginUser);
        // this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        // this.fromdate.setDate(new Date(this.loginUser.fyfrom));

        // this.todate.initialize(this.loginUser);
        // this.todate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        // this.todate.setDate(new Date(this.loginUser.fyto));

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableLength = true;
    }

    //Any Button Click Event

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/bankpayment/add']);
        }
    }

    fillStatusDropDown() {
        var that = this;

        that._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "accs", "mtype": "ap",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetBPFields() {
        this.bankid = 0;
        this.status = "true";
    }

    // Open Edit Mode

    OpenBankPayment(row) {
        if (row.islocked) {
            this._msg.Show(messageType.info, "Info", "This Bank Payment is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.info, "Info", "This Bank Payment is Deleted");
        }
        else {
            this._router.navigate(['/accounts/bankpayment/details', row.autoid]);
        }
    }

    //Bank Dropdown Bind

    getBankMasterDrop() {
        this._bpservice.getBankMaster({
            "type": "bank"
        }).subscribe(BankName => {
            var dataset = BankName.data;
            this.banknamelistDT = BankName.data;
            //this.Typelist = dataset.Table1;
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    // Get Button Click Event

    GetBankPayment(from: number, to: number) {
        var that = this;

        that.tableLength = true;
        that.bankpaymentDT = [];

        var params = {
            "flag": "all", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "bankid": that.bankid,
            // "fromdate": that.fromdate.getDate(), "todate": that.todate.getDate(),
            "from": from, "to": to, "isactive": that.status
        }

        that._bpservice.getBankPayment(params).subscribe(bankpayment => {
            that.totalRecords = bankpayment.data[1].recordstotal;

            if (bankpayment.data[0].length > 0) {
                that.tableLength = false;
                that.bankpaymentDT = bankpayment.data[0];
            }
            else {
                that._msg.Show(messageType.info, "Info", "No records found");
                that.bankpaymentDT = [];
                that.tableLength = true;
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    loadBankPaymentGrid(event: LazyLoadEvent) {
        this.GetBankPayment(event.first, (event.first + event.rows));
    }

    // Expand Grid Button Click

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
                
                dt.toggleRow(event.data);
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } else {
            dt.toggleRow(event.data);
        }
    }

    // Search Button Click

    searchBankPayment(dt: DataTable) {
        // if (this.rangewise == "docrange") {

        // }
        // if (this.rangewise == "daterange") {
        //     if (this.fromdate.setDate("")) {
        //         this._msg.Show(messageType.info, "Info", "Please select From Date");
        //         return;
        //     }
        //     if (this.todate.setDate("")) {
        //         this._msg.Show(messageType.info, "Info", "Please select To Date");
        //         return;
        //     }
        // }

        // if (this.fromdate.setDate("")) {
        //     this._msg.Show(messageType.info, "Info", "Please Enter From Date");
        //     return;
        // }
        // if (this.todate.setDate("")) {
        //     this._msg.Show(messageType.info, "Info", "Please Enter To Date");
        //     return;
        // }

        dt.reset();
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
        this.setActionButtons.setTitle("");
    }
}
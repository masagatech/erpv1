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
    status: boolean = true;
    statustitle: string = "";

    bankDT: any = [];
    bankpaymentDT: any = [];
    statusDT: any = [];
    trashviewDT: any = [];

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
        this.fillDropDownList();
        this.getTrashRights();
        this.resetBPFields();
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("A/C Payble");
        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        this.fromdate.initialize(this.loginUser);
        this.fromdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.fromdate.setDate(today);

        this.todate.initialize(this.loginUser);
        this.todate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));
        this.todate.setDate(today);

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        this.tableLength = true;

        $(".bank").focus();
    }

    //Any Button Click Event

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/bankpayment/add']);
        }
    }

    getTrashRights() {
        var that = this;
        var _actrec = [];
        var _delrec = [];

        if (that.status === true) {
            $(".status input").prop('disabled', false);
            that.statustitle = "Active Records";
        }
        else if (that.status === false) {
            $(".status input").prop('disabled', false);
            that.statustitle = "Inactive Records";
        }
        else {
            $(".status input").prop('disabled', true);
            that.statustitle = "All Records";
        }

        that._userService.getMenuDetails({
            "flag": "deletedrights", "ptype": "accs", "mtype": "ap",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.trashviewDT = data.data[0]._deletedrecords;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
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

    // DropDown

    fillDropDownList() {
        this._bpservice.getBankPayment({ "flag": "dropdown" }).subscribe(data => {
            var d = data.data;
            this.bankDT = d.filter(a => a.group === "bank");
        });
    }

    // Get Button Click Event

    GetBankPayment() {
        var that = this;

        that.tableLength = true;
        that.bankpaymentDT = [];

        var params = {
            "flag": "all", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "bankid": that.bankid, "isactive": that.status, "fromdate": that.fromdate.getDate(), "todate": that.todate.getDate()
            // "from": from, "to": to
        }

        that._bpservice.getBankPayment(params).subscribe(bankpayment => {
            that.totalRecords = bankpayment.data[1][0].recordstotal;
            that.bankpaymentDT = bankpayment.data[0];
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    loadBankPaymentGrid(event: LazyLoadEvent) {
        // this.GetBankPayment(event.first, (event.first + event.rows));
    }

    // Expand Grid Button Click

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            this._bpservice.getBankPayment({
                "flag": "details", "autoid": event.autoid,
                "from": event.first, "to": (event.first + event.rows)
            }).subscribe(details => {
                var dataset = details.data;
                event.totalDetailsRecords = dataset[1][0].recordstotal;

                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                }
                else {
                    that._msg.Show(messageType.info, "info", "Record Not Found");
                    return;
                }
            }, err => {
                this._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            })
        } catch (error) {

        }
    }

    // Search Button Click

    searchBankPayment() {
        this.GetBankPayment();
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
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { BankReceiptService } from "../../../../_service/bankreceipt/bankreceipt-service";  //Service Add Refrence Bankpay-service.ts
import { Router } from '@angular/router';
import { UserService } from '../../../../_service/user/user-service';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CalendarComp } from '../../../usercontrol/calendar';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'brview.comp.html',
    providers: [BankReceiptService] //Provides Add Service dcmaster-service.ts, AutoService
})

export class bankreceiptview implements OnInit, OnDestroy {
    //Button

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    //Veriable Local declare

    bnakreid: number = 0;
    bankid: number = 0;
    status: string = "";

    statusDT: any = [];
    bnaknamelistDT: any = [];
    bnakreceiptDT: any = [];

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    tableLength: any;

    //constructor

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _brService: BankReceiptService,
        private _userService: UserService, private _msg: MessageService) {
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

        $(".bankname").focus();
    }

    //Any Button Click Event

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/bankreceipt/add']);
        }
    }

    //Open Edit Mode

    OpenBankReceipt(row) {
        if (row.islocked) {
            this._msg.Show(messageType.info, "Info", "This Bank Receipt is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.info, "Info", "This Bank Receipt is Deleted");
        }
        else {
            this._router.navigate(['/accounts/bankreceipt/edit', row.id]);
        }
    }

    //Bank Dropdown Bind

    getBankMasterDrop() {
        this._brService.getBankMaster({
            "type": "bank"
        }).subscribe(BankName => {
            this.bnaknamelistDT = BankName.data;
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Bind Bank Receipt Table

    GetBankReceipt(from: number, to: number) {
        var that = this;

        this.tableLength = true;
        this.bnakreceiptDT = [];

        this._brService.getBankReceipt({
            "flag": "", "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy,
            "bankid": this.bankid, "fromdate": this.fromdate.getDate(), "todate": this.todate.getDate(),
            "from": from, "to": to, "isactive": this.status
        }).subscribe(RecepitDetails => {
            var dataset = RecepitDetails.data;
            if (dataset.length > 0) {
                this.tableLength = false;
                this.bnakreceiptDT = dataset;
            }
            else {
                this._msg.Show(messageType.info, "Info", "No records found");
                this.bnakreceiptDT = [];
                this.tableLength = true;
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    loadBankReceiptGrid(event: LazyLoadEvent) {
        this.GetBankReceipt(event.first, (event.first + event.rows));
    }

    //Button Click

    searchBankRecepit(dt: DataTable) {
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

        // if (this.fromno == "") {
        //     this._msg.Show(messageType.info, "Info", "Please select From No");
        //     return;
        // }
        // if (this.tono == "") {
        //     this._msg.Show(messageType.info, "Info", "Please select To No");
        //     return;
        // }

        dt.reset();
    }

    expandDetails(dt, event) {
        var that = this;
        var row = event.data;

        if (row.Details.length === 0) {
            this._brService.getBankReceipt({
                "flag": "details",
                "bnakreid": row.id,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy
            }).subscribe(data => {
                row.Details = data.data;
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } else {
            dt.toggleRow(event.data);
        }
    }

    //Total Sum in Bank Payment Amount

    TotalAmount() {
        if (this.bnakreceiptDT != undefined) {
            var total = 0;
            for (var i = 0; i < this.bnakreceiptDT.length; i++) {
                var items = this.bnakreceiptDT[i];
                total += parseInt(items.amount);
            }

            return total;
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
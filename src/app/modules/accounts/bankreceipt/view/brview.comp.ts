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

export class ViewBankReceipt implements OnInit, OnDestroy {
    // Button
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    // Veriable Declare
    bankreid: number = 0;
    bankid: number = 0;
    status: boolean = true;
    statustitle: string = "";

    bankDT: any = [];
    bankreceiptDT: any = [];
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

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _brService: BankReceiptService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillDropDownList();
        this.getTrashRights();
        this.resetBPFields();
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("A/C Receivable");
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
            this._router.navigate(['/accounts/bankreceipt/add']);
        }
    }

    getTrashRights() {
        var that = this;
        var _actrec = [];
        var _delrec = [];

        if (that.status == true) {
            $(".status input").prop('disabled', false);
            that.statustitle = "Active Records";
        }
        else if (that.status == false) {
            $(".status input").prop('disabled', false);
            that.statustitle = "Inactive Records";
        }
        else {
            $(".status input").prop('disabled', true);
            that.statustitle = "All Records";
        }

        that._userService.getMenuDetails({
            "flag": "deletedrights", "ptype": "accs", "mtype": "ar",
            "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            that.trashviewDT = data.data[0]._deletedrecords;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetBPFields() {
        this.bankid = 0;
        this.status = true;
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
            this._router.navigate(['/accounts/bankreceipt/details', row.docno]);
        }
    }

    // DropDown

    fillDropDownList() {
        this._brService.getBankReceipt({ "flag": "dropdown" }).subscribe(data => {
            var d = data.data;
            this.bankDT = d.filter(a => a.group === "bank");
        });
    }

    //Bind Bank Receipt Table

    GetBankReceipt() {
        var that = this;

        that.tableLength = true;
        that.bankreceiptDT = [];

        var params = {
            "flag": "all", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "bankid": that.bankid, "isactive": that.status, "fromdate": that.fromdate.getDate(), "todate": that.todate.getDate()
            // "from": from, "to": to
        }

        that._brService.getBankReceipt(params).subscribe(bankreceipt => {
            // that.totalRecords = bankreceipt.data[1][0].recordstotal;

            if (bankreceipt.data.length !== 0) {
                that.tableLength = false;
                that.bankreceiptDT = bankreceipt.data[0];
            }
            else {
                that._msg.Show(messageType.info, "Info", "No records found");
                that.bankreceiptDT = [];
                that.tableLength = true;
                return false;
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            //Done Process
        });
    }

    loadBankReceiptGrid(event: LazyLoadEvent) {
        // this.GetBankReceipt(event.first, (event.first + event.rows));
    }

    // Expand Grid Button Click

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            this._brService.getBankReceipt({
                "flag": "details", "bankreid": event.docno,
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

    searchBankRecepit() {
        // if (this.fromdate.setDate("")) {
        //     this._msg.Show(messageType.info, "Info", "Please select From Date");
        //     return;
        // }
        // if (this.todate.setDate("")) {
        //     this._msg.Show(messageType.info, "Info", "Please select To Date");
        //     return;
        // }

        this.GetBankReceipt();
    }

    //Total Sum in Bank Receipt Amount

    TotalAmount() {
        if (this.bankreceiptDT != undefined) {
            var totamt = 0;
            for (var i = 0; i < this.bankreceiptDT.length; i++) {
                var items = this.bankreceiptDT[i];
                totamt += parseInt(items.amount);
            }

            return totamt;
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
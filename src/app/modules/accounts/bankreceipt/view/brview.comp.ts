import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { bankreceiptViewService } from "../../../../_service/bankreceipt/view/bankview-service";  //Service Add Refrence Bankpay-service.ts
import { Router } from '@angular/router';
import { UserService } from '../../../../_service/user/user-service';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CalendarComp } from '../../../usercontrol/calendar';

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
    bankid: number = 0;

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    tableLength: any;

    //constructor

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private BankServies: bankreceiptViewService,
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

    OpenEdit(row) {
        if (!row.islocked) {
            this._router.navigate(['/accounts/bankreceipt/edit', row.id]);
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
        this.tableLength = true;
        this.BankRecepitView = [];

        this.BankServies.getBankRecieptView({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "bankid": this.bankid,
            "flag": "",
            "fromdate": this.fromdate.getDate(),
            "todate": this.todate.getDate()
        }).subscribe(RecepitDetails => {
            var dataset = RecepitDetails.data;
            if (dataset.length > 0) {
                this.tableLength = false;
                this.BankRecepitView = dataset;
            }
            else {
                this._msg.Show(messageType.info, "Info", "No record found");
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

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
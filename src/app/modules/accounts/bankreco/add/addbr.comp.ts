import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { BankRecoService } from "../../../../_service/bankreco/bankreco-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'addbr.comp.html',
    providers: [BankRecoService]
})

export class AddBankReco implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    // Veriable Declare
    date: string = "";

    bankDT: any = [];
    bankrecoDT: any = [];
    fyDT: any = [];

    private subscribeParameters: any;

    // Page Init

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _brservice: BankRecoService, private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        //this.GetBankRecoGrid();
    }

    // Page Load

    ngOnInit() {
        this.setActionButtons.setTitle("Bank Reconcillation");

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            this.date = params['date'];
            this.GetBankRecoGrid(this.date);
        });
    }

    // View Bank Reco Data

    GetBankRecoGrid(date) {
        var that = this;

        var _fromdt, _todt;

        _fromdt = date.split("-")

        that._brservice.getBankReco({ "flag": "monthwise", "fromdt": _fromdt, "todt": _todt, "cmpid": that.loginUser.cmpid }).subscribe(bankreco => {
            if (bankreco.data.length > 0) {
                that.bankrecoDT = bankreco.data;
            }
            else {
                that._msg.Show(messageType.info, "Info", "No records found");
                that.bankrecoDT = [];
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    // Search Button Click Event

    searchBankRecoGrid(dt: DataTable) {
        dt.reset();
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.bankrecoDT.length; i++) {
            var items = this.bankrecoDT[i];
            DebitAmtTotal += parseFloat(items.dramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.bankrecoDT.length; i++) {
            var items = this.bankrecoDT[i];
            CreditAmtTotal += parseFloat(items.cramt);
        }

        return CreditAmtTotal;
    }

    TotalClosingBal() {
        var ClosingBalTotal = 0;

        for (var i = 0; i < this.bankrecoDT.length; i++) {
            var items = this.bankrecoDT[i];
            ClosingBalTotal += parseFloat(items.closingbal);
        }

        return ClosingBalTotal;
    }

    TotalReconcilled() {
        var countreco = 0;

        for (var i = 0; i < this.bankrecoDT.length; i++) {
            var items = this.bankrecoDT[i];
            countreco += parseInt(items.countreco);
        }

        return countreco;
    }

    TotalNotReconcilled() {
        var notcountreco = 0;

        for (var i = 0; i < this.bankrecoDT.length; i++) {
            var items = this.bankrecoDT[i];
            notcountreco += parseInt(items.countnotreco);
        }

        return notcountreco;
    }

    openBankReco(row) {
        if (row.countreco === 0) {
            this._msg.Show(messageType.info, "Info", "This is not Reconcilled");
        }
        else {
            this._router.navigate(['/accounts/jv/details', row.jvmid]);
        }
    }

    openNotBankReco(row) {
        if (row.countnotreco === 0) {
            this._msg.Show(messageType.info, "Info", "This is not Reconcilled");
        }
        else {
            this._router.navigate(['/accounts/jv/details', row.jvmid]);
        }
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
    }
}
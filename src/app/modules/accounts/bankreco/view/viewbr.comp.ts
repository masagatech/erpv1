import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { BankRecoService } from "../../../../_service/bankreco/bankreco-service";  //Service Add Refrence Bankpay-service.ts
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'viewbr.comp.html',
    providers: [BankRecoService]
})

export class ViewBankReco implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // Veriable Declare
    bankid: string = "";
    fy: number = 0;

    enterdate: any = "";

    bankDT: any = [];
    bankwiseDT: any = [];
    monthwiseDT: any = [];
    fyDT: any = [];

    fromdt: string = "";
    todt: string = "";

    gridTotal: any = {
        BankDebitAmtTotal: 0, BankCreditAmtTotal: 0, MonthDebitAmtTotal: 0, MonthCreditAmtTotal: 0,
        ClosingBalTotal: 0, countreco: 0, notcountreco: 0
    };

    // Page Init

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _brservice: BankRecoService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillDropDownList();
        this.GetBankWiseGrid();
    }

    // Page Load

    ngOnInit() {
        // if (this.monthwiseDT.length !== 0) {
        //     this.enterdate.initialize(this.loginUser);
        //     this.enterdate.setMinMaxDate(new Date(this.loginUser.fyfrom), new Date(this.loginUser.fyto));

        //     var date = new Date();
        //     this.enterdate.setDate(date);
        // }

        this.setActionButtons.setTitle("Bank Reconcillation");

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, true));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveBankReco();
        } else if (evt === "back") {
            this.monthwiseDT = [];
            this.actionButton.find(a => a.id === "save").hide = true;
            this.actionButton.find(a => a.id === "back").hide = true;
            this.GetBankWiseGrid();
        }
    }

    // DropDown for Bank and FY

    fillDropDownList() {
        var that = this;

        that._brservice.getBankReco({ "flag": "dropdown", "cmpid": that.loginUser.cmpid }).subscribe(data => {
            var d = data.data;
            that.bankDT = data.data[0]._bank;

            that.fyDT = data.data[0]._fy;
            that.fy = that.loginUser.fy;

            that.GetBankWiseGrid();
        });
    }

    // View Bank Reco Data

    GetBankWiseGrid() {
        var that = this;

        that._brservice.getBankReco({ "flag": "bankwise", "bankid": that.bankid, "cmpid": that.loginUser.cmpid, "fy": that.fy }).subscribe(bankreco => {
            if (bankreco.data.length > 0) {
                that.bankwiseDT = bankreco.data;
                that.TotalAmountBankWise();
            }
            else {
                //that._msg.Show(messageType.info, "Info", "No records found");
                that.bankwiseDT = [];
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    GetMonthWiseGrid(row, flag) {
        var that = this;

        that._brservice.getBankReco({
            "flag": flag, "bankid": that.bankid, "fromdt": row.fromdt, "todt": row.todt,
            "cmpid": that.loginUser.cmpid, "fy": that.fy
        }).subscribe(bankreco => {
            if (bankreco.data.length > 0) {
                that.monthwiseDT = bankreco.data;
                that.fromdt = row.setfromdt;
                that.todt = row.settodt;

                that.actionButton.find(a => a.id === "save").hide = false;
                that.actionButton.find(a => a.id === "back").hide = false;
                that.TotalAmountMonthWise();
            }
            else {
                //that._msg.Show(messageType.info, "Info", "No records found");
                that.monthwiseDT = [];
                return false;
            }
        }, err => {
            console.log('Error');
        }, () => {
            // Done Process
        });
    }

    TotalAmountBankWise() {
        var that = this;
        that.gridTotal = {
            BankDebitAmtTotal: 0, BankCreditAmtTotal: 0, MonthDebitAmtTotal: 0, MonthCreditAmtTotal: 0,
            ClosingBalTotal: 0, countreco: 0, notcountreco: 0
        };

        for (var i = 0; i < this.bankwiseDT.length; i++) {
            var items = this.bankwiseDT[i];
            that.gridTotal.BankDebitAmtTotal += parseFloat(items.dramt);
            that.gridTotal.BankCreditAmtTotal += parseFloat(items.cramt);
            that.gridTotal.ClosingBalTotal += parseFloat(items.closingbal);
            that.gridTotal.countreco += parseInt(items.countreco);
            that.gridTotal.notcountreco += parseInt(items.countnotreco);
        }
    }

    TotalAmountMonthWise() {
        var that = this;
        that.gridTotal = {
            BankDebitAmtTotal: 0, BankCreditAmtTotal: 0, MonthDebitAmtTotal: 0, MonthCreditAmtTotal: 0,
            ClosingBalTotal: 0, countreco: 0, notcountreco: 0
        };

        for (var i = 0; i < this.monthwiseDT.length; i++) {
            var items = this.monthwiseDT[i];
            that.gridTotal.MonthDebitAmtTotal += parseFloat(items.dramt);
            that.gridTotal.MonthCreditAmtTotal += parseFloat(items.cramt);
        }
    }

    openBankReco(row) {
        if (row.countreco === 0) {
            this._msg.Show(messageType.info, "Info", "This is not Reconcilled");
        }
        else {
            this._router.navigate(['/accounts/bankreco/add', row.monthno]);
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

    saveBankReco() {
        var that = this;
        var bankrecoData = [];
        var recotype: string = "";

        for (var i = 0; i < that.monthwiseDT.length; i++) {
            if (that.monthwiseDT[i].enterdate !== "") {
                bankrecoData.push({
                    "docdate": that.monthwiseDT[i].docdate,
                    "recodate": that.monthwiseDT[i].enterdate
                });

                recotype = that.monthwiseDT[i].recotype;
            }
        }

        var saveBRC = {
            "bankreco": bankrecoData,
            "recotype": recotype
        }

        console.log(JSON.stringify(saveBRC));

        that._brservice.saveBankReco(saveBRC).subscribe(data => {
            try {
                var dataResult = data.data;

                if (dataResult[0].funsave_bankreco.msgid == "1") {
                    that._msg.Show(messageType.success, "Success", dataResult[0].funsave_bankreco.msg);
                }
                else {
                    that._msg.Show(messageType.error, "Error", dataResult[0].funsave_bankreco.msg);
                }
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    ngOnDestroy() {
        this.setActionButtons.setTitle("");
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
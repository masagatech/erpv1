import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { ExpVoucherService } from "../../../../_service/expensevoucher/expvoucher-service"; /* add reference for Expense Voucher */
import { LoginUserModel } from '../../../../_model/user_model';
import { UserService } from '../../../../_service/user/user-service';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewexpvoucher.comp.html',
    providers: [ExpVoucherService]
})

export class ViewExpenseVoucherComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    expenseVoucherData: any = [];
    totalRecords: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private _expvoucherservice: ExpVoucherService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/expensevoucher/add']);
        }
    }

    BindExpenseVoucherGrid(from: number, to: number) {
        var that = this;
        that._expvoucherservice.getAllExpenseVoucher({ "flag": "grid", "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy, "from": from, "to": to }).subscribe(data => {
            that.totalRecords = data.data[1][0].recordstotal;
            that.expenseVoucherData = data.data[0];
        });
    }

    loadExpenseVoucherGrid(event: LazyLoadEvent) {
        this.BindExpenseVoucherGrid(event.first, (event.first + event.rows));
    }

    openExpVoucherDetails(row) {
        this._router.navigate(["/master/expensevoucher/edit", row.docno]);
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    ngOnDestroy() {
    }
}
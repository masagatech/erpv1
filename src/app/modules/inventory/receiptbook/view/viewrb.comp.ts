import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { RBService } from '../../../../_service/receiptbook/rb-service' /* add reference for receipt book */
import { LazyLoadEvent, DataTable } from 'primeng/primeng';
import { GroupByPipe } from '../../../../_pipe/groupby.pipe';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

@Component({
    templateUrl: 'viewrb.comp.html',
    providers: [RBService]
})

export class ViewReceiptBook implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    datasource: any = [];
    receiptbook: any = [];
    totalRecords: number = 0;
    selectedRB1: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _rbservice: RBService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }

    BindReceiptBook(from: number, to: number) {
        var that = this;
        that._rbservice.getAllRB({
            "flag": "grid",
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "from": from,
            "to": to
        }).subscribe(data => {
            console.log(data.data[1]);
            that.totalRecords = data.data[1][0].recordstotal;
            that.receiptbook = data.data[0];
        });
    }

    loadRBGrid(event: LazyLoadEvent) {
        this.BindReceiptBook(event.first, (event.first + event.rows));
    }

    openRBDetails(row) {
        this._router.navigate(["/inventory/receiptbook/edit", row.docno]);
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    openReceiptBook(row) {
        this._router.navigate(['/inventory/receiptbook/edit', row.UserID]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/inventory/receiptbook/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
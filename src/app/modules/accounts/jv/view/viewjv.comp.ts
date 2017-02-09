import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { JVService } from '../../../../_service/jv/jv-service' /* add reference for view employee */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewjv.comp.html',
    providers: [JVService]
})

export class ViewJV implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewJVDT: any = [];
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _jvservice: JVService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Journal Voucher");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    getJVDetails(from: number, to: number) {
        var that = this;

        this._jvservice.getJVDetails({
            "flag": "docrange", "fromdocno": "1", "todocno": "100",
            "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy, "from": from, "to": to
        }).subscribe(jv => {
            that.totalRecords = jv.data[1][0].recordstotal;
            that.viewJVDT = jv.data[0];
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadJVGrid(event: LazyLoadEvent) {
        this.getJVDetails(event.first, (event.first + event.rows));
    }

    expandDetails(dt, event) {
        var that = this;
        var row = event.data;

        if (row.details.length === 0) {
            that._jvservice.getJVDetails({
                "flag": "details", "jvmid": row.jvmid,
                "from": event.first, "to": (event.first + event.rows)
            }).subscribe(details => {
                that.totalDetailsRecords = details.data[1][0].recordstotal;
                row.details = details.data[0];
                
                dt.toggleRow(event.data);
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            })
        } else {
            dt.toggleRow(event.data);
        }
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.viewJVDT.length; i++) {
            var items = this.viewJVDT[i];
            DebitAmtTotal += parseInt(items.totdramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.viewJVDT.length; i++) {
            var items = this.viewJVDT[i];
            CreditAmtTotal += parseInt(items.totcramt);
        }

        return CreditAmtTotal;
    }

    openJVDetails(row) {
        if (!row.islocked) {
            this._router.navigate(['/accounts/jv/edit', row.jvmid]);
        }
        else {
            this._msg.Show(messageType.info, "Info", "This JV is Locked");
        }
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/jv/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}
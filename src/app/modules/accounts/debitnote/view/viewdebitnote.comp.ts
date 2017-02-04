import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service'; /* add reference for view debitnote */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewdebitnote.comp.html',
    providers: [DNService]
})

export class ViewDebitNote implements OnInit, OnDestroy {
    title: any;
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewDebitNoteDT: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _dnservice: DNService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.getDNDetails();
    }

    getDNDetails() {
        this._dnservice.getDebitNote({
            "flag": "docrange", "fromdocno": "1", "todocno": "100",
            "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(data => {
            this.viewDebitNoteDT = data.data;
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    expandDetails(row) {
        if (row.issh == 0) {
            row.issh = 1;
            if (row.details.length === 0) {
                this._dnservice.getDebitNote({ "flag": "details", "docno": row.docno }).subscribe(data => {
                    row.details = data.data;
                }, err => {
                    this._msg.Show(messageType.error, "Error", err);
                    console.log(err);
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.issh = 0;
        }
    }

    TotalDebitAmt() {
        var DebitAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            DebitAmtTotal += parseInt(items.totdramt);
        }

        return DebitAmtTotal;
    }

    TotalCreditAmt() {
        var CreditAmtTotal = 0;

        for (var i = 0; i < this.viewDebitNoteDT.length; i++) {
            var items = this.viewDebitNoteDT[i];
            CreditAmtTotal += parseInt(items.totcramt);
        }

        return CreditAmtTotal;
    }

    openDNDetails(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/accounts/debitnote/edit', row.dnid]);
        }
        else {
            this._msg.Show(messageType.info, "Info", "This Debi Note is Locked");
        }
    }

    ngOnInit() {
        this.title = "View Debit Note";
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/debitnote/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
    }
}
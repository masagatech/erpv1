import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CNService } from '../../../../_service/creditnote/cn-service'; /* add reference for view CreditNote */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'viewcn.comp.html',
    providers: [CNService]
})

export class ViewCreditNote implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewCNDT: any = [];
    totalRecords: number = 0;

    rangewise: string = "";
    fromno: number = 0;
    tono: number = 0;
    status: string = "";

    statusDT: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _CNService: CNService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.resetCNFields();
    }

    // Document Ready

    ngOnInit() {
        this.setActionButtons.setTitle("Credit Note");
        $(".fromno input").focus();

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "accs", "mtype": "cn",
            "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetCNFields() {
        this.rangewise = "docrange";
        this.fromno = 0;
        this.tono = 0;
        this.status = "true";
    }

    getCreditNote(from: number, to: number) {
        var that = this;

        that._CNService.getCreditNote({
            "flag": "docrange", "fromdocno": 1, "todocno": 100,
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "from": from, "to": to, "isactive": that.status
        }).subscribe(cn => {
            that.totalRecords = cn.data[1].recordstotal;
            that.viewCNDT = cn.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadCNGrid(event: LazyLoadEvent) {
        this.getCreditNote(event.first, (event.first + event.rows));
    }

    searchCreditNote(dt: DataTable) {
        dt.reset();
    }

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            that._CNService.getCreditNote({
                "flag": "details", "docno": event.docno
            }).subscribe(details => {
                var dataset = details.data;

                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                }
                else {
                    that._msg.Show(messageType.error, "Error", "Record Not Found");
                    return;
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            that._msg.Show(messageType.error, "Error", e);
        }
    }

    TotalItemPrice() {
        var ItemPrice = 0;

        for (var i = 0; i < this.viewCNDT.length; i++) {
            var items = this.viewCNDT[i];
            ItemPrice += parseFloat(items.itemprice);
        }

        return ItemPrice;
    }

    openCNDetails(row) {
        if (row.islocked) {
            this._msg.Show(messageType.error, "Error", "This Credit Note is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.error, "Error", "This Credit Note is Deleted");
        }
        else {
            this._router.navigate(['/accounts/creditnote/details', row.docno]);
        }
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/creditnote/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
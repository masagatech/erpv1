import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { JVService } from '../../../../_service/jv/jv-service' /* add reference for view employee */
import { UserService } from '../../../../_service/user/user-service'; /* add reference for view user */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router } from '@angular/router';
import { CalendarComp } from '../../../usercontrol/calendar';
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

    rangewise: string = "";
    fromno: any = "";
    tono: any = "";
    status: string = "";

    statusDT: any = [];

    @ViewChild("fromdate")
    fromdate: CalendarComp;

    @ViewChild("todate")
    todate: CalendarComp;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _jvservice: JVService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.fillStatusDropDown();
        this.resetJVFields();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Journal Voucher");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/jv/add']);
        }
    }

    fillStatusDropDown() {
        var that = this;

        this._userService.getMenuDetails({
            "flag": "trashrights", "ptype": "accs", "mtype": "jv",
            "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy
        }).subscribe(data => {
            that.statusDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    resetJVFields() {
        this.rangewise = "docrange";
        this.fromno = "";
        this.tono = "";
        this.status = "true";
    }

    getJVDetails(from: number, to: number) {
        var that = this;

        that._jvservice.getJVDetails({
            "flag": "docrange", "fromdocno": parseInt(that.fromno), "todocno": parseInt(that.tono),
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy,
            "from": from, "to": to, "isactive": that.status
        }).subscribe(jv => {
            that.totalRecords = jv.data[1][0].recordstotal;
            that.viewJVDT = jv.data[0];
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    loadJVGrid(event: LazyLoadEvent) {
        this.getJVDetails(event.first, (event.first + event.rows));
    }

    searchJV(dt: DataTable) {
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

        if (this.fromno == "") {
            this._msg.Show(messageType.info, "Info", "Please select From No");
            return;
        }
        if (this.tono == "") {
            this._msg.Show(messageType.info, "Info", "Please select To No");
            return;
        }

        dt.reset();
    }

    expandDetails(event) {
        var that = this;
        if (event.details && event.details.length > 0) { return; }

        try {
            event.loading = false;

            that._jvservice.getJVDetails({
                "flag": "details", "jvmid": event.jvmid,
                "from": event.first, "to": (event.first + event.rows)
            }).subscribe(details => {
                var dataset = details.data;
                
                if (dataset[0].length > 0) {
                    event.loading = true;
                    event.details = dataset[0];
                    event.totalDetailsRecords = dataset[1][0].recordstotal;
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

    expandDetails2(dt, event) {
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
        if (row.islocked) {
            this._msg.Show(messageType.info, "Info", "This JV is Locked");
        }
        else if (!row.isactive) {
            this._msg.Show(messageType.info, "Info", "This JV is Deleted");
        }
        else {
            this._router.navigate(['/accounts/jv/details', row.jvmid]);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
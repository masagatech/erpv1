import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { PDCService } from '../../../../_service/pdc/pdc-service' /* add reference for emp */

@Component({
    templateUrl: 'viewpdc.comp.html',
    providers: [PDCService]
})

export class ViewPDC implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    viewPDCDT: any[] = [];

    events: any[];
    header: any;
    event: MyEvent;
    dialogVisible: boolean = false;
    idGen: number = 100;

    pdctype: string = "";
    monthwisepdc: string = "";
    defaultDate: any = "";

    constructor(private _router: Router, private _pdcservice: PDCService, private setActionButtons: SharedVariableService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
        this.getDefaultDate();
        this.getMonthWisePDC();
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    getDefaultDate() {
        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.defaultDate = this.formatDate(today);
    }

    ngOnInit() {
        var that = this;

        that.setActionButtons.setTitle("Post Dated Cheque");
        that.setActionButtons.hideSideMenu();
        that.setActionButtons.setActionButtons(that.actionButton);

        that.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        that.setActionButtons.setActionButtons(that.actionButton);
        that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt =>that.actionBarEvt(evt));

        that.header = {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        };
    }

    getAllPDC(row) {
        var that = this;

        that._pdcservice.getPDCDetails({
            "flag": "calendar", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
            "monthname": row.view.title
        }).subscribe(data => {
            that.events = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getMonthWisePDC() {
        var that = this;

        that._pdcservice.getPDCDetails({
            "flag": "monthwise", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "month": "3"
        }).subscribe(data => {
            that.monthwisepdc = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getPDCByType(row) {
        var that = this;

        if (row.calEvent !== undefined) {
            that._pdcservice.getPDCDetails({
                "flag": "pdctype", "pdctype": row.calEvent.pdctype, "chequedate": row.calEvent.start,
                "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "uid": that.loginUser.uid,
                "monthname": row.view.title
            }).subscribe(data => {
                debugger;
                that.viewPDCDT = data.data;
                that.pdctype = data.data[0].pdctype;
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        }
    }

    TotalPDCAmount() {
        var PDCAmtTotal = 0;

        for (var i = 0; i < this.viewPDCDT.length; i++) {
            var items = this.viewPDCDT[i];
            PDCAmtTotal += parseInt(items.amount);
        }

        return PDCAmtTotal;
    }

    openBankReceipt(row) {
        this._router.navigate(['/accounts/bankreceipt/pdc/', row.pdcid]);
    }

    openPDCDetails(row) {
        this._router.navigate(['/accounts/pdc/edit/', row.pdcid]);
    }

    handleDayClick(event) {
        this.event = new MyEvent();
        this.event.start = event.date.format();
        this.dialogVisible = true;
    }

    handleEventClick(e) {
        this.event = new MyEvent();
        this.event.title = e.calEvent.title;

        let start = e.calEvent.start;
        let end = e.calEvent.end;

        if (e.view.name === 'month') {
            start.stripTime();
        }

        if (end) {
            end.stripTime();
            this.event.end = end.format();
        }

        this.event.id = e.calEvent.id;
        this.event.start = start.format();
        this.event.allDay = e.calEvent.allDay;

        this.dialogVisible = true;
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/pdc/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
        this.setActionButtons.showSideMenu();
    }
}

export class MyEvent {
    id: number;
    pdctype: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean = true;
}
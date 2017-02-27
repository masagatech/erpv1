import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewpdc.comp.html'
})

export class ViewPDC implements OnInit, OnDestroy {
    title: any;
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewPDCDT: any[] = [];

    minDate: Date;
    maxDate: Date;

    constructor(private _router: Router, private setActionButtons: SharedVariableService) {
        
    }

    // getCalendar()
    // {
    //     daysOfTheWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    //     numberOfRows: 5
    //     days: [
    //     {
    //         day: '1',
    //         classes: 'day today event',
    //         id: 'calendar-day-2013-09-01',
    //         events: [ ],
    //         date: moment('2013-09-01')
    //     },
    //     ...
    //     ]
    //     month: 'September'
    //     year: '2013'
    //     eventsThisMonth: [ ],
    //     extras: { }
    // }

    openJVDetails(row) {
        if (!row.islocked) {
            this._router.navigate(['/accounts/pdc/edit', row.jvmid]);
        }
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Post Dated Cheque");

        let today = new Date();
        let month = today.getMonth();
        let prevMonth = (month === 0) ? 11 : month - 1;
        let nextMonth = (month === 11) ? 0 : month + 1;
        this.minDate = new Date();
        this.minDate.setMonth(10);
        this.maxDate = new Date();
        this.maxDate.setMonth(12);

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/accounts/pdc/add']);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}
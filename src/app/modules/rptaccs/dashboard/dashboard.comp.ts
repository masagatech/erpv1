import { Component, OnInit, OnDestroy } from '@angular/core';


@Component({
    templateUrl: 'dashboard.comp.html',
})

export class ReportAccountsDashboardComp implements OnInit, OnDestroy {
    title: any;
    constructor() { }

    ngOnInit() {
        this.title = "Dashboard";
    }

    ngOnDestroy() {

    }
}
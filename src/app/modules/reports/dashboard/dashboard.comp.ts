import { Component, OnInit, OnDestroy } from '@angular/core';


@Component({
    templateUrl: 'dashboard.comp.html',
})

export class ReportsDashboardComp implements OnInit, OnDestroy {
    title: any;
    constructor() { }

    ngOnInit() {
        this.title = "Dashboard";
    }

    ngOnDestroy() {

    }
}
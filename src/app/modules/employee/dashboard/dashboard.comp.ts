import { Component, OnInit, OnDestroy } from '@angular/core';


@Component({
    templateUrl: 'dashboard.comp.html',
})

export class EmployeeDashboardComp implements OnInit, OnDestroy {
    title: any;
    constructor() { }

    ngOnInit() {
        this.title = "Dashboard";
        console.log('ngOnInit');
    }
    ngOnDestroy() { console.log('ngOnDestroy'); }
}
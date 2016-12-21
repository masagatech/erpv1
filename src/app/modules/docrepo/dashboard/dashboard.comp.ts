import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    templateUrl: 'dashboard.comp.html',
})

export class DRDashboardComp implements OnInit, OnDestroy {
    title: any;
    constructor() { }

    ngOnInit() {
        debugger;
        this.title = "Dashboard";
        console.log('ngOnInit');
    }
    ngOnDestroy() { console.log('ngOnDestroy'); }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { EmpService } from '../../../_service/employee/emp-service' /* add reference for view employee */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewemployee.comp.html',
    providers: [EmpService]
})

export class ViewEmployee implements OnInit, OnDestroy {
    type: string = "";
    value: string = "";
    name: string = "";

    title: any;
    EmpName: any;
    autoEmpName: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewEmployeeDT: any[];

    filterEmployeeData() {
        this.getEmployeeData();
    }

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _empservice: EmpService) {
        this.getEmployeeData();
    }

    ngOnInit() {
        this.title = "View Employee";
        this.type = "EmpWithCode";

        console.log(this.value);
        console.log(this.name);

        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    selectedItem(e: any) {
        console.log(this.autoEmpName);
    }

    getEmployeeData() {
        this._empservice.viewEmployeeDetails({ "flag": "all" }).subscribe(data => {
            this.viewEmployeeDT = data.data;
            debugger;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    expandDetails(row) {
        if (row.issh == 0) {
            row.issh = 1;
            if (row.details.length === 0) {
                this._empservice.viewEmployeeDetails({ "flag": "details", "empid": row.empid }).subscribe(data => {
                    row.details = data.data;
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.issh = 0;
        }
    }

    openEmployeeDetails(row) {
        this._router.navigate(['/employee/editemployee', row.empid]);
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/employee/addemployee']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { EmpService } from '../../../_service/employee/emp-service' /* add reference for view employee */
import { ValidationService } from '../../../_service/validation/valid-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewemployee.comp.html',
    providers: [EmpService, ValidationService]
})

export class ViewEmployee implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    type: string = "";
    value: string = "";
    name: string = "";

    title: any;
    EmpName: any;
    autoEmpName: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    viewEmployeeDT: any = [];
    totalRecords: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _empservice: EmpService,
        private _userservice: UserService, private _validservice: ValidationService) {
        this.loginUser = this._userservice.getUser();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Employee");
        this.type = "EmpWithCode";

        this.setActionRights();

        //this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        //this.setActionButtons.setActionButtons(this.actionButton);
        //this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/employee/add']);
        }
    }

    selectedItem(e: any) {
        console.log(this.autoEmpName);
    }

    getEmployeeData(from: number, to: number) {
        var that = this;

        that._empservice.getEmployee({ "flag": "all", "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy, "from": from, "to": to }).subscribe(employee => {
            that.totalRecords = employee.data[1].recordstotal;
            that.viewEmployeeDT = employee.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    loadEmpGrid(event: LazyLoadEvent) {
        this.getEmployeeData(event.first, (event.first + event.rows));
    }

    expandDetails(row) {
        if (row.issh == 0) {
            row.issh = 1;
            if (row.details.length === 0) {
                this._empservice.getEmployee({ "flag": "details", "empid": row.empid }).subscribe(data => {
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
        this._router.navigate(['/employee/details', row.empid]);
    }

    // Set Action Rights

    setActionRights() {
        var that = this;

        that._userservice.getMenuDetails({
            "flag": "actrights", "ptype": "emp", "mtype": "emp", "uid": that.loginUser.uid,
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
        }).subscribe(data => {
            var data = data.data.filter(a => a.dispfor === "view");

            if (data.length === 0) {
                return;
            }
            else {
                for (var i = 0; i < data.length; i++) {
                    var id = data[i].actnm;
                    var code = data[i].actcd;
                    var text = data[i].dispnm;
                    var icon = data[i].acticon;

                    that.actionButton.push(new ActionBtnProp(id, text, icon, true, false));
                    that.setActionButtons.setActionButtons(that.actionButton);
                }
            }

            that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
        });
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');

        if (this.subscr_actionbarevt !== undefined) {
            this.subscr_actionbarevt.unsubscribe();
        }
    }
}
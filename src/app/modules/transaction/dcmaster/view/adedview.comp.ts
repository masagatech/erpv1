import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for view employee */
import { dcviewService } from "../../../../_service/dcmaster/view/dcview-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'adedview.comp.html',
    providers: [dcviewService, CommonService]
})

export class dcview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Declare Veriable Local
    CustName: any = '';
    CustID: any = 0;

    FromData: any;
    ToData: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    CustomerAutodata: any[];
    salesorderview: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private SalesOrdViewServies: dcviewService, private _autoservice: CommonService,
        private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Sales Order");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            var date = new Date();
            var FromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            var ToDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#FromDate").datepicker('setDate', FromDate);

            $("#ToDate").datepicker({
                dateFormat: "dd/mm/yy",
                minDate: 0,
                autoclose: true,
                setDate: new Date()
            });
            $("#ToDate").datepicker('setDate', ToDate);
            $("#Custcode").focus();
        }, 0);
    }

    //Add Top Buttons
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/transaction/dcmaster/add']);
            //this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    loadRBIGrid(event: LazyLoadEvent) {

    }

    //Get Button Click Event 
    private GetData() {
        this.SalesOrdViewServies.GetSalesOrderView({                     //User getdcdropdown
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "acid": this.CustID
        }).subscribe(result => {
            var dataset = result.data;
            if (dataset.length > 0) {
                this.salesorderview = dataset;
            }
            else {
                alert("Record Not Found");
                $(".Custcode").focus();
            }
        }, err => {
            console.log('Error');
        }, () => {
            this.CustID = "";
        });

    }

    OpenEdit(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/transaction/dcmaster/edit', row.dcno]);
        }
    }

    expandDetails(event) {
        if (event.details && event.details.length > 0) { return; }
        var that = this;
        var row = event;
        row.loading = false;
        this.SalesOrdViewServies.GetSalesOrderView({
            "flag": "detail",
            "docno": row.docno,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(data => {
            row.loading = true;
            row.details = data.data;
            debugger;
            row.subtotal = 0;
            row.subqty = 0;
            for (let item of row.details) {
                row.subtotal += parseFloat(item.amount);
                row.subqty += parseFloat(item.ordqty);
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Customer Autoextender
    CustomerAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "customer",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "search": query
        }).then(data => {
            this.CustomerAutodata = data;
        });
    }

    CustomerSelect(event) {
        this.CustID = event.value;
        this.CustName = event.label;
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }

}
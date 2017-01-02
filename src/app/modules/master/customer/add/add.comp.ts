import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { CustomerAddService } from "../../../../_service/customer/add/add-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [CustomerAddService, CommonService]                         //Provides Add Service dcmaster-service.ts

}) export class CustAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    //Add Local Veriable
    custid: any = 0;
    code: any = "";
    firstname: any = "";
    middlename: any = "";
    lastname: any = "";
    company: any = 0;
    warehouse: any = 0;
    companylist: any = [];
    warehouselist: any = [];
    billadr: any = "";
    shippingchk: boolean = false;
    shippingadr: any = "";
    issh: any = 0;
    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private CustAddServies: CustomerAddService, private _autoservice: CommonService, private _routeParams: ActivatedRoute) {
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".code").focus();
        this.getcustomerdrop();

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.custid = params['id'];
                this.EditCust(this.custid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    //Get Company And Warehouse Dropdown Bind
    getcustomerdrop() {
        this.CustAddServies.getCustomerdrop({
            "cmpid": 1,
            "createdby": "admin"
        }).subscribe(result => {
            this.companylist = result.data[0];
            this.warehouselist = result.data[1];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ClearControll() {
        this.custid = 0;
        this.code = "";
        this.firstname = "";
        this.middlename = "";
        this.lastname = "";
        this.company = "";
        this.warehouse = "";
        this.billadr = "";
        this.shippingadr = "";
        this.shippingchk = false;
        this.warehouselist = [];
        this.issh = 0;
        $(".code").focus();
    }

    EditCust(id) {
        this.CustAddServies.getcustomer({
            "cmpid": 1,
            "flag": "Edit",
            "custid": id
        }).subscribe(result => {
            this.custid = result.data[0][0].autoid;
            this.code = result.data[0][0].code;
            this.firstname = result.data[0][0].firstname;
            this.middlename = result.data[0][0].middlename;
            this.lastname = result.data[0][0].lastname;
            this.company = result.data[0][0].cmp;
            this.warehouse = result.data[0][0].warehouseid;
            this.billadr = result.data[0][0].billing;
            this.shippingadr = result.data[0][0].shippingadr;
        }, err => {
            console.log("error");
        }, () => {
            console.log("Done");
        })
    }

    sameadr() {
        console.log(this.shippingchk);
        if (this.shippingchk == true) {
            this.shippingadr = this.billadr;
        } else {
            this.shippingadr = "";
            $(".shipping").focus();
        }


    }

    //Multipal Warehouse Selection Create a Json
    warehousejson() {
        var warehouseid = [];
        for (let wareid of this.warehouselist) {
            if (wareid.Warechk == true) {
                warehouseid.push({ "wareid": wareid.value });
            }
        }
        return warehouseid;
    }
    paramterjson() {
        var param = {
            "custid": this.custid,
            "code": this.code,
            "first": this.firstname,
            "middle": this.middlename,
            "last": this.lastname,
            "cmp": this.company,
            "warehouse": this.warehousejson(),
            "bill": this.billadr,
            "shipp": this.shippingadr,
            "cmpid": 1,
            "createdby": "admin"
        }
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['master/customer/view']);
        }
        if (evt === "save") {
            if (this.code == "") {
                alert("Please enter customer code");
                $(".code").focus();
                return;
            }
            if (this.firstname == "") {
                alert("Please enter customer first name");
                $(".firstname").focus();
                return;
            }
            if (this.company == 0) {
                alert("Please select company");
                $(".cmp").focus();
                return;
            }
            this.CustAddServies.saveCustomer(
                this.paramterjson()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_customer.maxid > 0) {
                    alert("Data Save Successfully");
                    this.ClearControll();
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".code").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    TabWare() {
        if (this.issh == 0) {
            this.issh = 1;
            this.CustAddServies.getCustomerdrop({
                "cmpid": 1,
                "createdby": "admin"
            }).subscribe(result => {
                this.warehouselist = result.data[1];
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } else {
            this.issh == 0;
        }

    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
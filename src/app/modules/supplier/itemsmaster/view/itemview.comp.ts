import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ItemViewService } from "../../../../_service/itemmaster/view/itemview-service";

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'itemview.comp.html',
    providers: [ItemViewService, CommonService]                         //Provides Add Service dcmaster-service.ts
    //,AutoService
}) export class itemview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    itemsName: any = "";
    itemsCode: any = "";
    FromDate: any = "";
    ToDate: any = "";
    ItemDetails: any = [];
    TableHide: boolean = true;

    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService, private itemViewServies: ItemViewService, private _autoservice: CommonService) { //Inherit Service dcmasterService
        //this.getPendingDocNo();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".Product").focus();
        setTimeout(function () {
            var date = new Date();
            var FromDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            var ToDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 
            $("#FromDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#FromDate").datepicker('setDate', FromDate);

            $("#ToDate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#ToDate").datepicker('setDate', ToDate);
        }, 0);
    }

    getAutoCompleteProductName(me: any) {
        this._autoservice.getAutoData({ "type": "prodname", "search": this.itemsName, "CmpCode": "Mtech", "FY": 5 }).subscribe(data => {
            $(".Product").autocomplete({
                source:data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.ProdCode = ui.item.value;
                    me.ProductName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getItemsMaster() {
        if ($(".Product").val() == "") {
            this.itemsCode = "";
        }
        this.FromDate = $("#FromDate").val();
        this.ToDate = $("#ToDate").val();
        this.itemViewServies.getItemsMaster({
            "cmpid": 1,
            "fy": 5,
            "flag": "",
            "itemscode": this.itemsCode,
            "createdby": "",
            "fromdate": this.FromDate,
            "todate": this.ToDate
        }).subscribe(details => {
            var dataset = details.data;
            if (dataset[0].funget_itemsmaster.length > 0) {
                this.ItemDetails = dataset;
                this.TableHide = false;
            }
            else {
                this.ItemDetails = [];
                this.TableHide = true;
                alert("Record not found");
                $(".Items").focus();
            }

        }, err => {
            console.log('Error');
        }, () => {
            //Done Process
        });
    }

    //Edit Row
    EditItem(row) {
        if (!row.islocked) {
            this._router.navigate(['/supplier/itemedit', row.itemsid]);
        }
    }

    //More Button Click
    expandDetails(row) {
        if (row.iscollapse == 0) {
            row.iscollapse = 1;
            if (row.Details.length === 0) {
                this.itemViewServies.getItemsMaster({
                    "flag": "Details",
                    "itemsid": row.itemsid,
                    "cmpid": 1,
                    "fy": 5
                }).subscribe(data => {
                    var dataset = data.data;
                    row.Details = dataset;
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.iscollapse = 0;
        }
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/itemadd']);
        }
        else if (evt === "save") {
            //Save CLick Event
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
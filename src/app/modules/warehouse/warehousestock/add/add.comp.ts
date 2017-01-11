import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { WarehouseAddService } from "../../../../_service/warehousestock/add/add-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [WarehouseAddService, CommonService]                         //Provides Add Service

}) export class WarehouseAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    qty: number = 0;
    NewItemsName: any = "";
    NewItemsid: any = 0;
    itemsname: any = '';
    itemsid: any = 0;
    counter: number = 0;
    remark: any = "";
    Duplicateflag: boolean;
    ItemsfilteredList: any = [];
    newAddRow: any = [];
    wareid: number = 0;
    fromwarname: any = "";
    Towarname: any = "";
    Towarid: number = 0;
    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: WarehouseAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".from").focus();
    }

    // //Selected Items
    ItemsSelected(val) {
        if (val != "") {
            this.wareServies.getItemsAutoCompleted({
                "cmpid": 1,
                "fy": 5,
                "itemsid": val,
                "createdby": ""
            }).subscribe(itemsdata => {
                var ItemsResult = itemsdata.data;
                this.qty = ItemsResult[0].qty;
                this.ItemsfilteredList = [];
                //}
            }, err => {
                console.log("Error");
            }, () => {
                //console.log("Done");
            });
        }
    }

    //AutoCompletd Product Name
    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "CatProdName", "search": arg == 0 ? me.NewItemsName : me.ItemsName }).subscribe(data => {
            $(".ProdName").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.itemsname = ui.item.label;
                    if (arg === 1) {
                        me.itemsname = ui.item.label;
                        me.itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid);
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.Itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid);
                    }
                    //   me.ItemsKey = ui.item.label;
                    //  _me.ItemsSelected(me.ItemsID);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getAutoCompleteWareFrom(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "customer", "search": _me.fromwarname }).subscribe(data => {
            $(".from").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.wareid = ui.item.value;
                    me.fromwarname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getAutoCompleteWareTO(me: any) {
        var _me = this;
        this._autoservice.getAutoData({ "type": "customer", "search": _me.Towarname }).subscribe(data => {
            $(".to").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.Towarid = ui.item.value;
                    me.Towarname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add New Row
    private NewRowAdd() {
        if (this.itemsname == '' || this.itemsname == undefined) {
            alert('Please Enter items Name');
            return;
        }
        if (this.qty == 0 || this.qty == undefined) {
            alert('Please Enter Quntity');
            return;
        }
        this.Duplicateflag = true;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].ItemsName == this.itemsname) {
                this.Duplicateflag = false;
                break;
            }
        }
        if (this.Duplicateflag == true) {
            debugger;
            this.newAddRow.push({
                "autoid": 0,
                'itemsname': this.itemsname,
                "itemsid": this.itemsid,
                'qty': this.qty,
                'remark': this.remark,
                'counter': this.counter
            });

            this.counter++;
            this.itemsname = "";
            this.NewItemsName = "";
            this.qty = 0;
            this.remark = "";
            $("#foot_custname").focus();
        }
        else {
            alert('Duplicate Item');
            return;
        }

    }

    //Delete Row 
    private DeleteRow(item) {
        var index = -1;
        for (var i = 0; i < this.newAddRow.length; i++) {
            if (this.newAddRow[i].counter === item.counter) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.newAddRow.splice(index, 1);
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/warestock/view']);
        }
        if (evt === "save") {

            if (this.fromwarname == "") {
                alert("Please Enetr From Warehouse");
                $(".from").focus();
                return;
            }
            if (this.Towarname == "") {
                alert("Please Enetr To Warehouse");
                $(".to").focus();
                return;
            }
            if (this.fromwarname == this.Towarname) {
                alert("From And To Warehouse Same");
                $(".to").focus();
                return;
            }

            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
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
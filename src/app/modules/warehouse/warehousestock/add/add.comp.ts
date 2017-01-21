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
    docno:number=0;
    NewItemsName: any = "";
    NewItemsid: any = 0;
    itemsname: any = '';
    itemsid: any = 0;
    counter: number = 0;
    remark: any = "";
    rem:any="";
    Duplicateflag: boolean;
    ItemsfilteredList: any = [];
    newAddRow: any = [];
    fromwareid: number = 0;
    fromwarname: any = "";
    Towarname: any = "";
    Towarid: number = 0;
    editadd: number = 0;
    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private wareServies: WarehouseAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
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
        this._autoservice.getAutoData({ "type": "CatProdName", "search": arg == 0 ? me.NewItemsName : me.itemsname }).subscribe(data => {
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
                    if (arg === 1) {
                        me.itemsname = ui.item.label;
                        me.itemsid = ui.item.value;
                        _me.ItemsSelected(me.Itemsid);
                        me.editadd = 1;
                    } else {
                        me.NewItemsName = ui.item.label;
                        me.NewItemsid = ui.item.value;
                        _me.ItemsSelected(me.NewItemsid);
                        me.editadd = 0;
                    }
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
                    me.fromwareid = ui.item.value;
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
        var that = this;
        if (that.editadd == 1) {
            if (that.itemsname == '' || that.itemsname == undefined) {
                alert('Please Enter items Name');
                return;
            }
        }
        else {
            if (that.NewItemsName == '' || that.NewItemsName == undefined) {
                alert('Please Enter items Name');
                return;
            }
        }

        if (that.qty == 0 || that.qty == undefined) {
            alert('Please Enter Quntity');
            return;
        }
        that.Duplicateflag = true;
        for (var i = 0; i < that.newAddRow.length; i++) {
            if (that.newAddRow[i].ItemsName == that.itemsname) {
                that.Duplicateflag = false;
                break;
            }
        }
        if (that.Duplicateflag == true) {
            if (that.editadd == 1) {
                that.newAddRow.push({
                    "autoid": 0,
                    'itemsname': that.itemsname,
                    "itemsid": that.itemsid,
                    'qty': that.qty,
                    'remark': that.remark,
                    'counter': that.counter
                });
            }
            else {
                that.newAddRow.push({
                    "autoid": 0,
                    'itemsname': that.NewItemsName,
                    "itemsid": that.NewItemsid,
                    'qty': that.qty,
                    'remark': that.remark,
                    'counter': that.counter
                });
            }

            that.counter++;
            that.itemsname = "";
            that.NewItemsName = "";
            that.qty = 0;
            that.remark = "";
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
        $("#foot_custname").focus();
    }

    paramsjson() {
        var that = this;
        var param = {
            "docno":that.docno,
            "fromid": that.fromwareid,
            "toid": that.Towarid,
            "remark": that.rem,
            "cmpid":1,
            "fy":5,
            "createdby":"admin",
            "warehousedetails": that.newAddRow
        }
        console.log(param);
        return param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        var that = this;
        //Back Button CLick 
        if (evt === "back") {
            that._router.navigate(['warehouse/warestock/view']);
        }
         //Save Button Click 
        if (evt === "save") {
            if (that.fromwarname == "") {
                alert("Please Enetr From Warehouse");
                $(".from").focus();
                return;
            }
            if (that.Towarname == "") {
                alert("Please Enetr To Warehouse");
                $(".to").focus();
                return;
            }
            if (that.fromwarname == that.Towarname) {
                alert("From And To Warehouse Same");
                $(".to").focus();
                return;
            }
            that.wareServies.saveWarehouse(
                that.paramsjson()
            ).subscribe(result => {
                console.log(result.data);
            }, err => {
                console.log("Error");
            }, () => {
                //Completed
            })


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
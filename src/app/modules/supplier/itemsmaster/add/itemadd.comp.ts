import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ItemAddService } from "../../../../_service/itemmaster/add/itemadd-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'itemadd.comp.html',
    providers: [ItemAddService, CommonService]                         //Provides Add Service
    //,AutoService
}) export class itemadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    itemsid: any = 0;
    itemcode: any = "";
    itemname: any = "";
    Catname: any = "";
    Catid: any = 0;
    SaleDesc: any = "";
    PurDesc: any = "";
    Cost: any = 0;
    UoMId: any = 0;
    ImgPath: any = "";
    MRP: any = 0;
    SaleDis1: any = 0;
    PurDis2: any = 0;
    CurID: any = 0;
    ProdCodeTitle: any = "";
    Remark1: any = "";
    Remark2: any = "";
    Remark3: any = "";
    Remark4: any = "";
    Remark5: any = "";
    Remark6: any = "";
    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private itemsaddServies: ItemAddService, private _autoservice: CommonService, private _routeParams: ActivatedRoute) { //Inherit Service
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".Category").focus();
        setTimeout(function () {
            var date = new Date();
            var CurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            //From Date 
            $("#docdate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#docdate").datepicker('setDate', CurrentDate);
        }, 0);
        $('.ProdCode').removeAttr('disabled');
        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.itemsid = params['id'];
                this.EditItems(this.itemsid);

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

    //Edit Paramter
    EditParamJson() {
        var Param = {
            "cmpid": 1,
            "fy": 5,
            "itemsid": this.itemsid,
            "createdby": "",
            "flag": "Edit",
            "fromdate": null,
            "todate": null
        }
        return Param;
    }

    //Edit Item
    EditItems(ProdCode) {
        var that = this;
        this.itemsaddServies.EditItem(
            this.EditParamJson()
        ).subscribe(result => {
            var returndata = result.data;
            if (returndata.length > 0) {
                this.itemcode = returndata[0].itemcode;
                this.Catid = returndata[0].catid;
                this.Catname = returndata[0].catname;
                this.itemname = returndata[0].itemname;
                this.MRP = returndata[0].mrp1;
                this.SaleDis1 = returndata[0].saledis;
                this.SaleDesc = returndata[0].saledesc;
                this.Cost = returndata[0].itemscost;
                this.PurDis2 = returndata[0].purdis;
                this.PurDesc = returndata[0].purdesc;
                that.ProdCodeTitle = "(" + returndata[0].itemcode + ")";
            }
            else
            {
                alert('Record not found');
                $(".Category").focus();
                return;
            }

        }, err => {
            console.log(err);
        }, () => {
            //Complete
        })
    }

    //Auto Completed Category
    getAutoCompleteCategory(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "category", "search": that.Catname, "cmpid": 1, "fy": 5 }).subscribe(data => {
            $(".Category").autocomplete({
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
                    me.Catid = ui.item.value;
                    me.Catname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Clear Controll
    private ClearControll() {
        this.itemsid = 0;
        this.Catname = "";
        this.itemcode = "";
        this.itemname = "";
        this.MRP = "";
        this.SaleDis1 = "";
        this.SaleDesc = "";
        this.Cost = "";
        this.PurDis2 = "";
        this.PurDesc = "";
        $(".Category").val("");
        $(".Category").focus();
    }

    //Parametr With Json
    private ParamJson() {
        var Param = {
            "itemsid": this.itemsid,
            "cmpid": 1,
            "fy": 5,
            "createdby": "admin",
            "itemcode": this.itemcode,
            "catid": this.Catid,
            "itemname": this.itemname,
            "saledesc": this.SaleDesc,
            "purdesc": this.PurDesc,
            "itemscost": this.Cost,
            "uomid": this.UoMId,
            "prodimagepath": this.ImgPath,
            "mrp1": this.MRP,
            "saledis": this.SaleDis1 == "" ? 0 : this.SaleDis1,
            "purdis": this.PurDis2 == "" ? 0 : this.PurDis2,
            "currid": this.CurID,
            "remark1": this.Remark1,
            "remark2": this.Remark2,
            "remark3": this.Remark3,
            "remark4": this.Remark4,
            "remark5": this.Remark5,
            "remark6": this.Remark6
        }
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            this.itemsaddServies.itemsMasterSave(
                this.ParamJson()
            ).subscribe(details => {
                var dataset = details.data;
                if (dataset[0].funsave_itemsmaster.msg == "Saved") {
                    alert("Data Save Succssfully Document")
                    this.ClearControll();
                }
                else {
                    console.log('Error');
                    $(".Category").focus();
                    return;
                }
            }, err => {
                console.log('Error');
            }, () => {
                //Done Process
            });
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".ProdCode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            $(".Category").focus();
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
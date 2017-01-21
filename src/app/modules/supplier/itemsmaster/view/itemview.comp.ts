import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ItemViewService } from "../../../../_service/itemmaster/view/itemview-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

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
    itemsid: any = 0;
    FromDate: any = "";
    ToDate: any = "";
    ItemDetails: any = [];
    TableHide: boolean = true;
    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private itemViewServies: ItemViewService, private _autoservice: CommonService,
        private _userService: UserService,private _msg: MessageService) { //Inherit Service dcmasterService
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".items").focus();
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
        var that = this;
        this._autoservice.getAutoData({ "type": "CatProdName", "search": that.itemsName, "cmpid": 1, "FY": 5 }).subscribe(data => {
            $(".items").autocomplete({
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
                    me.itemsid = ui.item.value;
                    me.itemsName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getItemsMaster() {
        if ($(".items").val() == "") {
            this.itemsid = "";
        }
        this.FromDate = $("#FromDate").val();
        this.ToDate = $("#ToDate").val();
        this.itemViewServies.getItemsMaster({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fyid,
            "createdby":this.loginUser.login,
            "flag": "",
            "itemsid": this.itemsid,
            "fromdate": this.FromDate,
            "todate": this.ToDate
        }).subscribe(details => {
            var dataset = details.data;
            if (dataset.length > 0) {
                this.ItemDetails = dataset;
                this.TableHide = false;
            }
            else {
                this.ItemDetails = [];
                this.TableHide = true;
                  this._msg.Show(messageType.info, "info", "Record not found");
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
            this._router.navigate(['/supplier/itemsmaster/itemedit', row.itemsid]);
        }
    }

    //More Button Click
    expandDetails(row) {
        row.attribute = [];
        row.saleprice = [];
        if (row.issh == 0) {
            row.issh = 1;
            if (row.attribute.length === 0) {
                this.itemViewServies.getItemsMaster({
                    "flag": "Details",
                    "itemsid": row.itemsid,
                    "cmpid": this.loginUser.cmpid,
                    "fy": this.loginUser.fyid
                }).subscribe(data => {
                    var dataset = data.data;
                    row.attribute = dataset[0]._attributejson;
                    row.saleprice = dataset[0]._salesjson;
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

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/supplier/itemsmaster/itemadd']);
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
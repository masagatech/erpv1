import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { goodAddService } from "../../../../_service/goodreceiptnote/add/add-service";
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [goodAddService, CommonService]

}) export class goodAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    goodlist: any = [];
    gooddate: any = "";
    custname: any = "";
    custid: number = 0;
    bill: any = "";
    suppname: any = "";
    suppid: number = 0;
    tranname: any = "";
    transid: number = 0;
    typ: number = 0;
    typlist: any = [];
    itemsid: number = 0;
    itemname: any = 0;
    NewItemsName: any = "";
    NewItemsid: number = 0;
    itemsselectedid: number = 0;
    itemedit: number = 0;
    rate: any = "";
    qty: any = "";
    amt: any = "";
    counter: number = 0;
    itemslist: any = [];

    Duplicateflag: boolean;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    private subscribeParameters: any;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private opeingServies: goodAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService
        , private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".cust").focus();

        setTimeout(function () {
            var date = new Date();
            var opeingdate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            $("#gooddate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#gooddate").datepicker('setDate', opeingdate);
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                // this.docno = params['id'];
                // this.editMode(this.docno);

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

    //Get type
    gettypes() {

    }

    AddNewRow() {
        if (this.itemsselectedid > 0) {
            if ($(".itemdis").val() == "") {
                this._msg.Show(messageType.info, "info", "Please Enter Items Discount");
                $(".itemdis").focus();
                return;
            }
            this.Duplicateflag = true;
            for (var i = 0; i < this.itemslist.length; i++) {
                if (this.itemslist[i].itemsname == this.itemname) {
                    this.Duplicateflag = false;
                    break;
                }
            }
            if (this.Duplicateflag == true) {
                if (this.itemedit == 1) {
                    this.itemslist.push({
                        'itemname': this.itemname,
                        'itemsid': this.itemsid,
                        'qty': this.qty,
                        'rate': this.rate,
                        'amt': this.amt,
                        'counter': this.counter
                    });
                }
                else {
                    this.itemslist.push({
                        'itemname': this.NewItemsName,
                        'itemsid': this.NewItemsid,
                        'qty': this.qty,
                        'rate': this.rate,
                        'amt': this.amt,
                        'counter': this.counter
                    });
                }
                this.counter++;
                this.itemname = "";
                this.itemsid = 0;
                this.NewItemsName = "";
                this.NewItemsid = 0;
                this.qty = "";
                this.rate = "";
                this.amt = "";
                $(".ProdName").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Items");
                $(".itemsname").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valid items name");
            $(".itemsname").focus();
            return;
        }
    }

    getAutoCompleteTrans(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "Custtrans",
            "search": _me.tranname,
            "cmpid": _me.loginUser.cmpid,
            "custid":_me.custid,
            "fy": this.loginUser.fyid
        }).subscribe(data => {
            $(".trans").autocomplete({
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
                    me.transid = ui.item.value;
                    me.tranname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

     getAutoCompleteSalesman(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "salesmanwithcust",
            "search": _me.suppname,
            "cmpid": _me.loginUser.cmpid,
            "custid":_me.custid,
            "fy": this.loginUser.fyid
        }).subscribe(data => {
            $(".salesman").autocomplete({
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
                    me.suppid = ui.item.value;
                    me.suppname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }


    getAutoCompleteCust(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "customer",
            "search": _me.custname,
            "cmpid": _me.loginUser.cmpid,
            "fy": this.loginUser.fyid
        }).subscribe(data => {
            $(".cust").autocomplete({
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
                    me.custid = ui.item.value;
                    me.custname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getAutoCompleteProd(me: any, arg: number) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "product",
            "search": arg == 0 ? me.NewItemsName : me.itemname,
            "cmpid": _me.loginUser.cmpid,
            "fy": this.loginUser.fyid
        }).subscribe(data => {
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
                        me.itemsid = ui.item.value;
                        me.itemname = ui.item.label;
                        me.itemsselectedid = me.itemsid;
                        me.itemedit = 1;
                    }
                    else {
                        me.NewItemsid = ui.item.value;
                        me.NewItemsName = ui.item.label;
                        me.itemsselectedid = me.NewItemsid;
                        me.itemedit = 0;
                    }

                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    DeleteRow(row) {
        var index = -1;
        for (var i = 0; i < this.itemslist.length; i++) {
            if (this.itemslist[i].counter === row.counter) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.itemslist.splice(index, 1);
        $(".ProdName").focus();
    }



    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/goodreceipt/view']);
        }
        if (evt === "save") {
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
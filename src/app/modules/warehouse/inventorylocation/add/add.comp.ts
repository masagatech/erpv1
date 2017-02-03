import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { InvAddService } from "../../../../_service/inventorylocation/add/add-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [InvAddService, CommonService]                         //Provides Add Service

}) export class invlocationAdd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    wareid: any = 0;
    warename: any = "";
    localname: any = "";
    localid: number = 0;
    localoldnam: any = "";
    localoldid: any = 0;
    locationlist: any = [];
    counter: any = 0;
    Duplicateflag: boolean = true;
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private invServies: InvAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _msg: MessageService, private _userService: UserService) { //Inherit Service
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
        $(".warename").focus();
    }

    // Warehouse Auto extender
    getAutoCompleteWare(me: any) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "warehouse",
            "search": _me.warename,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy
        }).subscribe(data => {
            $(".warename").autocomplete({
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
                    me.warename = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    clearcontroll() {
        this.warename = "";
        this.wareid = 0;
        this.locationlist = [];
        $(".warename").focus();
    }

    jsondata() {
        var jdata = [];
        for (let item of this.locationlist) {
            if (item.localist != undefined) {
                if (item.localist.length > 0) {
                    var loclist = [];
                    for (let loc of item.localist) {
                        loclist.push({
                            'id': loc.id
                        })
                    }
                    jdata.push({
                        'autoid': 0,
                        'itemid': item.itemid,
                        'localist': loclist,
                        'remark': item.remark,
                        'remark1': '',
                        'remark2': '',
                        'remark3': ''
                    })
                }
            }

        }
        return jdata;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/invlocation/view']);
        }
        if (evt === "save") {
            this.invServies.savelocation({
                "locationdetails": this.jsondata(),
                "wareid": this.wareid,
                "fy": this.loginUser.fy,
                "cmpid": this.loginUser.cmpid,
                "createdby": this.loginUser.login
            }).subscribe(result => {
                if (result.data[0].funsave_inventorylocal.maxid > 0) {
                    this._msg.Show(messageType.success, "success", result.data[0].funsave_inventorylocal.msg);
                    this.clearcontroll();
                }

            }, err => {
                console.log('Error');
            }, () => {
                //Complete
            });


            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    //Get Button CLick Event 
    getwarehouselocation() {
        if ($(".warename").val() == "") {
            this._msg.Show(messageType.info, "info", "Please enter warehouse name");
            $(".warename").focus();
            return;
        }
        this.invServies.getlocation({
            "cmpid": this.loginUser.cmpid,
            "wareid": this.wareid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            var dataset = result.data;
            console.log(dataset);
            if (dataset.length > 0) {
                this.locationlist = result.data;
            }
            else {
                this._msg.Show(messageType.info, "info", "Record not found");
                this.clearcontroll();
                $(".warename").focus();
                return;
            }

        }, err => {
            console.log('Error');
        }, () => {
            //Complete
        });
    }

    //Location Remove
    RemoveSale(item: any = [], row: any = []) {
        var index = -1;
        for (var i = 0; i < item.localist.length; i++) {
            if (item.localist[i].id === row.id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        item.localist.splice(index, 1);
    }

    getAutoCompletelocal(me: any, arg: number) {
        var _me = this;
        this._autoservice.getAutoData({
            "type": "attribute",
            "search": arg == 0 ? me.localname : me.localname,
            "filter": "Warehouse Bin Location",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy
        }).subscribe(data => {
            $(".local").autocomplete({
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
                        me.localid = ui.item.value;
                        me.localname = ui.item.label;
                        _me.addnewlocal(me.localid, me.localname, me)
                    }
                    else {
                        me.localoldid = ui.item.value;
                        me.localoldnam = ui.item.label;
                        _me.addnewlocal(me.localoldid, me.localoldnam, me)
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    addnewlocal(id, val, me) {
        if (me.localist == undefined) {
            me.localist = [];
        }
        var that = this;
        this.Duplicateflag = true;
        if (this.locationlist.length > 0) {
            for (var i = 0; i < me.localist.length; i++) {
                if (me.localist[i].id == id) {
                    this.Duplicateflag = false;
                    break;
                }
            }
        }
        if (this.Duplicateflag == true) {
            me.localist.push({
                "id": id,
                "localnam": val,
            });
            me.localname = "";
        }
        else {
            this._msg.Show(messageType.info, "info", "Duplicate location");
        }

    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
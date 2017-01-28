import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { InvAddService } from "../../../../_service/inventorylocation/add/add-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';

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
    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private invServies: InvAddService, private _autoservice: CommonService,
        private _routeParams: ActivatedRoute, private _userService: UserService) { //Inherit Service
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
            "fy": this.loginUser.fyid
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



    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "back") {
            this._router.navigate(['warehouse/invlocation/view']);
        }
        if (evt === "save") {
            this.invServies.savelocation({
                "locationdetails": this.locationlist,
                "fy": this.loginUser.fyid,
                "cmpid": this.loginUser.cmpid,
                "createdby": this.loginUser.login
            }).subscribe(result => {
                console.log(result.data);
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
        this.invServies.getlocation({
            "cmpid": this.loginUser.cmpid,
            "wareid": this.wareid,
            "fy": this.loginUser.fyid,
            "createdby": this.loginUser.login
        }).subscribe(result => {
            this.locationlist = result.data;

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
            "fy": this.loginUser.fyid
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
        me.localist.push({
            "id": id,
            "localnam": val,
        });
        me.localname = "";
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
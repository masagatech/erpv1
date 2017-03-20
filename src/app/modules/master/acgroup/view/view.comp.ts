import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { acgroupview } from "../../../../_service/acgroup/view/view-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'view.comp.html',
    providers: [acgroupview, CommonService]
    //,AutoService
}) export class acview implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // FromDate: any;
    // ToDate: any;
    GroupName: any = "";
    Groupcode: any = 0;
    acgrouplist: any = [];

    //Grid Veriable
    totalRecords: number = 0;
    totalDetailsRecords: number = 0;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //Auto Compeletd
    GroupAutodata: any = [];

    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private acgroupServies: acgroupview, private _autoservice: CommonService,
        private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, true));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setTitle("Account Group");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        setTimeout(function () {
            $(".GroupName input").focus();
        }, 0)
        this.getAccountGroupView(0, 0, "p", null);
    }

    //Get Edit And View
    getAccountGroupView(prid: any, natid: any, flg: any, nodeChild: any) {
        try {
            this.acgroupServies.acGroupView({
                "prgid": prid,
                "natid": natid,
                "flag1": flg,
                "cmpid": this.loginUser.cmpid,
                "FY": this.loginUser.fy,
                "CreatedBy": this.loginUser.login,
                "flag": "all"
            }).subscribe(result => {
                var dataset = result.data;
                if (dataset.length > 0) {
                    var data = dataset[0];
                    var resolvedD = [];
                    for (var i = 0; i <= data.length - 1; i++) {
                        resolvedD.push({
                            "data": {
                                "prgid": data[i].id,
                                "natid": data[i].natid,
                                "grpcd": data[i].grpcd,
                                "grp": data[i].grp,
                                "isf": flg,
                                "leafcnt": data[i].leafcnt
                            },
                            "leaf": (data[i].leafcnt == 0 ? true : false)
                        })
                    }
                    if (flg == "p")
                        this.acgrouplist = resolvedD;
                    else {
                        nodeChild.children = resolvedD;
                    }
                }
                else {
                    $(".GroupName input").focus();
                    return;
                }

            }, err => {
                console.log("Error");

            }, () => {
                //Done
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //More Button Click Event
    expandDetails(event) {
        try {
            if (event.details && event.details.length > 0) { return; }
            var that = this;
            var row = event;
            row.loading = false;
            this.acgroupServies.acGroupView({
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdBy": this.loginUser.login,
                "flag": "details",
                "groupid": 0,
                "neturid": row.autoid
            }).subscribe(data => {
                var dataset = data.data;
                if (dataset.length > 0) {
                    row.totalDetailsRecords = dataset[1][0].recordstotal;
                    row.loading = true;
                    row.details = dataset[0];
                }
                else {
                    that._msg.Show(messageType.error, "error", "Record Not Found");
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    nodeExpand(event) {
        if (event.node) {
            console.log(event.node);
            var data = event.node.data;
            //in a real application, make a call to a remote url to load children of the current node and add the new nodes as children
            // this.nodeService.getLazyFilesystem().then(nodes => event.node.children = nodes);
            var prgid = (data.isf == "p" ? data.natid : data.prgid);
            var natid = (data.isf == "p" ? data.prgid : data.natid);

            this.getAccountGroupView(prgid, natid, "", event.node);
        }
    }

    //Group Code (Edit) Group
    Editacgroup(event) {
        try {
            var data = event.data;
            if (data != undefined) {
                data = event.data;
            }
            else {
                data = event;
            }
            if (!data.IsLocked) {
                this._router.navigate(['/master/acgroup/edit', data.groupid]);
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    GroupAuto(event) {
        let query = event.query;
        this._autoservice.getAutoDataGET({
            "type": "groupname",
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "search": query
        }).then(data => {
            this.GroupAutodata = data;
        });
    }

    //Selected Customer
    GroupSelect(event) {
        this.Groupcode = event.value;
        this.GroupName = event.label;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/master/acgroup/add']);
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
        this.setActionButtons.setTitle("");
    }
}
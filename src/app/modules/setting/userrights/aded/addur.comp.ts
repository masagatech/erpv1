import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for emp */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for fy */
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, DataTable, DataList, DataGrid, Panel, Dialog } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'addur.comp.html',
    providers: [CommonService, CompService, UserService, FYService],
    styles: ['.panel-dropdown{position: absolute;z-index: 2;width: 280px;}']
})

export class AddUserRights implements OnInit, OnDestroy {
    title: any;
    isOpenFYDDL: any = 0;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    CompanyDetails: any = [];
    FYDetails: any = [];
    totalRecords: number;

    cmpid: any = 0;
    fy: number = 0;

    deptid: number = 0;
    uid: any = "";
    uname: any = "";

    refuid: any = "";
    refuname: any = "";

    menuname: any;
    fyname: any;

    selectedCompany: any = { "menudetails": [] };

    selectedMenu: any = [];
    MenuActions: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _compservice: CompService, private _fyservice: FYService,
        private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['uid'] !== undefined) {
                this.setActionButtons.setTitle("Edit User Rights");

                this.uid = params['uid'];
                console.log(params['uid']);

                //var row = this.CompanyDetails;
                //this.getUserRightsById(params['uid']);
            }
            else {
                this.setActionButtons.setTitle("Add User Rights");

                setTimeout(function () {
                    $("#uname").focus();
                }, 0);

                this.title = "Add User Rights";
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveUserRights();
        }
        else if (evt === "clear") {
            this.resetUserRights();
        }
    }

    resetUserRights() {
        $(".uname").focus();
        this.uid = "";
        this.uname = "";
        this.refuid = "";
        this.refuname = "";
        this.CompanyDetails = [];
        this.selectedCompany.menudetails = [];
        this.fy = 0;
    }

    getUserAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "userwithcode", "search": that.uname }).subscribe(data => {
            $(".uname").autocomplete({
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
                    me.uid = ui.item.value;
                    me.uname = ui.item.label;

                    me.refuid = ui.item.value;
                    me.refuname = ui.item.label;

                    that.getCompanyRights(ui.item.value);
                }
            });
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getRefUserAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "userwithcode", "search": that.uname }).subscribe(data => {
            $(".refuname").autocomplete({
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
                    me.refuid = ui.item.value;
                    me.refuname = ui.item.label;
                }
            });
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyRights(puid) {
        var that = this;

        that._compservice.getCompany({ "flag": "usrwise", "uid": puid }).subscribe(data => {
            that.CompanyDetails = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getMenuRights(rights) {
        return rights.split(',');
    }

    getFYDetails(row) {
        var that = this;

        that._fyservice.getfy({ "flag": "usrcmpwise", "uid": row.uid, "cmpid": row.cmpid }).subscribe(data => {
            that.FYDetails = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    getMenuDetails(row) {
        var that = this;

        this._userservice.getMenuDetails({ "flag": "all" }).subscribe(data => {
            row.menudetails = data.data;
            that.selectedCompany = row;

            that.getFYDetails(row);
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    getUserRights() {
        var GiveRights = [];
        var menuitem = null;

        for (var i = 0; i <= this.selectedCompany.menudetails.length - 1; i++) {
            menuitem = null;
            menuitem = this.selectedCompany.menudetails[i];

            if (menuitem !== null) {
                var actrights = "";

                $("#M" + menuitem.menuid).find("input[type=checkbox]").each(function () {
                    actrights += (this.checked ? $(this).val() + "," : "");
                });

                if (actrights != "") {
                    GiveRights.push({ "menuid": menuitem.menuid, "rights": actrights.slice(0, -1) });
                }
            }
        }

        return GiveRights;
    }

    saveUserRights() {
        var that = this;
        var giverights = that.getUserRights();

        var saveUR = {
            "uid": this.uid,
            "cmpid": this.selectedCompany.cmpid,
            "fy": this.fy,
            "giverights": giverights,
            "uidcode": "1:admin" //this.loginUser.uid
        }

        if (this.uid == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter User");
        }
        else if (this.refuid == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Reference User");
        }
        else if (this.selectedCompany.length === 0) {
            that._msg.Show(messageType.error, "Error", "Please Select Company");
        }
        else if (this.selectedCompany.menudetails.length === 0) {
            that._msg.Show(messageType.error, "Error", "Please Select Company");
        }
        else if (this.fy == 0) {
            that._msg.Show(messageType.error, "Error", "Please Select Financial Year");
        }
        else {
            this._userservice.saveUserRights(saveUR).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_userrights.msgid != "-1") {
                    that._msg.Show(messageType.info, "Info", dataResult[0].funsave_userrights.msg);
                    this._router.navigate(['/setting/userrights']);
                }
                else {
                    that._msg.Show(messageType.info, "Info", dataResult[0].funsave_userrights.msg);
                }
            }, err => {
                that._msg.Show(messageType.info, "Info", err);
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    allCheck: boolean = false;

    private selectAndDeselectAllCheckboxes() {
        if ($("#menus").is(':checked')) {
            $(".allcheckboxes input[type=checkbox]").prop('checked', true);
        }
        else {
            $(".allcheckboxes input[type=checkbox]").prop('checked', false);
        }
    }

    private selectAndDeselectMenuWiseCheckboxes(row) {
        if ($("#" + row.menuid).is(':checked')) {
            $("#M" + row.menuid + " input[type=checkbox]").prop('checked', true);
        }
        else {
            $("#M" + row.menuid + " input[type=checkbox]").prop('checked', false);
        }
    }

    private clearcheckboxes(): void {
        $(".allcheckboxes input[type=checkbox]").prop('checked', false);
    }

    getUserRightsById(row) {
        var that = this;
        this.clearcheckboxes();

        that._userservice.getUserRights({ "flag": "details", "uid": row.uid, "cmpid": row.cmpid, "fy": that.fy }).subscribe(data => {
            var viewUR = data.data;

            var userrights = null;
            var menuitem = null;
            var actrights = null;

            if (viewUR[0] != null) {
                userrights = null;
                userrights = viewUR[0].giverights;

                if (userrights != null) {
                    for (var i = 0; i <= userrights.length - 1; i++) {
                        menuitem = null;
                        menuitem = userrights[i];

                        if (menuitem != null) {
                            actrights = null;
                            actrights = menuitem.rights.split(',');

                            if (actrights != null) {
                                for (var j = 0; j <= actrights.length - 1; j++) {
                                    $("#M" + menuitem.menuid).find("#" + menuitem.menuid + actrights[j]).prop('checked', true);
                                }
                                $(".allcheckboxes").find("#" + menuitem.menuid).prop('checked', true);
                                $("#menus").prop('checked', true);
                            }
                            else {
                                $(".allcheckboxes").find("#" + menuitem.menuid).prop('checked', false);
                                $("#menus").prop('checked', false);
                            }
                        }
                    }
                }
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { UserMoreRightsComp } from '../../../usercontrol/usermorerights';

declare var $: any;

@Component({
    templateUrl: 'addur.comp.html',
    providers: [CommonService, CompService, FYService],
    styles: ['.panel-dropdown{position: absolute;z-index: 2;width: 280px;}']
})

export class AddUserRights implements OnInit, OnDestroy {
    loginUser: LoginUserModel;

    usersDT: any = [];
    CompanyDetails: any = [];
    FYDetails: any = [];
    totalRecords: number;

    morerights: boolean = false;
    menuname: string = "";

    cmpid: any = 0;
    fy: number = 0;

    deptid: number = 0;
    uid: string = "";
    uname: string = "";
    ufullname: string = "";

    refuid: string = "";
    refuname: string = "";

    selectedCompany: any = { "menudetails": [] };

    selectedMenu: any = [];
    MenuActions: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    @ViewChild("jvdate")
    dialog: UserMoreRightsComp;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _autoservice: CommonService, private _compservice: CompService, private _fyservice: FYService,
        private _userservice: UserService, private _msg: MessageService) {
        this.loginUser = this._userservice.getUser();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("User Rights");
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['uid'] !== undefined) {
                this.uid = params['uid'];
                console.log(params['uid']);
            }
            else {
                setTimeout(function () {
                    $("#uname input").focus();
                }, 0);
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
        $("#uname").focus();
        this.uid = "";
        this.uname = "";
        this.refuid = "";
        this.refuname = "";
        this.CompanyDetails = [];
        this.selectedCompany.menudetails = [];
        this.fy = 0;
    }

    // Auto Completed User

    getAutoUsers(event) {
        var that = this;
        let query = event.query;

        this._autoservice.getAutoDataGET({
            "type": "userwithcode",
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "search": query
        }).then(data => {
            this.usersDT = data;
        });
    }

    // Selected User

    selectAutoUsers(event, arg) {
        var that = this;

        that.uid = event.value;
        that.uname = event.label;

        that.refuid = event.value;
        that.refuname = event.label;
        that.ufullname = event.name;

        that.getCompanyRights(event.value);
    }

    // Selected Reference User

    selectAutoRefUsers(event, arg) {
        var that = this;

        that.refuid = event.value;
        that.refuname = event.label;
    }

    getCompanyRights(puid) {
        var that = this;

        that._compservice.getCompany({ "flag": "usrwise", "uid": puid }).subscribe(data => {
            that.CompanyDetails = data.data;
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
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
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
    }

    getMenuDetails(row) {
        var that = this;

        this._userservice.getMenuDetails({ "flag": "all" }).subscribe(data => {
            row.menudetails = data.data;
            that.selectedCompany = row;
            that.fy = 0;
            $("#menus").prop('checked', false);

            that.getFYDetails(row);
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    getUserRights() {
        var _giverights = [];
        var menuitem = null;

        for (var i = 0; i <= this.selectedCompany.menudetails.length - 1; i++) {
            menuitem = null;
            menuitem = this.selectedCompany.menudetails[i];

            if (menuitem !== null) {
                // _giverights.push({ "menuid": menuitem.menuid, "rights": menuitem.selectedrights });

                var actrights = "";

                $("#M" + menuitem.menuid).find("input[type=checkbox]").each(function () {
                    actrights += (this.checked ? $(this).val() + "," : "");
                });

                if (actrights != "") {
                    _giverights.push({ "menuid": menuitem.menuid, "rights": actrights.slice(0, -1) });
                }
            }
        }

        return _giverights;
    }

    openMoreRights(row) {
        if (this.fy !== 0) {
            this.morerights = true;
            this.menuname = row.mname + " > " + row.pname + " > " + row.menuname;
            this.dialog.getExistsRights();
            this.dialog.getMoreRights();
            this.dialog.editMoreRights(row);
        }
        else {
            this._msg.Show(messageType.error, "Error", "First select Financial Year");
        }
    }

    getMoreUserRights() {
        var that = this;
        var _morerights = [];
        var menuitem = null;

        for (var i = 0; i <= that.selectedCompany.menudetails.length - 1; i++) {
            menuitem = null;
            menuitem = that.selectedCompany.menudetails[i];

            if (menuitem !== null) {
                if (menuitem.ismore === true) {
                    _morerights.push({
                        "menuid": menuitem.menucode, "apar": menuitem.selectedAPARType,
                        "bank": menuitem.selectedBank, "banktype": menuitem.selectedBankType, "cc": menuitem.selectedCC
                    });
                }
            }
        }

        return _morerights;
    }

    saveUserRights() {
        var that = this;

        if (that.uid == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter User");
        }
        else if (that.refuid == "") {
            that._msg.Show(messageType.error, "Error", "Please Enter Reference User");
        }
        else if (that.selectedCompany.length === 0) {
            that._msg.Show(messageType.error, "Error", "Please Select Company");
        }
        else if (that.selectedCompany.menudetails.length === 0) {
            that._msg.Show(messageType.error, "Error", "Please Select Company");
        }
        else if (that.fy == 0) {
            that._msg.Show(messageType.error, "Error", "Please Select Financial Year");
        }
        else {
            var _giverights = that.getUserRights();
            var _morerights = that.getMoreUserRights();

            console.log(_morerights)

            var saveUR = {
                "uid": that.uid,
                "cmpid": that.selectedCompany.cmpid,
                "fy": that.fy,
                "giverights": _giverights,
                "morerights": _morerights,
                "uidcode": that.loginUser.login
            }

            that._userservice.saveUserRights(saveUR).subscribe(data => {
                try {
                    var dataResult = data.data;

                    if (dataResult[0].funsave_userrights.msgid != "-1") {
                        that._msg.Show(messageType.info, "Info", dataResult[0].funsave_userrights.msg);
                        that._router.navigate(['/setting/userrights']);
                        that.fy = 0;
                        $("#menus").prop('checked', false);
                        $(".allcheckboxes input[type=checkbox]").prop('checked', false);
                    }
                    else {
                        that._msg.Show(messageType.info, "Info", dataResult[0].funsave_userrights.msg);
                    }
                }
                catch (e) {
                    that._msg.Show(messageType.error, "Error", e);
                }
            }, err => {
                that._msg.Show(messageType.error, "Error", err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    private selectAndDeselectAllCheckboxes() {
        if (this.fy !== 0) {
            if ($("#menus").is(':checked')) {
                $(".allcheckboxes input[type=checkbox]").prop('checked', true);
            }
            else {
                $(".allcheckboxes input[type=checkbox]").prop('checked', false);
            }
        }
        else {
            $("#menus").prop('checked', false);
            this._msg.Show(messageType.error, "Error", "First select Financial Year");
        }
    }

    private selectAndDeselectMenuWiseCheckboxes(row) {
        if (this.fy !== 0) {
            if ($("#" + row.menuid).is(':checked')) {
                $("#M" + row.menuid + " input[type=checkbox]").prop('checked', true);
            }
            else {
                $("#M" + row.menuid + " input[type=checkbox]").prop('checked', false);
            }
        }
        else {
            $(".allcheckboxes input[type=checkbox]").prop('checked', false);
            this._msg.Show(messageType.error, "Error", "First select Financial Year");
        }
    }

    private clearcheckboxes(): void {
        $(".allcheckboxes input[type=checkbox]").prop('checked', false);
    }

    getUserRightsById(row) {
        var that = this;
        this.clearcheckboxes();

        that._userservice.getUserRights({ "flag": "details", "uid": row.uid, "cmpid": row.cmpid, "fy": that.fy }).subscribe(data => {
            try {
                var viewUR = data.data;

                var _userrights = null;
                var _menuitem = null;
                var _actrights = null;

                if (viewUR[0] != null) {
                    _userrights = null;
                    _userrights = viewUR[0].giverights;

                    if (_userrights != null) {
                        for (var i = 0; i < _userrights.length; i++) {
                            // for (var j = 0; j < row.menudetails.length; j++) {
                            //     _actrights = _userrights[i].rights;
                            //     row.menudetails[j].selectedrights = _actrights;
                            // }

                            _menuitem = null;
                            _menuitem = _userrights[i];

                            if (_menuitem != null) {
                                _actrights = null;
                                _actrights = _menuitem.rights.split(',');

                                if (_actrights != null) {
                                    for (var j = 0; j <= _actrights.length - 1; j++) {
                                        $("#M" + _menuitem.menuid).find("#" + _menuitem.menuid + _actrights[j]).prop('checked', true);
                                    }
                                    $(".allcheckboxes").find("#" + _menuitem.menuid).prop('checked', true);
                                    $("#menus").prop('checked', true);
                                }
                                else {
                                    $(".allcheckboxes").find("#" + _menuitem.menuid).prop('checked', false);
                                    $("#menus").prop('checked', false);
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                that._msg.Show(messageType.error, "Error", e);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
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
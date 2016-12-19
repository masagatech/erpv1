import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for emp */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for fy */
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

    private subscribeParameters: any;

    CompanyDetails: any = [];
    FYDetails: any = [];
    totalRecords: number;

    cmpid: any = 0;
    fyid: number = 0;

    deptid: number = 0;
    uid: any = "";
    uname: any = "";

    refuid: any = "";
    refuname: any = "";

    menuname: any;
    fyname: any;

    selectedCompany: any = [];
    selectedMenu: any = [];
    MenuActions: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _compservice: CompService, private _fyservice: FYService, private _userservice: UserService) {

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
            console.log("Error");
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
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyRights(puid) {
        var that = this;

        that._compservice.getCompany({ "flag": "usrwise", "uid": puid }).subscribe(data => {
            that.CompanyDetails = data.data;
        }, err => {
            console.log("Error");
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
            console.log("Error");
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
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    getUserRights() {
        var GiveRights = [];
        var menuitem = null;

        debugger;

        for (var i = 0; i <= this.selectedCompany.menudetails.length - 1; i++) {
            menuitem = null;
            menuitem = this.selectedCompany.menudetails[i];
            console.log(menuitem);

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
        console.log(giverights);

        var saveUR = {
            "uid": this.uid,
            "cmpid": this.selectedCompany.cmpid,
            "fyid": this.fyid,
            "giverights": giverights,
            "createdby": "1:vivek",
            "updatedby": "1:vivek"
        }

        console.log(saveUR);

        if (this.uid == "") {
            alert("Please Enter User");
        }
        else if (this.fyid == 0) {
            alert("Please Select Financial Year");
        }
        else {
            this._userservice.saveUserRights(saveUR).subscribe(data => {
                var dataResult = data.data;

                if (dataResult[0].funsave_userrights.msgid != "-1") {
                    alert(dataResult[0].funsave_userrights.msg);
                    this._router.navigate(['/setting/viewuserrights']);
                }
                else {
                    alert("Error");
                }
            }, err => {
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    allCheck: boolean = false;

    private selectAndDeselectAllCheckboxes() {
        if (this.allCheck == true) {
            $(".allcheckboxes input[type=checkbox]").prop('checked', false);
        }
        else {
            $(".allcheckboxes input[type=checkbox]").prop('checked', true);
        }
    }

    private selectAndDeselectMenuWiseCheckboxes(row) {
        if (row.IsMenuCheck == true) {
            $("#M" + row.menuid + " input[type=checkbox]").prop('checked', false);
        }
        else {
            $("#M" + row.menuid + " input[type=checkbox]").prop('checked', true);
        }
    }

    private clearcheckboxes(): void {
        $(".allcheckboxes input[type=checkbox]").prop('checked', false);
    }

    getUserRightsById(row) {
        var that = this;
        this.clearcheckboxes();

        that._userservice.getUserRights({ "flag": "details", "uid": row.uid, "cmpid": row.cmpid, "fyid": that.fyid }).subscribe(data => {
            var viewUR = data.data;

            var userrights = null;
            var actrights = null;
            var menuitem = null;

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
                                    //$(".allcheckboxes").find("#" + menuitem.menuid).prop('checked', true);
                                }
                            }
                        }
                    }
                }
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['uid'] !== undefined) {
                this.title = "Edit User Rights";

                this.uid = params['uid'];
                console.log(params['uid']);

                //var row = this.CompanyDetails;
                //this.getUserRightsById(params['uid']);
            }
            else {
                this.title = "Add User Rights";
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveUserRights();
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
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

    CompanyID: any = 0;
    FYID: number = 0;

    DeptID: number = 0;
    UserID: any = "";
    UserName: any = "";

    ReferenceUserID: any = "";
    ReferenceUserName: any = "";

    MenuName: any;
    fyName: any;

    selectedCompany: any = [];
    selectedMenu: any = [];
    MenuActions: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _commonservice: CommonService, private _compservice: CompService, private _fyservice: FYService, private _userservice: UserService) {

    }

    getUserAuto(me: any, type: any) {
        var that = this;

        this._commonservice.getAutoCompleteData({ "Type": "UserWithCode", "Key": this.UserName }).subscribe(data => {
            $(".username").autocomplete({
                source: JSON.parse(data.data),
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.UserID = ui.item.value;
                    me.UserName = ui.item.label;

                    me.ReferenceUserID = ui.item.value;
                    me.ReferenceUserName = ui.item.label;

                    that.getCompanyDetails(ui.item.value);
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getReferenceUserAuto(me: any, type: any) {
        this._commonservice.getAutoCompleteData({ "UserID": this.UserID, "Type": "UserMenuMapp", "Key": this.ReferenceUserName }).subscribe(data => {
            debugger;

            $(".refusername").autocomplete({
                source: JSON.parse(data.data),
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.ReferenceUserID = ui.item.value;
                    me.ReferenceUserName = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyDetails(vuserid) {
        this._commonservice.getMasterOfMaster({ "MasterType": "UsersCompany", "UserID": vuserid }).subscribe(data => {
            this.CompanyDetails = JSON.parse(data.data);
            debugger;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    HideMenu() {
    }

    getMenuRights(rights) {
        return rights.split(',');
    }

    getFYDetails(row) {
        var that = this;

        that._commonservice.getMasterOfMaster({ "MasterType": "UsersFY", "UserID": this.UserID, "CompanyID": row.CompanyID }).subscribe(data => {
            that.FYDetails = JSON.parse(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getMenuDetails(row) {
        var that = this;

        that._userservice.getMenuMaster({ "userid": that.UserID, "companyid": row.CompanyID }).subscribe(data => {
            row.MenuDetails = JSON.parse(data.data);
            that.selectedCompany = row;

            that.getFYDetails(row);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        });
    }

    getUserRights() {
        var GiveRights = "<menus>";
        var menuitem = null;

        for (var i = 0; i <= this.selectedCompany.MenuDetails.length - 1; i++) {
            menuitem = null;
            menuitem = this.selectedCompany.MenuDetails[i];

            if (menuitem !== null) {
                var actrights = "";

                $("#M" + menuitem.menuid).find("input[type=checkbox]").each(function () {
                    actrights += (this.checked ? $(this).val() + "," : "");
                });

                if (actrights != "") {
                    GiveRights += "<menu id=\"" + menuitem.menuid + "\"><rights>" + actrights.slice(0, -1) + "</rights></menu>";
                }
            }
        }

        GiveRights += "</menus>";

        return GiveRights;
    }

    saveUserRights(row) {
        console.log(this.getUserRights());
        debugger;

        var saveUR = {
            "UserID": this.UserID,
            "CompanyID": this.selectedCompany.CompanyID,
            "FYID": this.FYID,
            "GiveRights": this.getUserRights(),
            "CreatedBy": "vivek",
            "UpdatedBy": "vivek"
        }

        console.log(saveUR);

        if (this.UserID == "") {
            alert("Please Enter User");
        }
        else if (this.FYID == 0) {
            alert("Please Select Financial Year");
        }
        else {
            this._userservice.saveUserRights(saveUR).subscribe(data => {
                debugger;
                var dataResult = JSON.parse(data.data);
                console.log(dataResult);

                if (dataResult[0].Doc != "-1") {
                    alert(dataResult[0].Status);
                    this._router.navigate(['/setting/userrights']);
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
        var actrights = null;
        var giverights = null;
        var rights = null;
        this.clearcheckboxes();
        that._userservice.viewUserRights({ "UserID": that.ReferenceUserID, "CompanyID": row.CompanyID, "FYID": that.FYID, "FilterType": "Details" }).subscribe(data => {
            var viewUR = JSON.parse(data.data);
            var menuitem = null;
            for (var i = 0; i <= viewUR.length - 1; i++) {
                menuitem = null;
                menuitem = viewUR[i];
                rights = null;
                rights = menuitem.rights.split(',');
          
                if (rights != null) {
                    for (var j = 0; j <= rights.length - 1; j++) {
                        $("#M" + menuitem.menuid).find("#" + menuitem.menuid + rights[j]).prop('checked', true);
                        //$(".allcheckboxes").find("#" + menuitem.menuid).prop('checked', true);
                    }
                }
            }

            console.log(viewUR);
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
            if (params['UserID'] !== undefined) {
                this.title = "Edit User Rights";

                this.UserID = params['UserID'];
                console.log(params['UserID']);

                //var row = this.CompanyDetails;
                //this.getUserRightsById(params['UserID']);
            }
            else {
                this.title = "Add User Rights";
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            //this.saveUserRights(this.selectedCompany);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}
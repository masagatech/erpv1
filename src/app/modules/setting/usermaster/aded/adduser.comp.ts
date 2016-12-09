import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, Checkbox } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'adduser.comp.html',
    providers: [UserService, CompService]
})

export class AddUser implements OnInit, OnDestroy {
    title: any;
    validSuccess: Boolean = true;

    UserID: any;
    newUserCode: any;
    newFirstName: any;
    newLastName: any;
    newEmailAddress: any;
    newPassword: any;
    newConfirmPassword: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    IsCPwd: string = "N";
    IsVisCPwd: string = 'N';

    private subscribeParameters: any;

    CompanyDetails: any = [];
    viewUserDT: any = [];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _userservice: UserService, private _compservice: CompService) {
        var that = this;

        that.getCompanyDetails();
    }

    getCompanyDetails() {
        var that = this;

        that._compservice.viewCompanyDetails({ "CompanyID": "0" }).subscribe(data => {
            that.CompanyDetails = JSON.parse(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getFYRights(fyrights) {
        return JSON.parse(fyrights);
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

    private selectAndDeselectCompanyWiseCheckboxes(row) {
        debugger;
        if (row.IsCompanyCheck == true) {
            $("#C" + row.CompanyID + " input[type=checkbox]").prop('checked', false);
        }
        else {
            $("#C" + row.CompanyID + " input[type=checkbox]").prop('checked', true);
        }
    }

    IsChangePassword() {
        var that = this;

        if (that.IsCPwd == "N") {
            that.IsCPwd = "Y";
        } else {
            that.IsCPwd = "N";
        }
    }

    isValidSuccess() {
        var that = this;

        if (that.newEmailAddress == undefined) {
            alert("Enter Email Address !!!!");
            return false;
        }

        if (that.IsCPwd === 'Y') {
            if (that.newPassword == undefined) {
                alert("Enter Password !!!!");
                return false;
            }

            if (that.newConfirmPassword == undefined) {
                alert("Enter Confirm Password !!!!");
                return false;
            }

            if (that.newPassword != that.newConfirmPassword) {
                alert("Password and Confirm Password not match !!!!");
                return false;
            }
        }

        return true;
    }

    getUserDetailsById(userId: string) {
        var that = this;

        that._userservice.viewUserDetails({ "UserID": userId, "Flag": "ID" }).subscribe(data => {
            that.viewUserDT = JSON.parse(data.data);

            that.UserID = that.viewUserDT[0].UserID;
            that.newUserCode = that.viewUserDT[0].UserCode;
            that.newFirstName = that.viewUserDT[0].UserFirstName;
            that.newLastName = that.viewUserDT[0].UserLastName;
            that.newEmailAddress = that.viewUserDT[0].EmailID;

            var CompanyRights = JSON.parse(data.Table1);

            var rights = null;
            var companyitem = null;

            for (var i = 0; i <= CompanyRights.length - 1; i++) {
                companyitem = null;
                rights = null;

                companyitem = CompanyRights[i];
                rights = companyitem.rights.split(',');

                if (rights != null) {
                    for (var j = 0; j <= rights.length - 1; j++) {
                        $("#C" + companyitem.companyid).find("#" + companyitem.companyid + rights[j]).prop('checked', true);
                        console.log("abc" + companyitem.companyid + rights[j]);
                        //$(".allcheckboxes").find("#" + menuitem.menuid).prop('checked', true);
                    }
                }
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyRights() {
        var that = this;

        var GiveRights = "<companys>";
        var companyitem = null;

        for (var i = 0; i <= that.CompanyDetails.length - 1; i++) {
            companyitem = null;
            companyitem = that.CompanyDetails[i];

            if (companyitem !== null) {
                var fyrights = "";

                $("#C" + companyitem.CompanyID).find("input[type=checkbox]").each(function () {
                    fyrights += (this.checked ? $(this).val() + "," : "");
                });

                if (fyrights != "") {
                    GiveRights += "<company id=\"" + companyitem.CompanyID + "\"><fyrights>" + fyrights.slice(0, -1) + "</fyrights></company>";
                }
            }
        }

        GiveRights += "</companys>";

        return GiveRights;
    }

    saveUserMaster() {
        var that = this;

        that.validSuccess = that.isValidSuccess();
        console.log(that.validSuccess);

        var saveUser = {
            "UserID": that.UserID,
            "UserCode": that.newUserCode,
            "UserFirstName": that.newFirstName,
            "UserLastName": that.newLastName,
            "EmailID": that.newEmailAddress,
            "Password": that.newPassword,
            "IsCPwd": that.IsCPwd,
            "CompanyRights": that.getCompanyRights()
        }

        if (that.validSuccess) {
            that._userservice.saveUserMaster(saveUser).subscribe(data => {
                var dataResult = JSON.parse(data.data);
                debugger;
                console.log(dataResult);

                if (dataResult[0].Doc == "-1") {
                    alert("Error");
                }
                else if (dataResult[0].Doc == "-2") {
                    alert(dataResult[0].Status);
                    that.newEmailAddress = "";
                }
                else {
                    alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                    that._router.navigate(['/setting/usermaster']);
                }
            }, err => {
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    actionBarEvt(evt) {
        var that = this;

        if (evt === "save") {
            that.saveUserMaster();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');

            that.actionButton.find(a => a.id === "save").hide = false;
            that.actionButton.find(a => a.id === "edit").hide = true;

            that.IsVisCPwd = 'Y';
            that.IsCPwd = 'N';
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnInit() {
        var that = this;

        that.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        that.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        that.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        that.setActionButtons.setActionButtons(that.actionButton);
        that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));

        that.subscribeParameters = that._routeParams.params.subscribe(params => {
            if (params['UserID'] !== undefined) {
                that.actionButton.find(a => a.id === "save").hide = true;
                that.actionButton.find(a => a.id === "edit").hide = false;

                that.UserID = params['UserID'];
                that.getUserDetailsById(that.UserID);

                //$('input').attr('disabled', 'disabled');
                that.IsCPwd = 'N';
                that.IsVisCPwd = 'N';
            }
            else {
                that.actionButton.find(a => a.id === "save").hide = false;
                that.actionButton.find(a => a.id === "edit").hide = true;

                //$('input').removeAttr('disabled');
                that.IsCPwd = 'Y';
                that.IsVisCPwd = 'N';
            }
        });
    }

    ngOnDestroy() {
        var that = this;

        console.log('ngOnDestroy');
        that.actionButton = [];
        that.subscr_actionbarevt.unsubscribe();
        that.subscribeParameters.unsubscribe();
    }
}
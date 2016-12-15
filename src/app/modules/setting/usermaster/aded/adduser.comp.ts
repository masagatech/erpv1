import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for view FY */
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, Checkbox } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'adduser.comp.html',
    providers: [UserService, CompService, FYService]
})

export class AddUser implements OnInit, OnDestroy {
    title: any;
    validSuccess: Boolean = true;
    fydata: any = [];
    uid: any;
    ucode: any;
    firstname: any;
    lastname: any;
    emailid: any;
    pwd: any;
    confpwd: any;
    financialyear: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    iscpwd: string = "N";
    isviscpwd: string = 'N';

    private subscribeParameters: any;

    CompanyDetails: any = [];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _userservice: UserService, private _compservice: CompService, private _fyservice: FYService) {
        var that = this;

        that.getCompanyDetails();
    }

    getCompanyDetails() {
        var that = this;

        that._compservice.getCompany({ "flag": "actwithfy" }).subscribe(data => {
            that.CompanyDetails = data.data[0];
            that.financialyear = data.data[1]
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getFYData(row) {
        var that = this;

        if (row != null) {
            return that.fydata = that.financialyear.filter(a => row.map(function (d) { return parseInt(d['fyid']); }).indexOf(parseInt(a.fyid)) !== -1);
        } else {
            return [];
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

    private selectAndDeselectCompanyWiseCheckboxes(row) {
        debugger;
        if (row.iscmpcheck == true) {
            $("#C" + row.cmpid + " input[type=checkbox]").prop('checked', false);
        }
        else {
            $("#C" + row.cmpid + " input[type=checkbox]").prop('checked', true);
        }
    }

    isChangePwd() {
        var that = this;

        if (that.iscpwd == "N") {
            that.iscpwd = "Y";
        } else {
            that.iscpwd = "N";
        }
    }

    isValidSuccess() {
        var that = this;

        if (that.emailid == undefined) {
            alert("Enter Email Address !!!!");
            return false;
        }

        if (that.iscpwd === 'Y') {
            if (that.pwd == undefined) {
                alert("Enter Password !!!!");
                return false;
            }

            if (that.confpwd == undefined) {
                alert("Enter Confirm Password !!!!");
                return false;
            }

            if (that.pwd != that.confpwd) {
                alert("Password and Confirm Password not match !!!!");
                return false;
            }
        }

        return true;
    }

    getUserDataById(puid: number) {
        var that = this;

        that._userservice.getUsers({ "flag": "id", "uid": puid }).subscribe(data => {
            var UserDT = data.data;

            that.uid = UserDT[0].uid;
            that.ucode = UserDT[0].ucode;
            that.firstname = UserDT[0].firstname;
            that.lastname = UserDT[0].lastname;
            that.emailid = UserDT[0].emailid;

            var cmprights = UserDT[0].companyrights;

            var rights = null;
            var cmpitem = null;

            for (var i = 0; i <= cmprights.length - 1; i++) {
                cmpitem = null;
                cmpitem = cmprights[i];

                $("#C" + cmpitem.cmpid).find("#" + cmpitem.cmpid + cmprights[i]).prop('checked', true);
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getCompanyRights() {
        var that = this;

        var GiveRights = [];
        var companyitem = null;

        for (var i = 0; i <= that.CompanyDetails.length - 1; i++) {
            companyitem = null;
            companyitem = that.CompanyDetails[i];

            if (companyitem !== null) {
                var fyrights = "";

                $("#C" + companyitem.cmpid).find("input[type=checkbox]").each(function () {
                    fyrights += (this.checked ? $(this).val() + "," : "");
                });

                if (fyrights != "") {
                    GiveRights.push({ "cmpid": companyitem.cmpid, "fyid": fyrights.slice(0, -1) });
                }
            }
        }

        return GiveRights;
    }

    saveUserMaster() {
        var that = this;

        that.validSuccess = that.isValidSuccess();
        var cmprights = that.getCompanyRights();
        console.log(cmprights);

        debugger;

        var saveUser = {
            "uid": that.uid,
            "ucode": that.ucode,
            "firstname": that.firstname,
            "lastname": that.lastname,
            "emailid": that.emailid,
            "pwd": that.pwd,
            "iscpwd": that.iscpwd,
            "companyrights": cmprights
        }

        if (that.validSuccess) {
            that._userservice.saveUsers(saveUser).subscribe(data => {
                var dataResult = data.data;
                console.log(dataResult);

                if (dataResult[0].funsave_user.doc == "1") {
                    alert(dataResult[0].funsave_user.msg);
                    that._router.navigate(['/setting/usermaster']);
                }
                else if (dataResult[0].funsave_user.doc == "-1") {
                    alert(dataResult[0].funsave_user.msg);
                    that.emailid = "";
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

    actionBarEvt(evt) {
        var that = this;

        if (evt === "save") {
            that.saveUserMaster();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');

            that.actionButton.find(a => a.id === "save").hide = false;
            that.actionButton.find(a => a.id === "edit").hide = true;

            that.isviscpwd = 'Y';
            that.iscpwd = 'N';
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
            if (params['uid'] !== undefined) {
                that.actionButton.find(a => a.id === "save").hide = true;
                that.actionButton.find(a => a.id === "edit").hide = false;

                that.uid = params['uid'];
                that.getUserDataById(that.uid);

                $('input').attr('disabled', 'disabled');
                that.iscpwd = 'N';
                that.isviscpwd = 'N';
            }
            else {
                that.actionButton.find(a => a.id === "save").hide = false;
                that.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                that.iscpwd = 'Y';
                that.isviscpwd = 'N';
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
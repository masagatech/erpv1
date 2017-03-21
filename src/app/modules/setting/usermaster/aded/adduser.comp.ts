import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service' /* add reference for user */
import { CompService } from '../../../../_service/company/comp-service' /* add reference for company */
import { FYService } from '../../../../_service/fy/fy-service' /* add reference for view FY */
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

declare var $: any;

@Component({
    templateUrl: 'adduser.comp.html',
    providers: [UserService, CompService, FYService]
})

export class AddUser implements OnInit, OnDestroy {
    title: string = "";
    validSuccess: Boolean = true;
    fydata: any = [];
    uid: number = 0;
    ucode: string = "";
    fname: string = "";
    lname: string = "";
    emailid: string = "";
    pwd: string = "";
    confpwd: string = "";
    financialyear: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    iscpwd: string = "N";
    isviscpwd: string = 'N';

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    private subscribeParameters: any;

    CompanyDetails: any = [];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _userservice: UserService, private _compservice: CompService, private _fyservice: FYService, private _msg: MessageService) {
        var that = this;

        that.getCompanyDetails();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    ngOnInit() {
        var that = this;
        that.setActionButtons.setTitle("User Master");

        that.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        that.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        that.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        that.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        that.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));

        that.setActionButtons.setActionButtons(that.actionButton);
        that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));

        that.subscribeParameters = that._routeParams.params.subscribe(params => {
            if (that.isadd) {
                that.actionButton.find(a => a.id === "save").hide = false;
                that.actionButton.find(a => a.id === "edit").hide = true;
                that.actionButton.find(a => a.id === "delete").hide = true;
                that.actionButton.find(a => a.id === "clear").hide = false;

                $('input').prop('disabled', false);
                $('.ucode').prop('disabled', false);
                $(".ucode").focus();
                that.iscpwd = 'Y';
                that.isviscpwd = 'N';
            }
            else if (that.isedit) {
                that.actionButton.find(a => a.id === "save").hide = false;
                that.actionButton.find(a => a.id === "edit").hide = true;
                that.actionButton.find(a => a.id === "delete").hide = false;
                that.actionButton.find(a => a.id === "clear").hide = true;

                setTimeout(function () {
                    that.uid = params['id'];
                    that.getUserDataById(that.uid);
                }, 0);

                $('input').prop('disabled', false);
                $('.ucode').prop('disabled', true);
                $(".fname").focus();
                that.iscpwd = 'N';
                that.isviscpwd = 'N';
            }
            else {
                that.actionButton.find(a => a.id === "save").hide = true;
                that.actionButton.find(a => a.id === "edit").hide = false;
                that.actionButton.find(a => a.id === "delete").hide = false;
                that.actionButton.find(a => a.id === "clear").hide = true;

                setTimeout(function () {
                    that.uid = params['id'];
                    that.getUserDataById(that.uid);
                }, 0);

                $('input').prop('disabled', true);
                $('.ucode').prop('disabled', true);
                that.iscpwd = 'N';
                that.isviscpwd = 'N';
            }
        });
    }

    actionBarEvt(evt) {
        var that = this;

        if (evt === "save") {
            that.saveUserMaster();
        } else if (evt === "edit") {
            that._router.navigate(['/setting/usermaster/edit/', that.uid]);
        } else if (evt === "delete") {
            alert("delete called");
        } else if (evt === "back") {
            that._router.navigate(['/setting/usermaster']);
        } else if (evt === "clear") {
            that.resetUserFields();
        }
    }

    resetUserFields() {
        $(".ucode").focus();
        this.ucode = "";
        this.fname = "";
        this.lname = "";
        this.emailid = "";
        this.pwd = "";
        this.confpwd = "";
    }

    getCompanyDetails() {
        var that = this;

        that._compservice.getCompany({ "flag": "actwithfy" }).subscribe(data => {
            that.CompanyDetails = data.data;
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        })
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

    private clearcheckboxes(): void {
        $(".allcheckboxes input[type=checkbox]").prop('checked', false);
    }

    getUserDataById(puid: number) {
        var that = this;

        that._userservice.getUserDetails({ "flag": "id", "uid": puid }).subscribe(data => {
            var UserDT = data.data;

            that.uid = UserDT[0].uid;
            that.ucode = UserDT[0].ucode;
            that.fname = UserDT[0].fname;
            that.lname = UserDT[0].lname;
            that.emailid = UserDT[0].emailid;

            var cmprights = null;
            var cmpitem = null;
            var fyrights = null;

            if (UserDT[0] != null) {
                cmprights = null;
                cmprights = UserDT[0].cmprights;

                if (cmprights != null) {
                    for (var i = 0; i <= cmprights.length - 1; i++) {
                        cmpitem = null;
                        cmpitem = cmprights[i];

                        if (cmpitem != null) {
                            fyrights = null;
                            fyrights = cmpitem.fy.split(',');

                            if (fyrights != null) {
                                for (var j = 0; j <= fyrights.length - 1; j++) {
                                    $("#C" + cmpitem.cmpid).find("#" + cmpitem.cmpid + fyrights[j]).prop('checked', true);
                                }
                                $(".allcheckboxes").find("#" + cmpitem.cmpid).prop('checked', true);
                                $("#selectall").prop('checked', true);
                            }
                            else {
                                $(".allcheckboxes").find("#" + cmpitem.cmpid).prop('checked', true);
                                $("#selectall").prop('checked', false);
                            }
                        }
                    }
                }
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
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
                    GiveRights.push({ "cmpid": companyitem.cmpid, "fy": fyrights.slice(0, -1) });
                }
            }
        }

        return GiveRights;
    }

    saveUserMaster() {
        var that = this;

        if (that.ucode === "") {
            this._msg.Show(messageType.error, "Error", "Enter User Code");
            $(".ucode").focus();
            return;
        }

        if (that.fname === "") {
            this._msg.Show(messageType.error, "Error", "Enter First Name");
            $(".fname").focus();
            return;
        }

        if (that.lname === "") {
            this._msg.Show(messageType.error, "Error", "Enter Last Name");
            $(".lname").focus();
            return;
        }

        if (that.emailid === "") {
            this._msg.Show(messageType.error, "Error", "Enter Email Address");
            $(".emailid").focus();
            return;
        }

        if (that.iscpwd === 'Y') {
            if (that.pwd === "") {
                this._msg.Show(messageType.error, "Error", "Enter Password");
                $(".pwd").focus();
                return;
            }

            if (that.confpwd === "") {
                this._msg.Show(messageType.error, "Error", "Enter Confirm Password");
                $(".cpwd").focus();
                return;
            }

            if (that.pwd !== that.confpwd) {
                this._msg.Show(messageType.error, "Error", "Password and Confirm Password not match");
                $(".cpwd").focus();
                return;
            }
        }

        var cmprights = that.getCompanyRights();

        var saveUser = {
            "uid": that.uid,
            "ucode": that.ucode,
            "fname": that.fname,
            "lname": that.lname,
            "emailid": that.emailid,
            "pwd": that.pwd,
            "iscpwd": that.iscpwd,
            "cmprights": cmprights
        }

        that._userservice.saveUser(saveUser).subscribe(data => {
            var dataResult = data.data;
            console.log(dataResult);

            if (dataResult[0].funsave_user.msgid == "1") {
                this._msg.Show(messageType.success, "Success", dataResult[0].funsave_user.msg);
                that._router.navigate(['/setting/usermaster']);
            }
            else if (dataResult[0].funsave_user.msgid == "-1") {
                this._msg.Show(messageType.error, "Error", dataResult[0].funsave_user.msg);
                that.emailid = "";
            }
            else {
                this._msg.Show(messageType.error, "Error", dataResult[0].funsave_user.msg);
            }
        }, err => {
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    ngOnDestroy() {
        var that = this;

        that.setActionButtons.setTitle("");
        that.actionButton = [];
        that.subscr_actionbarevt.unsubscribe();
        that.subscribeParameters.unsubscribe();
    }
}
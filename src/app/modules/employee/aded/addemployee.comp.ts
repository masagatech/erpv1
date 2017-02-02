import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { EmpService } from '../../../_service/employee/emp-service' /* add reference for add employee */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { DynamicFieldsService } from '../../../_service/dynamicfields/dynfields-service' /* add reference for dynamic fields */
import { ActionAccess } from '../../../_service/actionaccess-service' /* add reference for action button */
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { AddrbookComp } from "../../usercontrol/addressbook/adrbook.comp";
import { DynamicTabModule } from "../../usercontrol/dynamictab";
import { AddDynamicTabComp } from "../../usercontrol/adddynamictab";

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addemployee.comp.html',
    providers: [EmpService, CommonService, DynamicFieldsService, ActionAccess]
})

export class EmployeeAddEdit implements OnInit, OnDestroy {
    title: any;
    loginUser: LoginUserModel;

    empid: number = 0;
    uid: number = 0;
    uname: string = "";
    firstname: string = "";
    lastname: string = "";
    emailid: string = "";
    dob: string = "";
    gender: string = "";
    maritalstatus: string = "";
    bloodgroup: string = "";
    familybg: string = "";
    healthdtls: string = "";

    // mobileno: string = "";
    // altmobileno: string = "";
    // altemailid: string = "";
    // country: string = "";
    // state: string = "";
    // city: string = "";
    // pincode: string = "";
    // addressline1: string = "";
    // addressline2: string = "";

    companyname: string = "";
    companyemail: string = "";
    deptid: number = 0;
    desigid: number = 0;
    salary: any = "";
    salarymode: string = "";
    noticedays: number = 0;
    doj: string = "";
    aboutus: string = "";

    pctrlcenterid: number = 0;
    sctrlcenterid: number = 0;
    sctrlcentername: string = "";

    module: string = "";
    attachfile: string = "";
    uploadedFiles: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    // dropdown
    genderDT: any[];
    maritalstatusDT: any[];
    bloodgroupDT: any[];
    countryDT: any[];
    departmentDT: any[];
    designationDT: any[];
    salarymodeDT: any[];
    ctrlcenterDT: any[];

    DuplicateCtrlCenter: boolean = false;

    // tab panel
    @ViewChild('tabpanel')
    tabpanel: AddDynamicTabComp;
    tabListDT: any = [];
    selectedtab: any = [];
    isedittab: boolean = false;
    atttype: string = "";

    ctrlcenterList: any = [];

    @ViewChild('addrbook')
    addressBook: AddrbookComp;
    adrbookid: any = [];
    adrid: number = 0;
    adrcsvid: any = "";
    accode: string = "";

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    // Page Pre Render

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _empservice: EmpService, private _actaccsservice: ActionAccess, private _userservice: UserService,
        private _dynfldserive: DynamicFieldsService, private _commonservice: CommonService, private _msg: MessageService) {
        this.module = "Employee";
        this.loginUser = this._userservice.getUser();

        this.fillDropDownList();
        this.fillCtrlCenterDDL();

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // Page Load

    ngOnInit() {
        this.atttype = "Employee Attribute";
        this.setActionRights();
        this.setEmployeeFields();
    }

    // add, edit, delete button

    actionBarEvt(evt) {
        var that = this;

        if (evt === "back") {
            that._router.navigate(['employee/view']);
        }
        else if (evt === "save") {
            var validateme = commonfun.validate();

            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }

            that.saveEmployeeData();
        } else if (evt === "edit") {
            that._router.navigate(['employee/edit/', that.empid]);

        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    // Set Action Rights

    setActionRights() {
        var that = this;

        that._userservice.getMenuDetails({
            "flag": "actrights", "ptype": "emp", "mtype": "emp", "uid": that.loginUser.uid,
            "cmpid": that.loginUser.cmpid, "fyid": that.loginUser.fyid
        }).subscribe(data => {
            var data = data.data.filter(a => a.dispfor === "add");

            if (data.length === 0) {
                return;
            }
            else {
                that.subscribeParameters = that._routeParams.params.subscribe(params => {
                    for (var i = 0; i < data.length; i++) {
                        var id = data[i].actnm;
                        var code = data[i].actcd;
                        var text = data[i].dispnm;
                        var icon = data[i].acticon;

                        that.actionButton.push(new ActionBtnProp(id, text, icon, true, false));

                        that.setActionButtons.setActionButtons(that.actionButton);
                    }

                    if (that.isadd) {
                        that.title = "Add Employee";
                        //$('div *').prop('disabled', false);

                        $('button').prop('disabled', false);
                        $('input').prop('disabled', false);
                        $('select').prop('disabled', false);
                        $('textarea').prop('disabled', false);

                        $('#uname').prop('disabled', false);
                        this.actionButton.find(a => a.id === "save").hide = false;
                        this.actionButton.find(a => a.id === "edit").hide = true;
                    }
                    else if (that.isedit) {
                        that.title = "Edit Employee";
                        //$('div *').prop('disabled', false);

                        $('button').prop('disabled', false);
                        $('input').prop('disabled', false);
                        $('select').prop('disabled', false);
                        $('textarea').prop('disabled', false);

                        $('#uname').prop('disabled', true);
                        this.actionButton.find(a => a.id === "save").hide = false;
                        this.actionButton.find(a => a.id === "edit").hide = true;
                    }
                    else {
                        that.title = "Details of Employee";
                        //$('div *').prop('disabled', true);

                        $('button').prop('disabled', true);
                        $('input').prop('disabled', true);
                        $('select').prop('disabled', true);
                        $('textarea').prop('disabled', true);

                        this.actionButton.find(a => a.id === "save").hide = true;
                        this.actionButton.find(a => a.id === "edit").hide = false;
                    }
                });
            }

            that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
        });
    }

    // Tab Panel

    openTabPopup() {
        this.tabpanel.openTabPopup();
    }

    editTabPopup(tab) {
        this.tabpanel.editTabPopup(tab);
    }

    DeleteTabs(tab) {
        this.tabpanel.DeleteTabs(tab);
    }

    // Get Employee Auto Complete

    getUserAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "userwithcode", "search": that.uname }).subscribe(data => {
            $(".username").autocomplete({
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
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // Fill Gender, MaritalStatus, BloodGroup, Country, Department, Designation, SalaryMode Drop Down

    fillDropDownList() {
        this._empservice.getEmployee({ "flag": "dropdown" }).subscribe(data => {
            var d = data.data;

            // BIND Gender TO DROPDOWN
            this.genderDT = d.filter(a => a.group === "gender");

            // BIND MaritalStatus TO DROPDOWN
            this.maritalstatusDT = d.filter(a => a.group === "marital");

            // BIND Blood Group TO DROPDOWN
            this.bloodgroupDT = d.filter(a => a.group === "bldgrp");

            // BIND Country TO DROPDOWN
            this.countryDT = d.filter(a => a.group === "country");

            // BIND Department TO DROPDOWN
            this.departmentDT = d.filter(a => a.group === "dept");

            // BIND Designation TO DROPDOWN
            this.designationDT = d.filter(a => a.group === "desig");

            // BIND Salary Mode TO DROPDOWN
            this.salarymodeDT = d.filter(a => a.group === "salarymode");
        }, err => {
            console.log(err);
        }, () => {
            console.log("Complete");
        })
    }

    // Get Control Center Drop Down

    fillCtrlCenterDDL() {
        this._commonservice.getAutoData({ "type": "ctrlddl", "cmpid": this.loginUser.cmpid }).subscribe(data => {
            this.ctrlcenterDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    // Get Control Center Auto Complete

    getCtrlCenterAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "ctrl", "search": that.sctrlcentername }).subscribe(data => {
            $(".ctrlcentername").autocomplete({
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
                    me.sctrlcenterid = ui.item.value;
                    me.sctrlcentername = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    //Add Control Center

    addNewCtrlCenter() {
        var that = this;

        if (that.sctrlcentername == "") {
            that._msg.Show(messageType.info, "info", "Please enter control name");
            $(".ctrl").focus()
            return;
        }

        that.DuplicateCtrlCenter = true;
        for (var i = 0; i < that.ctrlcenterList.length; i++) {
            if (that.ctrlcenterList[i].ctrlcentername == that.sctrlcentername) {
                that.DuplicateCtrlCenter = false;
                break;
            }
        }
        if (that.DuplicateCtrlCenter == true) {
            that.ctrlcenterList.push({
                "ctrlcenterid": that.sctrlcenterid,
                "ctrlcentername": that.sctrlcentername
            });

            that.sctrlcenterid = 0;
            that.sctrlcentername = "";
            $(".ctrlcentername").focus();

        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate Control Center");
            that.sctrlcentername = "";
            $(".ctrlcentername").focus();
            return;
        }
    }

    deleteCtrlCenter(row) {
        // row.isactive = false;
        // var evdt = this.expensevoucherDT;
        // evdt.filter(a => a.isactive === true);

        this.ctrlcenterList.splice(this.ctrlcenterList.indexOf(row), 1);
    }

    // Upload Photo

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        this.attachfile = e.files[0].path;
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    // Save Employee

    saveEmployeeData() {
        var primarycc: any = [];
        var secondarycc: any = [];
        var allcc: any = [];
        var that = this;

        primarycc.push({ "id": that.pctrlcenterid });

        for (var i = 0; i < that.ctrlcenterList.length; i++) {
            secondarycc.push({ "id": that.ctrlcenterList[i].ctrlcenterid });
        }

        allcc.push({ "primarycc": primarycc }, { "secondarycc": secondarycc });

        var saveEmp = {
            "empid": that.empid,
            "uid": that.uid,

            // personal
            "dob": that.dob,
            "gender": that.gender,
            "maritalstatus": that.maritalstatus,
            "bloodgroup": that.bloodgroup,
            "familybg": that.familybg,
            "healthdtls": that.healthdtls,
            "attachfile": that.attachfile,
            "address": that.adrbookid,

            // contact
            // "mobileno": that.mobileno,
            // "altmobileno": that.altmobileno,
            // "altemailid": that.altemailid,
            // "country": that.country,
            // "state": that.state,
            // "city": that.city,
            // "pincode": that.pincode,
            // "addressline1": that.addressline1,
            // "addressline2": that.addressline2,

            // job profile
            "companyname": that.companyname,
            "companyemail": that.companyemail,
            "deptid": that.deptid,
            "desigid": that.desigid,
            "salary": this.salary,
            "salarymode": that.salarymode,
            "noticedays": that.noticedays,
            "doj": that.doj,

            // about me
            "aboutus": that.aboutus,

            // control center
            "ctrlcenter": allcc,
            "uidcode": that.loginUser.login,
            "dynamicfields": that.tabListDT
        }

        this._empservice.saveEmployee(saveEmp).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_employee.msgid != "-1") {
                var msg = dataResult[0].funsave_employee.msg;
                var parentid = dataResult[0].funsave_employee.keyid;

                this._msg.Show(messageType.success, "Success", msg);
                this._router.navigate(['/employee/view']);
            }
            else {
                var msg = dataResult[0].funsave_employee.msg;
                this._msg.Show(messageType.error, "Error", msg);
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    // Get Employee

    setEmployeeFields() {
        var that = this;

        setTimeout(function () {
            commonfun.addrequire();

            var date = new Date();
            var today = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);

            $(".dob").datepicker({
                dateFormat: "dd/mm/yy",
                autoclose: true,
                setDate: new Date()
            });

            $(".doj").datepicker({
                dateFormat: "dd/mm/yy",
                autoclose: true,
                setDate: new Date()
            });

            that.subscribeParameters = that._routeParams.params.subscribe(params => {
                if (params['empid'] === undefined) {
                    $(".dob").datepicker('setDate', today);
                    $(".doj").datepicker('setDate', today);
                }
            });
        }, 0);

        that.subscribeParameters = that._routeParams.params.subscribe(params => {
            if (params['empid'] !== undefined) {
                that.title = "Add Employee";
                that.empid = params['empid'];

                that._empservice.getEmployee({ "flag": "id", "empid": that.empid }).subscribe(data => {
                    var EmpDetails = data.data[0]._empdata;
                    var SecondayCC = data.data[0]._secondarycc === null ? [] : data.data[0]._secondarycc;
                    var dynFields = data.data[0]._dynfields === null ? [] : data.data[0]._dynfields;

                    that.empid = EmpDetails[0].empid;
                    that.uid = EmpDetails[0].uid;
                    that.uname = EmpDetails[0].uname;
                    that.dob = EmpDetails[0].dob;
                    that.gender = EmpDetails[0].gender;
                    that.maritalstatus = EmpDetails[0].maritalstatus;
                    that.bloodgroup = EmpDetails[0].bloodgroup;
                    that.familybg = EmpDetails[0].familybg;
                    that.healthdtls = EmpDetails[0].healthdtls;

                    // that.attachfile = EmpDetails[0].attachfile === null ? "" : EmpDetails[0].attachfile;
                    // that.uploadedFiles = EmpDetails[0].attachfile === null ? "" : EmpDetails[0].attachfile;

                    // that.mobileno = EmpDetails[0].mobileno;
                    // that.altmobileno = EmpDetails[0].altmobileno;
                    // that.altemailid = EmpDetails[0].altemailid;
                    // that.country = EmpDetails[0].country;
                    // that.state = EmpDetails[0].state;
                    // that.city = EmpDetails[0].city;
                    // that.pincode = EmpDetails[0].pincode;
                    // that.addressline1 = EmpDetails[0].addressline1;
                    // that.addressline2 = EmpDetails[0].addressline2;

                    that.adrcsvid = "";
                    var addressdt = EmpDetails[0].address === null ? [] : EmpDetails[0].address;

                    for (let items of addressdt) {
                        that.adrcsvid += items.adrid + ',';
                    }

                    that.addressBook.getAddress(that.adrcsvid.slice(0, -1));

                    that.aboutus = EmpDetails[0].aboutus;
                    that.companyname = EmpDetails[0].companyname;
                    that.deptid = EmpDetails[0].deptid;
                    that.desigid = EmpDetails[0].desigid;
                    that.salary = EmpDetails[0].salary;
                    that.salarymode = EmpDetails[0].salarymode;
                    that.companyemail = EmpDetails[0].companyemail;
                    that.noticedays = EmpDetails[0].noticedays;
                    that.doj = EmpDetails[0].doj;
                    that.pctrlcenterid = EmpDetails[0].pctrlid;
                    that.ctrlcenterList = SecondayCC;
                    that.tabListDT = dynFields;
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                });
            }
            else {
                $('input').attr('value', '');
                $('select').attr('value', '');
                $('textarea').attr('value', '');

                $('button').removeAttr('disabled');
                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    // Destroy

    ngOnDestroy() {
        this.actionButton = [];

        if (this.subscr_actionbarevt !== undefined) {
            this.subscr_actionbarevt.unsubscribe();
        }

        this.subscribeParameters.unsubscribe();
    }
}
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
import { CalendarComp } from '../../usercontrol/calendar';
import { AttributeComp } from "../../usercontrol/attribute/attr.comp";

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
    fname: string = "";
    lname: string = "";
    emailid: string = "";

    @ViewChild("dob")
    dob: CalendarComp;

    gender: string = "";
    maritalstatus: string = "";
    bldgrp: string = "";
    familybg: string = "";
    healthdtls: string = "";

    cmpname: string = "";
    cmpemail: string = "";
    deptid: number = 0;
    desigid: number = 0;
    salary: any = "";
    salarymode: string = "";
    noticedays: number = 0;

    @ViewChild("doj")
    doj: CalendarComp;

    aboutus: string = "";

    pccid: number = 0;
    sccid: number = 0;
    sccname: string = "";

    @ViewChild('attribute')
    attribute: AttributeComp;

    module: string = "";
    attachfile: string = "";
    uploadedFiles: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    // dropdown
    genderDT: any[];
    maritalstatusDT: any[];
    bldgrpDT: any[];
    countryDT: any[];
    departmentDT: any[];
    designationDT: any[];
    salarymodeDT: any[];
    ctrlcenterDT: any[];
    warehouseDT: any = [];

    warehouse: any = 0;
    DuplicateCtrlCenter: boolean = false;

    // tab panel
    @ViewChild('tabpanel')
    tabpanel: AddDynamicTabComp;
    tabListDT: any = [];
    selectedtab: any = [];
    isedittab: boolean = false;
    atttype: string = "";

    cclist: any = [];

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
        this.atttype = "Employee Attribute";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // Page Load

    setDOB() {
        this.dob.initialize(this.loginUser);

        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.dob.setMinMaxDate("", today);
    }

    setDOJ() {
        this.doj.initialize(this.loginUser);

        var date = new Date();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        this.doj.setMinMaxDate("", today);
    }

    ngOnInit() {
        this.setDOB();
        this.setDOJ();

        this.setActionRights();
        this.setEmployeeFields();

        this.atttype = "Employee Attribute";
        this.attribute.attrparam = ["empinfo_attr"];
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
            "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy
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
                        this.setActionButtons.setTitle("Add Employee");
                        $('button').prop('disabled', false);
                        $('input').prop('disabled', false);
                        $('select').prop('disabled', false);
                        $('textarea').prop('disabled', false);

                        $('#uname').prop('disabled', false);
                        this.actionButton.find(a => a.id === "save").hide = false;
                        this.actionButton.find(a => a.id === "edit").hide = true;
                    }
                    else if (that.isedit) {
                        this.setActionButtons.setTitle("Edit Employee");
                        $('button').prop('disabled', false);
                        $('input').prop('disabled', false);
                        $('select').prop('disabled', false);
                        $('textarea').prop('disabled', false);

                        $('#uname').prop('disabled', true);
                        this.actionButton.find(a => a.id === "save").hide = false;
                        this.actionButton.find(a => a.id === "edit").hide = true;
                    }
                    else {
                        this.setActionButtons.setTitle("Details of Employee");
                        $('button').prop('disabled', true);
                        $('input').prop('disabled', true);
                        $('select').prop('disabled', true);
                        $('textarea').prop('disabled', true);

                        $('#uname').prop('disabled', true);
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

        that._commonservice.getAutoData({ "type": "userwithcode", "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy, "search": that.uname }).subscribe(data => {
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

    // Fill Gender, MaritalStatus, bldgrp, Country, Department, Designation, SalaryMode Drop Down

    fillDropDownList() {
        this._empservice.getEmployee({ "flag": "dropdown", "cmpid": this.loginUser.cmpid }).subscribe(data => {
            var d = data.data;

            // BIND Gender TO DROPDOWN
            this.genderDT = d.filter(a => a.group === "gender");

            // BIND MaritalStatus TO DROPDOWN
            this.maritalstatusDT = d.filter(a => a.group === "marital");

            // BIND Blood Group TO DROPDOWN
            this.bldgrpDT = d.filter(a => a.group === "bldgrp");

            // BIND Country TO DROPDOWN
            this.countryDT = d.filter(a => a.group === "country");

            // BIND Department TO DROPDOWN
            this.departmentDT = d.filter(a => a.group === "dept");

            // BIND Designation TO DROPDOWN
            this.designationDT = d.filter(a => a.group === "desig");

            // BIND Salary Mode TO DROPDOWN
            this.salarymodeDT = d.filter(a => a.group === "salarymode");

            // BIND Salary Mode TO DROPDOWN
            this.warehouseDT = d.filter(a => a.group === "warehouse");
        }, err => {
            console.log(err);
        }, () => {
            console.log("Complete");
        })
    }

    // Get Control Center Drop Down

    fillCtrlCenterDDL() {
        this._commonservice.getAutoData({ "type": "ccddl", "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy }).subscribe(data => {
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

        that._commonservice.getAutoData({ "type": "ccauto", "search": that.sccname, "cmpid": that.loginUser.cmpid, "fy": that.loginUser.fy }).subscribe(data => {
            $(".ccname").autocomplete({
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
                    me.sccid = ui.item.value;
                    me.sccname = ui.item.label;
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

        if (that.sccname == "") {
            that._msg.Show(messageType.info, "info", "Please enter control name");
            $(".ctrl").focus()
            return;
        }

        that.DuplicateCtrlCenter = true;
        for (var i = 0; i < that.cclist.length; i++) {
            if (that.cclist[i].ccname == that.sccname) {
                that.DuplicateCtrlCenter = false;
                break;
            }
        }
        if (that.DuplicateCtrlCenter == true) {
            that.cclist.push({
                "ccid": that.sccid,
                "ccname": that.sccname
            });

            that.sccid = 0;
            that.sccname = "";
            $(".ccname").focus();

        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate Control Center");
            that.sccname = "";
            $(".ccname").focus();
            return;
        }
    }

    deleteCtrlCenter(row) {
        // row.isactive = false;
        // var evdt = this.expensevoucherDT;
        // evdt.filter(a => a.isactive === true);

        this.cclist.splice(this.cclist.indexOf(row), 1);
    }

    // attributes

    attrTab() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 0);
    }

    setAttributes() {
        var attrid = [];

        if (this.attribute.attrlist.length > 0) {
            for (let items of this.attribute.attrlist) {
                attrid.push({ "id": items.value });
            }

            return attrid;
        }
    }

    // warehouse

    setWarehouse() {
        var warehouseid = [];

        for (let wh of this.warehouseDT) {
            if (wh.Warechk == true) {
                warehouseid.push({ "id": wh.key });
            }
        }

        return warehouseid;
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

        if (that.adrbookid.length === 0) {
            that._msg.Show(messageType.info, "Info", "Please select atleast one Contact Details");
            return;
        }

        if (that.cclist.length === 0) {
            that._msg.Show(messageType.info, "Info", "Please select atleast one Control Center");
            return;
        }

        primarycc.push({ "id": that.pccid });

        for (var i = 0; i < that.cclist.length; i++) {
            secondarycc.push({ "id": that.cclist[i].ccid });
        }

        allcc.push({ "primarycc": primarycc }, { "secondarycc": secondarycc });

        var saveEmp = {
            "empid": that.empid,
            "uid": that.uid,

            // personal
            "dob": that.dob.getDate(),
            "gender": that.gender,
            "maritalstatus": that.maritalstatus,
            "bldgrp": that.bldgrp,
            "familybg": that.familybg,
            "healthdtls": that.healthdtls,
            "attachfile": that.attachfile,
            "address": that.adrbookid,

            // job profile
            "cmpname": that.cmpname,
            "cmpemail": that.cmpemail,
            "deptid": that.deptid,
            "desigid": that.desigid,
            "salary": that.salary,
            "salarymode": that.salarymode,
            "noticedays": that.noticedays,
            "doj": that.doj.getDate(),

            // about me
            "aboutus": that.aboutus,

            // control center
            "cc": allcc,
            "uidcode": that.loginUser.login,
            "dynamicfields": that.tabListDT,
            "attributes": that.setAttributes(),
            "warehouse": that.setWarehouse()
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

        var date = new Date();
        var defaultDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        that.subscribeParameters = that._routeParams.params.subscribe(params => {
            if (params['empid'] !== undefined) {
                that.title = "Add Employee";
                that.empid = params['empid'];

                that._empservice.getEmployee({ "flag": "id", "empid": that.empid }).subscribe(data => {
                    var EmpDetails = data.data[0]._empdata;
                    var SecondayCC = data.data[0]._secondarycc === null ? [] : data.data[0]._secondarycc;
                    var dynFields = data.data[0]._dynfields === null ? [] : data.data[0]._dynfields;
                    var attrfields = data.data[0]._attributejson === null ? [] : data.data[0]._attributejson;

                    that.empid = EmpDetails[0].empid;
                    that.uid = EmpDetails[0].uid;
                    that.uname = EmpDetails[0].uname;
                    var dob = new Date(EmpDetails[0].dob);
                    that.dob.setDate(dob);
                    that.gender = EmpDetails[0].gender;
                    that.maritalstatus = EmpDetails[0].maritalstatus;
                    that.bldgrp = EmpDetails[0].bldgrp;
                    that.familybg = EmpDetails[0].familybg;
                    that.healthdtls = EmpDetails[0].healthdtls;

                    that.adrcsvid = "";
                    var addressdt = EmpDetails[0].address === null ? [] : EmpDetails[0].address;

                    for (let items of addressdt) {
                        that.adrcsvid += items.adrid + ',';
                    }

                    that.addressBook.getAddress(that.adrcsvid.slice(0, -1));

                    that.aboutus = EmpDetails[0].aboutus;
                    that.cmpname = EmpDetails[0].cmpname;
                    that.deptid = EmpDetails[0].deptid;
                    that.desigid = EmpDetails[0].desigid;
                    that.salary = EmpDetails[0].salary;
                    that.salarymode = EmpDetails[0].salarymode;
                    that.cmpemail = EmpDetails[0].cmpemail;
                    that.noticedays = EmpDetails[0].noticedays;
                    var doj = new Date(EmpDetails[0].doj);
                    that.doj.setDate(doj);
                    that.pccid = EmpDetails[0].pctrlid;
                    that.cclist = SecondayCC;
                    that.attribute.attrlist = attrfields;

                    if (that.warehouseDT.length > 0) {
                        var wareedit = EmpDetails[0].warehouse;

                        for (var j = 0; j <= wareedit.length - 1; j++) {
                            var chk = that.warehouseDT.find(a => a.key === wareedit[j].id);
                            chk.Warechk = true;
                        }
                    }

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
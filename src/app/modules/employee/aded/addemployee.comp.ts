import { Component, OnInit, OnDestroy } from '@angular/core';
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

declare var $: any;

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
    mobileno: string = "";
    altmobileno: string = "";
    altemailid: string = "";
    country: string = "";
    state: string = "";
    city: string = "";
    pincode: string = "";
    addressline1: string = "";
    addressline2: string = "";
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

    genderDT: any[];
    maritalstatusDT: any[];
    bloodgroupDT: any[];
    countryDT: any[];
    departmentDT: any[];
    designationDT: any[];
    salarymodeDT: any[];
    ctrlcenterDT: any[];

    DuplicateCtrlCenter: boolean = false;

    ctrlcenterList: any = [];
    tabListDT: any = [];
    selectedtab: any = [];
    isedittab: boolean = false;

    fldname: string = "";
    keyid: number = 0;
    key: string = "";
    value: string = "";
    DuplicateFlag: boolean = false;

    // Page Pre Render

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _empservice: EmpService, private _actaccsservice: ActionAccess, private _userService: UserService,
        private _dynfldserive: DynamicFieldsService, private _commonservice: CommonService, private _msg: MessageService) {
        this.module = "Employee";
        this.loginUser = this._userService.getUser();

        this.fillDropDownList("Gender");
        this.fillDropDownList("MaritalStatus");
        this.fillDropDownList("BloodGroup");
        this.fillDropDownList("Country");
        this.fillDropDownList("Department");
        this.fillDropDownList("Designation");
        this.fillDropDownList("SalaryMode");
        this.fillCtrlCenterDDL();
    }

    // Page Load

    ngOnInit() {
        var that = this;

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['empid'] !== undefined) {
                this.title = "Add Employee";

                // this._actaccsservice.setActionButton('emp', ["edit", "delete", "view"], function (actionButton: any) {
                //     that.actionButton = actionButton;
                //     that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
                // });

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.empid = params['empid'];
                this.getEmpDataById(this.empid);

                $('button').attr('disabled', 'disabled');
                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Edit Employee";

                // this._actaccsservice.setActionButton('emp', ["delete", "view"], function (actionButton: any) {
                //     that.actionButton = actionButton;
                //     that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
                // });

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                this.clearEmployeeFields();

                $('button').removeAttr('disabled');
                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');

                setTimeout(function () {
                    var date = new Date();
                    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);

                    // Doc Date 

                    $(".dob").datepicker({
                        dateFormat: "dd/mm/yy",
                        autoclose: true,
                        setDate: new Date()
                    });

                    $(".dob").datepicker('setDate', today);
                }, 0);
            }
        });
    }

    // add, edit, delete button

    actionBarEvt(evt) {
        var that = this;

        if (evt === "view") {
            that._router.navigate(['employee/viewemployee']);
        }
        else if (evt === "save") {
            that.saveEmployeeData();
        } else if (evt === "edit") {
            $('button').removeAttr('disabled');
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            $('#uname').attr('disabled', 'disabled');

            // that._actaccsservice.setActionButton('emp', ["delete", "view"], function (actionButton: any) {
            //     that.actionButton = actionButton;
            //     that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
            // });

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
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

    fillDropDownList(group) {
        this._commonservice.getMOM({ "group": group }).subscribe(data => {
            var d = data.data;

            if (group == "Gender") {
                // BIND Gender TO DROPDOWN
                this.genderDT = d;
            }
            else if (group == "MaritalStatus") {
                // BIND MaritalStatus TO DROPDOWN
                this.maritalstatusDT = d;
            }
            else if (group == "BloodGroup") {
                // BIND Blood Group TO DROPDOWN
                this.bloodgroupDT = d;
            }
            else if (group == "Country") {
                // BIND Country TO DROPDOWN
                this.countryDT = d;
            }
            else if (group == "Department") {
                // BIND Department TO DROPDOWN
                this.departmentDT = d;
            }
            else if (group == "Designation") {
                // BIND Designation TO DROPDOWN
                this.designationDT = d;
            }
            else if (group == "SalaryMode") {
                // BIND Salary Mode TO DROPDOWN
                this.salarymodeDT = d;
            }
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    // Get Control Center Drop Down

    fillCtrlCenterDDL() {
        this._commonservice.getAutoData({ "type": "ctrlddl" }).subscribe(data => {
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

    //Reset Employee Fields

    clearEmployeeFields() {
        $('input').attr('value', '');
        $('select').attr('value', '');
        $('textarea').attr('value', '');
    }

    // onUploadStart(e) {
    //     this.actionButton.find(a => a.id === "save").enabled = false;
    // }

    // onUploadComplete(e) {
    //     this.attachfile = e.files[0].path;
    //     this.actionButton.find(a => a.id === "save").enabled = true;
    // }

    // Add Dynamic Tab

    openTabPopup() {
        setTimeout(function () {
            $(".tabname").focus();
        }, 500);
    }

    addNewTabs() {
        var fldcode = this.fldname.replace(" ", "").replace("&", "").replace("/", "");
        this.tabListDT.push({ "autoid": 0, "fldcode": fldcode, "fldname": this.fldname, "keyvaluedt": [] });
        this.fldname = "";
        $('#myModal').modal('hide');
        this.isedittab = false;
    }

    EditTabs(tab) {
        this.selectedtab = tab;
        this.fldname = tab.fldname;
        this.isedittab = true;
    }

    UpdateTabs() {
        var fldcode = this.fldname.replace(" ", "").replace("&", "").replace("/", "");
        this.selectedtab.key = fldcode;
        this.selectedtab.fldname = this.fldname;
        $('#myModal').modal('hide');
        this.isedittab = false;
        this.fldname = "";
    }

    ClearTabs() {
        this.fldname = "";
        this.isedittab = false;
    }

    DeleteTabs(tab, row) {
        tab.keyvaluedt.splice(tab.keyvaluedt.indexOf(row), 1);
        $(".key").focus();
    }

    // Add Key and Value for Dynamic Tab

    getKeyAuto(tab) {
        var that = this;

        that._commonservice.getAutoData({ "type": "attribute", "search": tab.key, "filter": "Employee Attribute" }).subscribe(data => {
            $(".key").autocomplete({
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
                    tab.keyid = ui.item.value;
                    tab.key = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    AddNewKeyVal(tab) {
        var that = this;

        if (tab.key === "") {
            that._msg.Show(messageType.info, "info", "Please enter key");
            $(".key").focus();
        }
        else if (tab.value === "") {
            that._msg.Show(messageType.info, "info", "Please enter value");
            $(".val").focus();
        }
        else {
            that.DuplicateFlag = true;

            for (var i = 0; i < tab.keyvaluedt.length; i++) {
                if (tab.keyvaluedt[i].key === tab.key && tab.keyvaluedt[i].value === tab.value) {
                    that.DuplicateFlag = false;
                }
            }

            if (that.DuplicateFlag === true) {
                tab.keyvaluedt.push({
                    'key': tab.key,
                    'value': tab.value
                });

                tab.key = "";
                tab.value = "";
                $(".key").focus();
            }
            else {
                that._msg.Show(messageType.info, "info", "Duplicate key and value");
                $(".key").focus();
                return;
            }
        }

        tab.isedit = false;
    }

    EditKeyVal(tab, row) {
        tab.selectedrow = row;
        tab.key = row.key;
        tab.value = row.value;
        tab.isedit = true;
    }

    UpdateKeyVal(tab) {
        tab.selectedrow.key = tab.key;
        tab.selectedrow.value = tab.value;
        tab.isedit = false;
        this.ClearKeyVal(tab);
    }

    ClearKeyVal(tab) {
        tab.key = "";
        tab.value = "";
        tab.isedit = false;
    }

    DeleteKeyVal(tab, row) {
        tab.keyvaluedt.splice(tab.keyvaluedt.indexOf(row), 1);
        $(".key").focus();
    }

    // Save Dynamic Fields

    saveDynamicFields(parentid) {
        var that = this;

        for (var i = 0; i < that.tabListDT.length; i++) {
            var saveDynFlds = {
                "autoid": that.tabListDT[i].autoid,
                "fldcode": that.tabListDT[i].fldcode,
                "fldname": that.tabListDT[i].fldname,
                "fldvalue": that.tabListDT[i].keyvaluedt === null ? "" : that.tabListDT[i].keyvaluedt,
                "module": "Employee",
                "parentid": parentid,
                "cmpid": that.loginUser.cmpid,
                "fyid": that.loginUser.fyid,
                "uidcode": that.loginUser.login
            }

            that._dynfldserive.saveDynamicFields(saveDynFlds).subscribe(data => {
                var dataResult = data.data;
            }, err => {
                console.log(err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    // Get Dynamic Fields

    getDynamicFields(pempid: number) {
        var that = this;

        that._dynfldserive.getDynamicFields({
            "module": "Employee", "parentid": pempid,
            "cmpid": that.loginUser.cmpid, "fyid": that.loginUser.fyid
        }).subscribe(data => {
            that.tabListDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    // Save Employee

    saveEmployeeData() {
        var primarycc: any = [];
        var secondarycc: any = [];
        var allcc: any = [];

        primarycc.push({ "id": this.pctrlcenterid });

        for (var i = 0; i < this.ctrlcenterList.length; i++) {
            secondarycc.push({ "id": this.ctrlcenterList[i].ctrlcenterid });
        }

        allcc.push({ "primarycc": primarycc }, { "secondarycc": secondarycc });

        var saveEmp = {
            "empid": this.empid,
            "uid": this.uid,
            "dob": this.dob,
            "gender": this.gender,
            "maritalstatus": this.maritalstatus,
            "bloodgroup": this.bloodgroup,
            "familybg": this.familybg,
            "healthdtls": this.healthdtls,
            "attachfile": this.attachfile,
            "mobileno": this.mobileno,
            "altmobileno": this.altmobileno,
            "altemailid": this.altemailid,
            "country": this.country,
            "state": this.state,
            "city": this.city,
            "pincode": this.pincode,
            "addressline1": this.addressline1,
            "addressline2": this.addressline2,
            "companyname": this.companyname,
            "companyemail": this.companyemail,
            "deptid": this.deptid,
            "desigid": this.desigid,
            "salary": this.salary,
            "salarymode": this.salarymode,
            "noticedays": this.noticedays,
            "doj": this.doj,
            "aboutus": this.aboutus,
            "ctrlcenter": allcc,
            "uidcode": this.loginUser.login
        }

        console.log(saveEmp);

        this._empservice.saveEmployee(saveEmp).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_employee.msgid != "-1") {
                var msg = dataResult[0].funsave_employee.msg;
                var parentid = dataResult[0].funsave_employee.keyid;

                this.saveDynamicFields(parentid);
                this._msg.Show(messageType.success, "Success", msg);

                this._router.navigate(['/employee/viewemployee']);
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

    getEmpDataById(pempid: number) {
        this._empservice.getEmployee({ "flag": "id", "empid": pempid }).subscribe(data => {
            var EmpDetails = data.data[0]._empdata;
            var SecondayCC = data.data[0]._secondarycc === null ? [] : data.data[0]._secondarycc;

            this.empid = EmpDetails[0].empid;
            this.uid = EmpDetails[0].uid;
            this.uname = EmpDetails[0].uname;
            this.dob = EmpDetails[0].dob;
            this.gender = EmpDetails[0].gender;
            this.maritalstatus = EmpDetails[0].maritalstatus;
            this.bloodgroup = EmpDetails[0].bloodgroup;
            this.familybg = EmpDetails[0].familybg;
            this.healthdtls = EmpDetails[0].healthdtls;
            //this.attachfile = EmpDetails[0].attachfile === null ? "" : EmpDetails[0].attachfile;
            //this.uploadedFiles = EmpDetails[0].attachfile === null ? "" : EmpDetails[0].attachfile;
            this.mobileno = EmpDetails[0].mobileno;
            this.altmobileno = EmpDetails[0].altmobileno;
            this.altemailid = EmpDetails[0].altemailid;
            this.country = EmpDetails[0].country;
            this.state = EmpDetails[0].state;
            this.city = EmpDetails[0].city;
            this.pincode = EmpDetails[0].pincode;
            this.addressline1 = EmpDetails[0].addressline1;
            this.addressline2 = EmpDetails[0].addressline2;
            this.aboutus = EmpDetails[0].aboutus;
            this.companyname = EmpDetails[0].companyname;
            this.deptid = EmpDetails[0].deptid;
            this.desigid = EmpDetails[0].desigid;
            this.salary = EmpDetails[0].salary;
            this.salarymode = EmpDetails[0].salarymode;
            this.companyemail = EmpDetails[0].companyemail;
            this.noticedays = EmpDetails[0].noticedays;
            this.doj = EmpDetails[0].doj;
            this.pctrlcenterid = EmpDetails[0].pctrlid;
            this.ctrlcenterList = SecondayCC;

            this.getDynamicFields(pempid);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        this.actionButton = [];

        if (this.subscr_actionbarevt !== undefined) {
            this.subscr_actionbarevt.unsubscribe();
        }

        this.subscribeParameters.unsubscribe();
    }
}
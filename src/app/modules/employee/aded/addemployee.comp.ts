import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { EmpService } from '../../../_service/employee/emp-service' /* add reference for add employee */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { DynamicFieldsService } from '../../../_service/dynamicfields/dynfields-service' /* add reference for master of master */
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

    ctrlcenterList: any = [];
    tabListDT: any = [];

    DuplicateCtrlCenter: boolean = false;

    fldname: string = "";
    key: any = "";
    value: any = "";
    DuplicateFlag: boolean = false;
    keyValueList: any = [];

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

        this.getDynamicFields();
    }

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

    fillCtrlCenterDDL() {
        this._commonservice.getAutoData({ "type": "ctrlddl" }).subscribe(data => {
            this.ctrlcenterDT = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

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

    //Add New Controll Center
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
            if (dataResult[0].funsave_employee.doc != "-1") {
                var msg = dataResult[0].funsave_employee.msg;
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
            this.ctrlcenterList = SecondayCC; //EmpDetails[0].ctrlcenter === null ? [] : EmpDetails[0].ctrlcenterdt;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    addNewTabs() {
        this.tabListDT.push({ "fldcode": this.fldname, "fldname": this.fldname });

        // for (var i = 0; i < this.tabListDT.length; i++) {
        //     $('<li><a href="#' + this.tabListDT[0].fldcode + '" data-toggle="tab">' + this.tabListDT[0].fldname + '</a></li>').appendTo('#tabs');
        //     //$('<div class="tab-pane" id="' + that.tabListDT[i].fldcode + '"></div>').appendTo('.tab-content');
        // }

        $('#tabs a:last').tab('show');
        this.fldname = "";
        $('#myModal').modal('hide');
    }

    getDynamicFields() {
        var that = this;

        that._dynfldserive.getDynamicFields({ "module": "Employee", "cmpid": that.loginUser.cmpid, "fyid": that.loginUser.fyid }).subscribe(data => {
            that.tabListDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    saveDynamicFields() {
        var that = this;

        var saveDynFlds = {
            "autoid": 0,
            "fldname": that.fldname,
            "fldvalue": that.keyValueList === null ? "" : that.keyValueList,
            "module": "Employee",
            "cmpid": that.loginUser.cmpid,
            "fyid": that.loginUser.fyid,
            "uidcode": that.loginUser.login
        }

        that._dynfldserive.saveDynamicFields(saveDynFlds).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_dynamicfields.msgid != "-1") {
                var msg = dataResult[0].funsave_dynamicfields.msg;
                that._msg.Show(messageType.success, "Success", msg);
            }
            else {
                var msg = dataResult[0].funsave_dynamicfields.msg;
                that._msg.Show(messageType.error, "Error", msg);
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    DeleteKeyVal(row) {
        var index = -1;
        for (var i = 0; i < this.keyValueList.length; i++) {
            if (this.keyValueList[i].key === row.key) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }

        this.keyValueList.splice(index, 1);
        $(".key").focus();
    }

    AddNewKeyVal() {
        var that = this;

        if (that.key == "") {
            that._msg.Show(messageType.info, "info", "Please enter key");
            $(".key").focus()
            return;
        }
        if (that.value == "") {
            that._msg.Show(messageType.info, "info", "Please enter value");
            $(".val").focus()
            return;
        }

        that.DuplicateFlag = true;

        for (var i = 0; i < that.keyValueList.length; i++) {
            if (that.keyValueList[i].key == that.key && that.keyValueList[i].value == that.value) {
                that.DuplicateFlag = false;
                break;
            }
        }

        if (that.DuplicateFlag == true) {
            that.keyValueList.push({
                'key': that.key,
                'value': that.value
            });

            that.key = "";
            that.value = "";
            $(".key").focus();
        }
        else {
            that._msg.Show(messageType.info, "info", "Duplicate key and value");
            $(".key").focus();
            return;
        }
    }

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
            }
        });
    }

    actionBarEvt(evt) {
        var that = this;

        if (evt === "view") {
            that._router.navigate(['employee/viewemployee']);
        }
        else if (evt === "save") {
            that.saveEmployeeData();
            that.saveDynamicFields();
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

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];

        if (this.subscr_actionbarevt !== undefined) {
            this.subscr_actionbarevt.unsubscribe();
        }

        this.subscribeParameters.unsubscribe();
    }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { EmpService } from '../../../_service/employee/emp-service' /* add reference for add employee */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, messageType } from '../../../_service/messages/message-service';

declare var $: any;

@Component({
    templateUrl: 'addemployee.comp.html',
    providers: [EmpService, CommonService]
})

export class EmployeeAddEdit implements OnInit, OnDestroy {
    title: any;

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

    attachfile: string = "";
    module: string = "";

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

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _empservice: EmpService, private _commonservice: CommonService, private _msg: MessageService) {
        this.module = "Employee";

        this.fillDropDownList("Gender");
        this.fillDropDownList("MaritalStatus");
        this.fillDropDownList("BloodGroup");
        this.fillDropDownList("Country");
        this.fillDropDownList("Department");
        this.fillDropDownList("Designation");
        this.fillDropDownList("SalaryMode");
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

    clearEmployeeFields() {
        $('input').attr('value', '');
        $('select').attr('value', '');
        $('textarea').attr('value', '');
    }

    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    onUploadComplete(e) {
        this.attachfile = e.files[0].path;
        this.actionButton.find(a => a.id === "save").enabled = true;
    }

    saveEmployeeData() {
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
            "uidcode": "1:vivek"
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
                this._msg.Show(messageType.error, "Error", msg);;
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    getEmpDataById(pempid: number) {
        this._empservice.getEmployee({ "flag": "id", "empid": pempid }).subscribe(data => {
            var EmpDetails = data.data;

            this.empid = EmpDetails[0].empid;
            this.uid = EmpDetails[0].uid;
            this.uname = EmpDetails[0].uname;
            this.dob = EmpDetails[0].dob;
            this.gender = EmpDetails[0].gender;
            this.maritalstatus = EmpDetails[0].maritalstatus;
            this.bloodgroup = EmpDetails[0].bloodgroup;
            this.familybg = EmpDetails[0].familybg;
            this.healthdtls = EmpDetails[0].healthdtls;
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
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.title = "Add Employee";
        console.log('ngOnInit');

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['empid'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.empid = params['empid'];
                this.getEmpDataById(this.empid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                this.clearEmployeeFields();

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveEmployeeData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            $('#uname').attr('disabled', 'disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
    }
}
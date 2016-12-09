import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { EmpService } from '../../../_service/employee/emp-service' /* add reference for view employee */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'addemployee.comp.html',
    providers: [EmpService, CommonService]
})

export class EmployeeAddEdit implements OnInit, OnDestroy {
    title: any;

    EmpID: any;
    UserID: any;
    Salutation: any;
    FirstName: any;
    LastName: any;
    EmailAddress: any;
    DateOfBirth: any;
    Gender: any;
    MaritalStatus: any;
    BloodGroup: any;
    FamilyBackground: any;
    HealthDetails: any;
    MobileNo: any;
    AltMobileNo: any;
    AltEmailAddress: any;
    Country: any;
    Zone: any;
    State: any;
    City: any;
    PinCode: any;
    PermanentAddress: any;
    CurrentAddress: any;
    Branch: any;
    Department: any;
    Designation: any;
    SalaryMode: any;
    CompanyEmailAddress: any;
    NoticeDays: any;
    JoiningDate: any;
    AboutUs: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    //MasterDDL: any[];

    GenderDT: any[];
    MaritalStatusDT: any[];
    BloodGroupDT: any[];
    DepartmentDT: any[];
    DesignationDT: any[];
    SalaryModeDT: any[];

    viewEmpDetails: any[];

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService, private _empservice: EmpService, private _commonservice: CommonService) {
        this._commonservice.getMasterOfMaster({ "MasterType": "Employee" }).subscribe(data => {
            var d = JSON.parse(data.data);

            // BIND Gender TO DROPDOWN
            this.GenderDT = d.filter(a => a.Group === "Gender");
            this.Gender = this.GenderDT[0].ID; // SET DEFAULT Gender VALUE

            // BIND MaritalStatus TO DROPDOWN
            this.MaritalStatusDT = d.filter(a => a.Group === "MaritalStatus");
            this.MaritalStatus = this.MaritalStatusDT[0].ID; // SET DEFAULT MaritalStatus VALUE

            // BIND BloodGroup TO DROPDOWN
            this.BloodGroupDT = d.filter(a => a.Group === "BloodGroup");
            this.BloodGroup = this.BloodGroupDT[0].ID; // SET DEFAULT BloodGroup VALUE

            // BIND Department TO DROPDOWN
            this.DepartmentDT = d.filter(a => a.Group === "Department");
            this.Department = this.DepartmentDT[0].ID; // SET DEFAULT Department VALUE

            // BIND Designation TO DROPDOWN
            this.DesignationDT = d.filter(a => a.Group === "Designation");
            this.Designation = this.DesignationDT[0].ID; // SET DEFAULT Department VALUE

            // BIND SalaryMode TO DROPDOWN
            this.SalaryModeDT = d.filter(a => a.Group === "SalaryMode");
            this.SalaryMode = this.SalaryModeDT[0].ID; // SET DEFAULT SalaryMode VALUE
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

    ngOnInit() {
        this.title = "Add Employee";
        console.log('ngOnInit');

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['UserID'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.UserID = params['UserID'];
                this.getEmpDataById(this.UserID);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    getEmpDataById(userId: string) {
        this._empservice.viewEmployeeDetails({ "FilterType": "Details", "UserID": userId, "SearchTxt": "" }).subscribe(data => {
            this.viewEmpDetails = JSON.parse(data.data);

            console.log(this.UserID);
            console.log("abc");
            console.log(this.viewEmpDetails);

            this.EmpID = this.viewEmpDetails[0].EmpID;
            this.DateOfBirth = this.viewEmpDetails[0].DateOfBirth;
            this.Gender = this.viewEmpDetails[0].GenderID;
            this.MaritalStatus = this.viewEmpDetails[0].MaritalStatus;
            this.BloodGroup = this.viewEmpDetails[0].BloodGroup;
            this.FamilyBackground = this.viewEmpDetails[0].FamilyBackground;
            this.HealthDetails = this.viewEmpDetails[0].HealthDetails;
            this.MobileNo = this.viewEmpDetails[0].MobileNo;
            this.AltMobileNo = this.viewEmpDetails[0].AlternateMobileNo;
            this.AltEmailAddress = this.viewEmpDetails[0].AlternateEmailID;
            this.Country = this.viewEmpDetails[0].Country;
            this.Zone = this.viewEmpDetails[0].Zone;
            this.State = this.viewEmpDetails[0].State;
            this.City = this.viewEmpDetails[0].City;
            this.PinCode = this.viewEmpDetails[0].PinCode;
            this.PermanentAddress = this.viewEmpDetails[0].PermanentAddress;
            this.CurrentAddress = this.viewEmpDetails[0].CurrentAddress;
            this.AboutUs = this.viewEmpDetails[0].AboutUs;
            this.Branch = this.viewEmpDetails[0].Branch;
            this.Department = this.viewEmpDetails[0].DeptID;
            this.Designation = this.viewEmpDetails[0].DesignationID;
            this.SalaryMode = this.viewEmpDetails[0].SalaryMode;
            this.CompanyEmailAddress = this.viewEmpDetails[0].CompanyEmail;
            this.NoticeDays = this.viewEmpDetails[0].NoticeDays;
            this.JoiningDate = this.viewEmpDetails[0].JoiningDate;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveEmployeeData() {
        var saveEmp = {
            "EmpID": this.EmpID,
            "DateOfBirth": this.DateOfBirth,
            "Gender": this.Gender,
            "MaritalStatus": this.MaritalStatus,
            "BloodGroup": this.BloodGroup,
            "FamilyBackground": this.FamilyBackground,
            "HealthDetails": this.HealthDetails,
            "MobileNo": this.MobileNo,
            "AlternateMobileNo": this.AltMobileNo,
            "AlternateEmailID": this.AltEmailAddress,
            "Country": this.Country,
            "Zone": this.Zone,
            "State": this.State,
            "City": this.City,
            "PinCode": this.PinCode,
            "PermanentAddress": this.PermanentAddress,
            "CurrentAddress": this.CurrentAddress,
            "AboutUs": this.AboutUs,
            "Branch": this.Branch,
            "DeptID": this.Department,
            "DesignationID": this.Designation,
            "SalaryMode": this.SalaryMode,
            "CompanyEmail": this.CompanyEmailAddress,
            "NoticeDays": this.NoticeDays,
            "JoiningDate": this.JoiningDate,
            "CreatedBy": "vivek",
            "UpdatedBy": "vivek",
            "PreviousExperienceDetails": ""
        }

        this._empservice.saveEmployeeDetails(saveEmp).subscribe(data => {
            var dataResult = JSON.parse(data.data);
            console.log(dataResult);

            if (dataResult[0].Doc != "-1") {
                alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                this._router.navigate(['/employee/viewemployee']);
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

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveEmployeeData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

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
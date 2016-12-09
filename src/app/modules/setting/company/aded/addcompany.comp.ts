import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CompService } from '../../../../_service/company/comp-service'; /* add reference for company view */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for master of master */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'addcompany.comp.html',
    providers: [CompService, CommonService]
})

export class CompanyAddEdit implements OnInit, OnDestroy {
    title: any;

    CompanyID: any;
    CompanyCode: any;
    CompanyName: any;
    CompanyDesc: any;
    Remarks: any;
    Industries: any;
    OrganisationType: any;
    CompanyLogo: any;

    ContactPerson: any;
    Designation: any;
    MobileNo: any;
    AltMobileNo: any;
    EmailAddress: any;
    AltEmailAddress: any;
    Country: any;
    Zone: any;
    State: any;
    City: any;
    PinCode: any;
    Address: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    IndustriesDT: any[] = [];
    DesignationDT: any[] = [];
    OrganisationTypeDT: any[] = [];
    CountryDT: any[] = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _compservice: CompService, private _commonservice: CommonService) {
        this.fillDropDownList();
    }

    public fileChangeEvent(fileInput: any) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e: any) {
                $('.imgFilePath').attr('src', e.target.result);
            }

            reader.readAsDataURL(fileInput.target.files[0]);
            this.CompanyLogo = fileInput.target.files[0].name;

            console.log(fileInput.target.files[0]);
        }
    }

    onChange(event) {
        var files = event.srcElement.files;
        console.log(files);
        this.CompanyLogo = files[0].name;
        $('.imgFilePath').attr('src', files.name);
    }

    fillDropDownList() {
        this._commonservice.getMasterOfMaster({ "MasterType": "Company" }).subscribe(data => {
            var d = JSON.parse(data.data);

            // BIND Industries TO DROPDOWN
            this.IndustriesDT = d.filter(a => a.Group === "Industries");
            this.Industries = this.IndustriesDT[0].ID; // SET DEFAULT Industries VALUE

            // BIND Designation TO DROPDOWN
            this.DesignationDT = d.filter(a => a.Group === "Designation");
            this.Designation = this.DesignationDT[0].ID; // SET DEFAULT Designation VALUE

            // BIND OrganisationType TO DROPDOWN
            this.OrganisationTypeDT = d.filter(a => a.Group === "OrganisationType");
            this.OrganisationType = this.OrganisationTypeDT[0].ID; // SET DEFAULT OrganisationType VALUE

            // BIND Country TO DROPDOWN
            this.CountryDT = d.filter(a => a.Group === "Country");
            this.Country = this.CountryDT[0].ID; // SET DEFAULT Country VALUE
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['CompanyID'] !== undefined) {
                this.title = "Edit Company Details";

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.CompanyID = params['CompanyID'];
                this.getCompanyDetailsById(this.CompanyID);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Add Company Details";

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    getCompanyDetailsById(dCompanyID: any) {
        this._compservice.viewCompanyDetails({ "CompanyID": dCompanyID, "SearchTxt": "" }).subscribe(data => {
            var viewCompanyDetails = JSON.parse(data.data);

            console.log(viewCompanyDetails);

            this.CompanyID = viewCompanyDetails[0].CompanyID;
            this.CompanyCode = viewCompanyDetails[0].CompanyCode;
            this.CompanyName = viewCompanyDetails[0].CompanyName;
            this.CompanyDesc = viewCompanyDetails[0].CompanyDesc;
            this.Remarks = viewCompanyDetails[0].Remarks;
            this.OrganisationType = viewCompanyDetails[0].TypeOfOrganisation;
            this.Industries = viewCompanyDetails[0].Industries;
            this.CompanyLogo = viewCompanyDetails[0].CompanyLogo;

            this.ContactPerson = viewCompanyDetails[0].ContactPerson;
            this.Designation = viewCompanyDetails[0].Designation;
            this.EmailAddress = viewCompanyDetails[0].EmailID;
            this.AltEmailAddress = viewCompanyDetails[0].AlternateEmailID;
            this.MobileNo = viewCompanyDetails[0].MobileNo;
            this.AltMobileNo = viewCompanyDetails[0].AlternateMobileNo;
            this.Address = viewCompanyDetails[0].Address;
            this.Country = viewCompanyDetails[0].Country;
            this.State = viewCompanyDetails[0].State;
            this.City = viewCompanyDetails[0].City;
            this.PinCode = viewCompanyDetails[0].PinCode;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveCompanyData() {
        var saveCompany = {
            "CompanyID": this.CompanyID,
            "CompanyCode": this.CompanyCode,
            "CompanyName": this.CompanyName,
            "CompanyDesc": this.CompanyDesc,
            "Remarks": this.Remarks,
            "Industries": this.Industries,
            "TypeOfOrganisation": this.OrganisationType,
            "CompanyLogo": this.CompanyLogo,

            "ContactPerson": this.ContactPerson,
            "Designation": this.Designation,
            "EmailID": this.EmailAddress,
            "AlternateEmailID": this.AltEmailAddress,
            "MobileNo": this.MobileNo,
            "AlternateMobileNo": this.AltMobileNo,
            "Address": this.Address,
            "Country": this.Country,
            "State": this.State,
            "City": this.City,
            "PinCode": this.PinCode,
            "CreatedBy": "vivek",
            "UpdatedBy": "vivek"
        }

        this._compservice.saveCompanyDetails(saveCompany).subscribe(data => {
            var dataResult = JSON.parse(data.data);
            console.log(dataResult);

            if (dataResult[0].Doc != "-1") {
                alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                this._router.navigate(['/setting/company']);
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
            this.saveCompanyData();
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
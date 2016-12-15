import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CompService } from '../../../../_service/company/comp-service'; /* add reference for cmp view */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for master of master */
import { Router, ActivatedRoute } from '@angular/router';
import { FileUpload, Growl, Message } from 'primeng/primeng';

declare var $: any;

@Component({
    templateUrl: 'addCompany.comp.html',
    providers: [CompService, CommonService]
})

export class CompanyAddEdit implements OnInit, OnDestroy {
    title: any = "";

    cmpid: number = 0;
    cmpcode: string = "";
    cmpname: string = "";
    cmpdesc: string = "";
    cmplogo: string = "";
    cmptype: string = "";
    industries: string = "";
    remarks: string = "";

    contactperson: string = "";
    desigid: number = 0;
    mobileno: string = "";
    altmobileno: string = "";
    emailid: string = "";
    altemailid: string = "";
    country: string = "";
    state: string = "";
    city: string = "";
    pincode: string = "";
    addressline1: string = "";
    addressline2: string = "";
    
    msgs: Message[];
    uploadedFiles: any[] = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    industriesDT: any = [];
    desigDT: any = [];
    cmptypeDT: any = [];
    countryDT: any = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _compservice: CompService, private _commonservice: CommonService) {
        this.fillDropDownList("Industries");
        this.fillDropDownList("Designation");
        this.fillDropDownList("CompanyType");
        this.fillDropDownList("Country");
    }

    onUpload(event) {
        for(let file of event.files) {
            this.uploadedFiles.push(file);
        }
    
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'File Uploaded', detail: ''});
    }

    fillDropDownList(flag) {
        this._commonservice.getMOM({ "group": flag }).subscribe(data => {
            var d = data.data;

            if (flag == "Industries") {
                // BIND Industries TO DROPDOWN
                this.industriesDT = d;
            }
            else if (flag == "Designation") {
                // BIND Designation TO DROPDOWN
                this.desigDT = d;
            }
            else if (flag == "CompanyType") {
                // BIND Company Type TO DROPDOWN
                this.cmptypeDT = d;
            }
            else if (flag == "Country") {
                // BIND Country TO DROPDOWN
                this.countryDT = d;
            }
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
            if (params['cmpid'] !== undefined) {
                this.title = "Edit Company Details";

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.cmpid = params['cmpid'];
                this.getCompanyById(this.cmpid);

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

    getCompanyById(pcmpid: any) {
        this._compservice.getCompany({ "flag": "id", "cmpid": pcmpid }).subscribe(data => {
            var company = data.data;

            console.log(company);

            this.cmpid = company[0].cmpid;
            this.cmpcode = company[0].cmpcode;
            this.cmpname = company[0].cmpname;
            this.cmpdesc = company[0].cmpdesc;
            this.remarks = company[0].remarks;
            this.cmptype = company[0].cmptype;
            this.industries = company[0].industries;
            this.cmplogo = company[0].cmplogo;

            this.contactperson = company[0].contactperson;
            this.desigid = company[0].desigid;
            this.emailid = company[0].emailid;
            this.altemailid = company[0].altemailid;
            this.mobileno = company[0].mobileno;
            this.altmobileno = company[0].altmobileno;
            this.addressline1 = company[0].addressline1;
            this.addressline2 = company[0].addressline2;
            this.country = company[0].country;
            this.state = company[0].state;
            this.city = company[0].city;
            this.pincode = company[0].pincode;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveCompanyData() {
        var savecmp = {
            "cmpid": this.cmpid,
            "cmpcode": this.cmpcode,
            "cmpname": this.cmpname,
            "cmpdesc": this.cmpdesc,
            "remarks": this.remarks,
            "industries": this.industries,
            "cmptype": this.cmptype,
            "cmplogo": this.cmplogo,

            "contactperson": this.contactperson,
            "desigid": this.desigid,
            "emailid": this.emailid,
            "altemailid": this.altemailid,
            "mobileno": this.mobileno,
            "altmobileno": this.altmobileno,
            "addressline1": this.addressline1,
            "addressline2": this.addressline2,
            "state": this.state,
            "city": this.city,
            "pincode": this.pincode,
            "createdby": "1",
            "updatedby": "1"
        }

        this._compservice.saveCompany(savecmp).subscribe(data => {
            var dataResult = data.data;
            console.log(dataResult);

            if (dataResult[0].funsave_company.msgid != "-1") {
                alert(dataResult[0].funsave_company.msg);
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
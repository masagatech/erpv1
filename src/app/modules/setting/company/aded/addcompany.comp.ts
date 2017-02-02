import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CompService } from '../../../../_service/company/comp-service'; /* add reference for cmp view */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for master of master */
import { DynamicFieldsService } from '../../../../_service/dynamicfields/dynfields-service' /* add reference for dynamic fields */
import { Router, ActivatedRoute } from '@angular/router';
import { FileUpload, Growl, Message } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { DynamicTabModule } from "../../../usercontrol/dynamictab";
import { AddDynamicTabComp } from "../../../usercontrol/adddynamictab";

declare var $: any;

@Component({
    templateUrl: 'addCompany.comp.html',
    providers: [CompService, CommonService, DynamicFieldsService]
})

export class AddCompany implements OnInit, OnDestroy {
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
    isactive: boolean = false;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    industriesDT: any = [];
    desigDT: any = [];
    cmptypeDT: any = [];
    countryDT: any = [];

    // tab panel
    @ViewChild('tabpanel')
    tabpanel: AddDynamicTabComp;
    tabListDT: any = [];
    selectedtab: any = [];
    isedittab: boolean = false;
    atttype: string = "";

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    // Page Pre Render

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _compservice: CompService, private _userService: UserService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();

        this.fillDropDownList();
        this.atttype = "Company Attribute";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // Page Load

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.title = "Edit Company Details";

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.cmpid = params['id'];
                this.getCompanyById(this.cmpid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Add Company Details";

                setTimeout(function () {
                    $("#cmpcode").focus();
                }, 0);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    // add, edit, delete button

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveCompanyData();
        } else if (evt === "edit") {
            setTimeout(function () {
                $("#cmpcode").focus();
            }, 0);

            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    // Fill Industries, Designation, CompanyType, Country Drop Down

    fillDropDownList() {
        this._compservice.getCompany({ "flag": "dropdown" }).subscribe(data => {
            var d = data.data;

            // BIND Industries TO DROPDOWN
            this.industriesDT = d.filter(a => a.group === "industries");

            // BIND Designation TO DROPDOWN
            this.desigDT = d.filter(a => a.group === "desig");

            // BIND Company Type TO DROPDOWN
            this.cmptypeDT = d.filter(a => a.group === "cmptype");

            // BIND Country TO DROPDOWN
            this.countryDT = d.filter(a => a.group === "country");
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
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

    // Save Company

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
            "country": this.country,
            "state": this.state,
            "city": this.city,
            "pincode": this.pincode,
            "uidcode": this.loginUser.login,
            "isactive": this.isactive,
            "dynamicfields": this.tabListDT
        }

        this._compservice.saveCompany(savecmp).subscribe(data => {
            var dataResult = data.data;
            console.log(dataResult);

            if (dataResult[0].funsave_company.msgid != "-1") {
                var msg = dataResult[0].funsave_company.msg;
                var parentid = dataResult[0].funsave_company.keyid;

                this._msg.Show(messageType.success, "Success", msg);
                this._router.navigate(['/setting/company']);
            }
            else {
                this._msg.Show(messageType.error, "Error", msg);
            }
        }, err => {
            console.log(err);
            this._msg.Show(messageType.error, "Error", err);
        }, () => {
            // console.log("Complete");
        });
    }

    // Get Company

    getCompanyById(pcmpid: any) {
        this._compservice.getCompany({ "flag": "id", "cmpid": pcmpid }).subscribe(data => {
            var company = data.data[0]._cmpdata;
            var dynFields = data.data[0]._dynfields === null ? [] : data.data[0]._dynfields;

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
            this.isactive = company[0].isactive;
            this.tabListDT = dynFields;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
    }
}
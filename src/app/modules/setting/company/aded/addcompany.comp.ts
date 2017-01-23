import { Component, OnInit, OnDestroy } from '@angular/core';
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

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    industriesDT: any = [];
    desigDT: any = [];
    cmptypeDT: any = [];
    countryDT: any = [];

    tabListDT: any = [];
    selectedtab: any = [];
    isedittab: boolean = false;

    fldname: string = "";
    keyid: number = 0;
    key: string = "";
    value: string = "";
    DuplicateFlag: boolean = false;

    // Page Pre Render

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _compservice: CompService, private _userService: UserService, private _dynfldserive: DynamicFieldsService,
        private _commonservice: CommonService, private _msg: MessageService) {
        this.loginUser = this._userService.getUser();

        this.fillDropDownList("Industries");
        this.fillDropDownList("Designation");
        this.fillDropDownList("CompanyType");
        this.fillDropDownList("Country");
    }

    // Page Load

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

    // add, edit, delete button

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

    // Fill Industries, Designation, CompanyType, Country Drop Down

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

        that._commonservice.getAutoData({ "type": "attribute", "search": tab.key, "filter": "Company Attribute" }).subscribe(data => {
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
                "module": "Company",
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

    getDynamicFields(pcmpid: number) {
        var that = this;

        that._dynfldserive.getDynamicFields({
            "module": "Company", "parentid": pcmpid,
            "cmpid": that.loginUser.cmpid, "fyid": that.loginUser.fyid
        }).subscribe(data => {
            that.tabListDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
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
            "state": this.state,
            "city": this.city,
            "pincode": this.pincode,
            "uidcode": this.loginUser.login
        }

        this._compservice.saveCompany(savecmp).subscribe(data => {
            var dataResult = data.data;
            console.log(dataResult);

            if (dataResult[0].funsave_company.msgid != "-1") {
                var msg = dataResult[0].funsave_company.msg;
                var parentid = dataResult[0].funsave_company.keyid;

                this.saveDynamicFields(parentid);
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

            this.getDynamicFields(pcmpid);
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
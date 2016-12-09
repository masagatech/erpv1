import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DRService } from '../../../_service/documentrepository/dr-service'; /* add reference for view document repository */
import { EmpService } from '../../../_service/employee/emp-service'; /* add reference for view document repository */

import { Router } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'viewdr.comp.html',
    providers: [DRService, EmpService]
})

export class ViewDocumentRepository implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    sort: any;

    UserID: any;
    EmpCode: any;
    EmpName: any;

    IsVisibleGrid: any = true;
    IsVisibleList: any = false;

    EmpDocDetails: any[];
    EmpWiseDocs: any[];
    DocTypeWise: any[];
    EmpCountDocTagWise: any[];
    CountDocs: any[];

    constructor(private _router: Router, private _drservice: DRService, private _empservice: EmpService, private setActionButtons: SharedVariableService) {
        this.getDRAutoComplete();
        this.getDRData("");
    }

    employeeFilter() {
        this.getDRData(this.EmpName);
    }

    getDRData(searchTxt) {
        this._drservice.viewDocumentRepository({ "DRAutoID": "0", "UserID": "", "Tag": "", "ViewedBy": "", "Flag": "EmpWiseDocs", "SearchTxt": searchTxt }).subscribe(data => {
            this.EmpDocDetails = JSON.parse(data.data);
            this.EmpWiseDocs = JSON.parse(data.Table1);
            this.DocTypeWise = JSON.parse(data.Table2);
            this.EmpCountDocTagWise = JSON.parse(data.Table2);
            this.CountDocs = JSON.parse(data.Table3);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getEmpWiseDocs(row) {
        this._drservice.viewDocumentRepository({ "DRAutoID": "0", "UserID": row.UserID, "Tag": row.Tag, "ViewedBy": "", "Flag": "EmpWiseDocs" }).subscribe(data => {
            row.CountDocTagWise = JSON.parse(data.Table2);
            row.EmpWiseDocDetails = JSON.parse(data.data);

            this.EmpCountDocTagWise = row.CountDocTagWise;
            this.EmpDocDetails = row.EmpWiseDocDetails;

            this.UserID = this.EmpCountDocTagWise[0].UserID;

            row.CountDocTagWise = [];
            row.EmpWiseDocDetails = [];
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    orderBy(ordtype) {
        if (ordtype == 'date') {
            this.sort = '-CreatedOn';
        }
        if (ordtype == 'size') {
            this.sort = '-FileSize';
        }
        if (ordtype == 'name') {
            this.sort = 'DocTitle';
        }
    }

    getDRAutoComplete() {
        this._drservice.getMasterOfMaster({ "MasterType": "EmpName" }).subscribe(data => {
            $(function () {
                this.viewAutoEmpData = JSON.parse(data.data);

                var finalData = $.map(this.viewAutoEmpData, function (item) {
                    return {
                        label: item.Name
                    }
                });

                $("#empname").autocomplete({
                    source: finalData,
                    width: 300,
                    max: 20,
                    delay: 100,
                    minLength: 2,
                    autoFocus: true,
                    cacheLength: 1,
                    scroll: true,
                    highlight: false,
                    select: function (event, ui) {
                        this.EmpCode = ui.item.value;
                        this.EmpName = ui.item.label;
                    }
                });
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ShowHideDocs(viewtype) {
        if (viewtype == "Grid") {
            this.IsVisibleGrid = true;
            this.IsVisibleList = false;
        }
        else {
            this.IsVisibleGrid = false;
            this.IsVisibleList = true;
        }
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/documentrepository/add']);
        }
        if (evt === "edit") {
            this._router.navigate(['/documentrepository/edit', this.UserID]);
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}
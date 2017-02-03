import { NgModule, Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { DynamicFieldsService } from '../../../_service/dynamicfields/dynfields-service' /* add reference for dynamic fields */
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
    selector: '<adddynamictab></adddynamictab>',
    templateUrl: 'adddyntab.comp.html',
    providers: [DynamicFieldsService]
})

export class AddDynamicTabComp implements OnInit, OnDestroy {
    @ViewChild("tabpanel")

    fldname: string = "";
    DuplicateFlag: boolean = false;

    @Input() tabListDT: any = [];

    @Input() cmpid: number = 0;
    @Input() fy: number = 0;
    
    @Input() selectedtab: any = [];
    @Input() isedittab: boolean = false;

    constructor(private _msg: MessageService) {
    }

    ngOnInit() {
    }

    // Add Dynamic Tab

    openTabPopup() {
        setTimeout(function() {
            $(".tabname").focus();
        }, 500);

        this.fldname = "";
    }

    addNewTabs() {
        var that = this;

        if (this.fldname === "") {
            this._msg.Show(messageType.error, "Error", "Please Enter Tab Name");
            return;
        }

        var fldcode = this.fldname.replace(" ", "").replace("&", "").replace("/", "");
        this.tabListDT.push({
            "autoid": 0, "fldcode": fldcode, "fldname": this.fldname, "fldvalue": [],
            "cmpid": that.cmpid, "fy": that.fy
        });

        $('#dynTabModel').modal('hide');
        this.ClearTabs();
    }

    editTabPopup(tab) {
        setTimeout(function() {
            $(".tabname").focus();
        }, 500);

        this.selectedtab = tab;
        this.fldname = tab.fldname;
        this.isedittab = true;
    }

    UpdateTabs() {
        var fldcode = this.fldname.replace(" ", "").replace("&", "").replace("/", "");
        this.selectedtab.key = fldcode;
        this.selectedtab.fldname = this.fldname;
        $('#dynTabModel').modal('hide');
        this.ClearTabs();
    }

    ClearTabs() {
        this.fldname = "";
        this.isedittab = false;
    }

    DeleteTabs(tab) {
        this.tabListDT.splice(this.tabListDT.indexOf(tab), 1);
    }

    ngOnDestroy() {
    }
}

@NgModule({
    imports: [CommonModule, FormsModule],
    declarations: [
        AddDynamicTabComp
    ],
    exports: [AddDynamicTabComp]
})

export class AddDynamicTabModule {

}
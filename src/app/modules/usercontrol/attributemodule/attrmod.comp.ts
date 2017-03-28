import { Component, OnInit, Input, NgModule, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';

import { Subscription } from 'rxjs/Subscription';
import { attributeService } from "../../../_service/attribute/attr-service";

declare var $: any;

@Component({
    selector: '<attributemodule></attributemodule>',
    templateUrl: 'attrmod.comp.html',
    providers: [attributeService, CommonService]
})

export class AttributeModuleComp implements OnInit, OnDestroy {
    //Local Veriable 
    attrparam: any = [];
    labelname: string = "Attribute";
    ddllabel: string = "Attribute Group";
    attrgrpid: number = 0;
    attrgrpname: any = "";
    attrtype: string = "";
    attgrouplist: any = [];
    attrlist: any = [];
    attrname: any = "";
    attrid: number = 0;
    attParentNam: any = "";
    attrgrouplist: any = [];
    Duplicateflag: boolean = false;
    AttributeModuleAutodata: any = [];

    @Input() isdetails: boolean = false;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _attrservice: attributeService, private _commonservice: CommonService,
        private _msg: MessageService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }
    ngOnInit() {
        this.getAllAttributeGroup();
    }

    //Attribute Group Dropdown
    getAllAttributeGroup() {
        this._attrservice.attget({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "flag": "attrsub",
            "parentGrp": this.attParentNam,
            "pid": 0
        }).subscribe(data => {
            this.attrgrouplist = data.data[0];
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    //Attribute Group Auto Extender
    AttributeAuto1(event) {
        let query = event.query;
        this._commonservice.getAutoDataGET({
            "type": this.attrtype,
            "search": this.attrname,
            "cmpid": this.loginUser.cmpid,
            "attrgrp": this.attrgrpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login
        }).then(data => {
            this.AttributeModuleAutodata = data;
        });
    }

    // //Selected Attribute
    AttributeSelect1(event) {
        this.attrid = event.value;
        this.attrname = event.label;
    }

    //Add Attribute 
    AttributeAdd() {
        if (this.attrid > 0) {
            this.Duplicateflag = true;
            if (this.attrlist.length > 0) {
                for (var i = 0; i < this.attrlist.length; i++) {
                    if (this.attrlist[i].attrname == this.attrname) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
            }
            if (this.Duplicateflag == true) {
                this.attrlist.push({
                    'attrname': this.attrname,
                    'value': this.attrid
                });
                this.attrname = "";
                $(".attr").focus();
            }
            else {
                this._msg.Show(messageType.error, "error", "Duplicate Attribute");
                $(".attr").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.error, "error", "Please enter valied attribute name");
            $(".attr").focus();
            return;
        }
    }

    //Remove  Attribute 
    Removeattr(row) {
        var index = -1;
        for (var i = 0; i < this.attrlist.length; i++) {
            if (this.attrlist[i].value === row.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.attrlist.splice(index, 1);
        $(".attr").focus();
    }


    ngOnDestroy() {
    }
}

// @NgModule({
//     imports: [AttributeModule],
//     declarations: [
//         AttributeModuleComp
//     ],
//     exports: [AttributeModuleComp]
// })


// export class AttributeModule {

// }
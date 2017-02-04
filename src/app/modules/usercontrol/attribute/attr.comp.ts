import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { AttributeService } from '../../../_service/userattribute/attribute-service' //Add Address Book service
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';

declare var $: any;

@Component({
    selector: '<attribute></attribute>',
    templateUrl: 'attr.comp.html',
    providers: [AttributeService]
})



export class AttributeComp implements OnInit, OnDestroy {
    //Local Veriable 
    attrparam: any = [];
    labelname: string = "Attribute";
    attrtype: string = "multiattr";
    attrlist: any = [];
    attrname: any = "";
    attrid: number = 0;
    Duplicateflag: boolean = false;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;



    constructor(private _adrbookservice: AttributeService, private _commonservice: CommonService,
        private _msg: MessageService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }

    //Autocompleted Attribute Name
    getAutoCompleteattr(me: any) {
        var that = this;
        this._commonservice.getAutoData({
            "type": that.attrtype,
            "search": that.attrname,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "filter": that.attrparam.join(),
            "createdby": that.loginUser.login
        }).subscribe(data => {
            $(".attr").autocomplete({
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
                    me.attrid = ui.item.value;
                    me.attrname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    //Add Attribute 
    AttributeAdd() {
        if (this.attrid > 0) {
            this.Duplicateflag = true;
            // if (this.attrlist.length > 0) {
            //     for (var i = 0; i < this.attrlist.length; i++) {
            //         if (this.attrlist[i].attrname == this.attrname) {
            //             this.Duplicateflag = false;
            //             break;
            //         }
            //     }
            // }
            if (this.Duplicateflag == true) {
                this.attrlist.push({
                    'attrname': this.attrname,
                    'value': this.attrid
                });
                this.attrname = "";
                $(".attr").focus();
            }
            else {
                this._msg.Show(messageType.info, "info", "Duplicate Attribute");
                $(".attr").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.info, "info", "Please enter valied attribute name");
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
    ngOnInit() {

        setTimeout(function () {

        }, 0);
    }

    ngOnDestroy() {
    }
}


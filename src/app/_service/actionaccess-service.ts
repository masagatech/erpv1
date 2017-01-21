import { Injectable } from '@angular/core';
import { SharedVariableService } from "./sharedvariable-service";
import { UserService } from './user/user-service'  //Get UserName 
import { ActionBtnProp } from '../_model/action_buttons';

@Injectable()
export class ActionAccess {
    loginUser: any;

    actionButton: ActionBtnProp[] = [];

    constructor(private _userService: UserService, private setActionButtons: SharedVariableService) {

    }

    setActionButton(menuid: string, show: any, callback: any) {
        var that = this;

        that.loginUser = that._userService.getUser();
        if (that.loginUser == null) {
            return;
        }

        // this.loginUser.uid

        that._userService.getMenuDetails({
            "flag": "actrights", "uid": that.loginUser.uid, "cmpid": that.loginUser.cmpid,
            "fyid": that.loginUser.fyid, "ptype": menuid, "smid": 28
        }).subscribe(data => {
            var data = data.data;

            if (data.length === 0) {
                return;
            }
            else {
                for (var i = 0; i < data.length; i++) {
                    if (show.indexOf(data[i].id) !== -1) {
                        var id = data[i].id;
                        var text = data[i].text;
                        var icon = data[i].icon;

                        that.actionButton.push(new ActionBtnProp(id, text, icon, true, false));
                    }
                }
                // this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
                // this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
                // this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
            }

            that.setActionButtons.setActionButtons(that.actionButton);
            callback(that.actionButton);
        }, err => {

        }, () => {

        })
    }
}
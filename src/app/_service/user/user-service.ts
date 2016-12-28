import { Injectable } from '@angular/core';
import { DataService } from '../dataconnect';
import { LoginUserModel } from '../../_model/user_model';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class UserService {
    private loginUser: LoginUserModel;
    constructor(private _dataserver: DataService, private _router: Router) { }

    getMenuHead(req: any) {
        return this._dataserver.post("getMenuHead", req)
    }

    getMenuDetails(req: any) {
        return this._dataserver.post("getMenuDetails", req);
    }

    getUser() {
        if (this.loginUser === undefined) {
            let usr = Cookie.get('_session_');

            if (usr) {
                //this._router.navigate(['login']);
                return null;
            } else {
                //this._router.navigate(['login']);
                return null;
            }
        } else {
            return this.loginUser;
        }
    }
    savePassword(req: any) {
        return this._dataserver.post("savePassword", req);
    }

    setUsers(userDetails): LoginUserModel {
        this.loginUser = userDetails;
        this.loginUser.login = this.loginUser.uid.toString() + ":" + this.loginUser.ucode;
        Cookie.delete('_session_');
        Cookie.set("_session_", this.loginUser._sessiondetails.sessionid.toString());
        return this.loginUser;
    }

    getUsers(req: any) {
        return this._dataserver.post("getUsers", req)
    }

    saveUsers(req: any) {
        return this._dataserver.post("saveUsers", req)
    }

    getUserRights(req: any) {
        return this._dataserver.post("getUserRights", req)
    }

    saveUserRights(req: any) {
        return this._dataserver.post("SaveUserRights", req)
    }

    saveSettings(req: any) {
        return this._dataserver.post("saveSettings", req);
    }

    getSettings(req: any) {
        return this._dataserver.post("getSettings", req);
    }


}
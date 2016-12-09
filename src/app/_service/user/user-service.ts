import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class UserService {
    private loginUser: any
    constructor(private _dataserver: DataService, private _router: Router) { }

    getMenuMaster(req: any) {
        return this._dataserver.post("GetMenuMaster", req)
    }

    getMenuHead(req: any) {
        return this._dataserver.post("GetHeadMenu", req)
    }

    getSubMenu(req: any) {
        return this._dataserver.post("GetHeadMenu", req);
    }

    getUser() {
        if (this.loginUser === undefined) {
            let usr = Cookie.get('usr');

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

    setUser(userDetails) {
        this.loginUser = userDetails;
        Cookie.delete('usr');
        Cookie.set("usr", userDetails.uid);
    }

    viewUserDetails(req: any) {
        return this._dataserver.post("GetUserMaster", req)
    }

    saveUserMaster(req: any) {
        return this._dataserver.post("SaveUserMaster", req)
    }

    viewUserRights(req: any) {
        return this._dataserver.post("GetUserRights", req)
    }

    saveUserRights(req: any) {
        return this._dataserver.post("SaveUserRights", req)
    }
}
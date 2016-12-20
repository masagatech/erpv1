import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserReq, LoginUserModel } from '../_model/user_model';
import { DataService } from './dataconnect';
import { UserService } from './user/user-service';
import { Cookie } from 'ng2-cookies/ng2-cookies';



@Injectable()
export class AuthenticationService {

  constructor(private _router: Router,
    private _dataserver: DataService, private _userService: UserService) { }

  logout(callback?: any, error?: any) {
    var usr: LoginUserModel = this._userService.getUser();

    this._dataserver.post("getLogout", { "sessionid": usr._sessiondetails.sessionid }).subscribe(r => {
      this._router.navigate(['login']);
      Cookie.delete('_session_');
      callback(r)
    }, err => {
      error(err)
    }, () => {
      callback('done')
    });
    //Cookie.delete('user');

  }

  login(user: UserReq) {
    var otherdetails = this.getClientInfo();
    let loginRes: any = this._dataserver.post("getLogin", {
      "email": user.email,
      "pwd": user.pwd,
      "otherdetails": otherdetails
    })
    console.log(loginRes);
    return loginRes;
  }


  private getClientInfo() {
    var d = {
      "Browser": "",
      "Version": "",
      "IP": "",
      "Dattime": new Date(),
    }

    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
      browserName = "Microsoft Internet Explorer";
      fullVersion = nAgt.substring(verOffset + 5);
    }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
      browserName = "Chrome";
      fullVersion = nAgt.substring(verOffset + 7);
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
      browserName = "Safari";
      fullVersion = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
      browserName = "Firefox";
      fullVersion = nAgt.substring(verOffset + 8);
    }
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
      (verOffset = nAgt.lastIndexOf('/'))) {
      browserName = nAgt.substring(nameOffset, verOffset);
      fullVersion = nAgt.substring(verOffset + 1);
      if (browserName.toLowerCase() == browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) != -1)
      fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) != -1)
      fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion)) {
      fullVersion = '' + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }
    d.Browser = browserName;
    d.Version = fullVersion;

    return d;


    // document.write(''
    //  +'Browser name  = '+browserName+'<br>'
    //  +'Full version  = '+fullVersion+'<br>'
    //  +'Major version = '+majorVersion+'<br>'
    //  +'navigator.appName = '+navigator.appName+'<br>'
    //  +'navigator.userAgent = '+navigator.userAgent+'<br>'
    // )
  }

  public checkCredentials(): boolean {
    // if (localStorage.getItem("user") === null) {

    //   this._router.navigate(['login']);

    // }
    return true;
  }
}
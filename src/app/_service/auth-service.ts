import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UserReq, LoginUserModel } from '../_model/user_model';
import { DataService } from './dataconnect';
import { UserService } from './user/user-service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
declare var swfobject: any;

@Injectable()
export class AuthenticationService {

  constructor(private _router: Router,
    private _dataserver: DataService, private _userService: UserService) { }

  logout(callback?: any, error?: any) {
    var usr: LoginUserModel = this._userService.getUser();
    debugger
    this._dataserver.post("getLogout", { "sessionid": usr._sessiondetails.sessionid }).subscribe(r => {
      Cookie.delete('_session_');
      this._userService.setUsers(null);
      if (callback) {
        callback(r);
      }
      this._router.navigate(['login']);
    }, err => {
      if (error) {
        error(err);
      }
    }, () => {
      if (callback) {
        callback('done');
      }
    });
  }

  login(user: UserReq) {
    var otherdetails = this.getClientInfo();
    let loginRes: any = this._dataserver.post("getLogin", {
      "email": user.email,
      "pwd": user.pwd,
      "otherdetails": otherdetails
    })

    return loginRes;
  }

  loginsession(details: any) {
    var otherdetails = this.getClientInfo();
    details.otherdetails = otherdetails;
    let loginRes: any = this._dataserver.post("getLogin", details);

    return loginRes;
  }


  getSession(callback, checks) {
    this.loginsession({ "base": "_sid", "sid": checks.sessionid }).subscribe(d => {
      if (d) {
        if (d.status) {
          let usrobj = d.data;
          let userDetails = usrobj[0];

          if (userDetails.status) {
            this._userService.setUsers(userDetails);
            if (userDetails.cmpid != 0 && userDetails.fyid != 0) {
              // propr user
            } else if (userDetails.errcode === "chpwd") {
              this._router.navigate(['/changepwd']);
            } else {
              this._router.navigate(['/usersettings/defaultcompandfy']);
            }
          } else {
            this._router.navigate(['login']);
            console.log("user status false");
          }
        } else {
          this._router.navigate(['login']);
          console.log("data status false");
        }
      } else {
        this._router.navigate(['login']);
      }
      callback("success")
    }, err => {
      this._router.navigate(['login']);
      console.log(err);
      callback("failed")
    });
  }



  checkmenuaccess(details: any) {
    let Res: any = this._dataserver.post("getMenuAccess", details);
    return Res;
  }

  private getClientInfo() {
    var unknown: any = '-';
    var d: any = {
      "Browser": "",
      "Version": "",
      "IP": "",
      "Mobile": false,
      "Cookie": true,
      "OS": "",
      "OSVersion": "",
      "Screen": "",
      "WindowSize": "",
      "FlashVersion": "",
      "Dattime": new Date(),
    }

    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;
    var screenSize = '';
    var windowSize = '';
    if (screen.width) {
      var width = (screen.width) ? screen.width : '';
      var height = (screen.height) ? screen.height : '';
      screenSize += '' + width + " x " + height;
    }
    if (window.innerHeight) {
      var width1 = (window.innerWidth) ? window.innerWidth : '';
      var height1 = (window.innerHeight) ? window.innerHeight : '';
      windowSize += '' + width1 + " x " + height1;
    }

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

    // mobile version
    var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

    // cookie
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
    }

    // system
    var os = unknown;
    var clientStrings = [
      { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
      { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
      { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
      { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
      { s: 'Windows Vista', r: /Windows NT 6.0/ },
      { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
      { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
      { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
      { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
      { s: 'Windows 98', r: /(Windows 98|Win98)/ },
      { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
      { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
      { s: 'Windows CE', r: /Windows CE/ },
      { s: 'Windows 3.11', r: /Win16/ },
      { s: 'Android', r: /Android/ },
      { s: 'Open BSD', r: /OpenBSD/ },
      { s: 'Sun OS', r: /SunOS/ },
      { s: 'Linux', r: /(Linux|X11)/ },
      { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
      { s: 'Mac OS X', r: /Mac OS X/ },
      { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
      { s: 'QNX', r: /QNX/ },
      { s: 'UNIX', r: /UNIX/ },
      { s: 'BeOS', r: /BeOS/ },
      { s: 'OS/2', r: /OS\/2/ },
      { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];

    for (var id in clientStrings) {
      var cs = clientStrings[id];

      if (cs.r.test(nAgt)) {
        os = cs.s;
        break;
      }
    }

    var osVersion: any = unknown;

    if (/Windows/.test(os)) {
      osVersion = /Windows (.*)/.exec(os)[1];
      os = 'Windows';
    }

    switch (os) {
      case 'Mac OS X':
        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
        break;

      case 'Android':
        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
        break;

      case 'iOS':
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
        break;
    }

    var flashVersion = 'no check';

    if (typeof swfobject != 'undefined') {
      var fv = swfobject.getFlashPlayerVersion();
      if (fv.major > 0) {
        flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
      }
      else {
        flashVersion = unknown;
      }
    }
    d.Mobile = mobile;
    d.Cookie = cookieEnabled;
    d.OS = os;
    d.OSVersion = osVersion;
    d.Screen = screenSize;
    d.FlashVersion = flashVersion;
    d.Browser = browserName;
    d.Version = fullVersion;
    d.WindowSize = windowSize;

    return d;
  }

  public checkCredentials(): any {
    var sessionid = Cookie.get('_session_');
    var usr: LoginUserModel = this._userService.getUser();

    if (usr !== null) //check user is locally present in memory
    {
      return { "status": true };
    } else {
      if (sessionid !== null && sessionid !== undefined) {
        return { "status": false, "takefrmdb": true, "sessionid": sessionid };

      } else {

        return { "status": false, "takefrmdb": false };
      }
    }
  }
}
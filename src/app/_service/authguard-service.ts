import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanLoad, CanActivateChild } from '@angular/router';
import { AuthenticationService } from '../_service/auth-service';
import { UserService } from '../_service/user/user-service'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(private authser: AuthenticationService, private _userService: UserService, private _router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkFun(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkFun(route, state);
  }

  canLoad() {
    return true;
  }

  private checkFun(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    //check route info

    var routeconfig = route.data;
    var checks = this.authser.checkCredentials();
    var that = this;

    return Observable.create((observer: Subject<boolean>) => {
      //debugger;
      if (checks.status) {
        //call here

        that.checkMenuAccess(route, state, that._userService.getUser(), function (e) {
          if (e) {
            observer.next(true);
          } else {
            that._router.navigate(['/']);
            observer.next(true);
          }
        })
      } else if (checks.takefrmdb) {
        that.authser.getSession(function (e) {
          //call here
          if (e === "success") {
            that.checkMenuAccess(route, state, that._userService.getUser(), function (e) {
              if (e) {
                observer.next(true);
              } else {
                that._router.navigate(['/']);
                observer.next(true);
              }
            });
          } else {
            that._router.navigate(['login']);
             observer.next(true);
          }
        }, checks);
      } else {
        this._router.navigate(['login']);
        console.log("logged out");
        observer.next(true);
      }
    }).first();
  }

  private checkMenuAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, userdetails, callback) {
    var segments = state.url;
    var maindata = route.children[0].data;
    var submenudetails = route.children[0].routeConfig.children;
    var matchData = {};
    var ismatch = false;

    if (maindata.hasOwnProperty("module")) {
      var modname = maindata["module"];

      for (var i = 0; i <= submenudetails.length - 1; i++) {
        var menumatch = submenudetails[i].data;

        if (menumatch != undefined) {
          if (segments.indexOf(menumatch["urlname"]) > -1) {
            matchData = menumatch;
            ismatch = true;
            var params = {
              "uid": userdetails.uid, "cmpid": userdetails.cmpid, "fyid": userdetails.fyid,
              "ptype": menumatch["module"], "smtype": menumatch["submodule"], "actcd": menumatch["rights"]
            };

            this.authser.checkmenuaccess(params).subscribe(d => {
              if (d.data) {
                if (d.data[0].access) {
                  callback(true);
                } else {
                  callback(false);
                }
              }
            }, error => {
              callback(false);
            }, () => {

            });
            break;
          }
        }
      }

      if (!ismatch) {
        callback(false);
      }
    } else {
      callback(true);
      return;
    }
  }

  // private getSession(callback, checks) {
  //   this.authser.loginsession({ "base": "_sid", "sid": checks.sessionid }).subscribe(d => {
  //     if (d) {
  //       if (d.status) {
  //         let usrobj = d.data;
  //         let userDetails = usrobj[0];

  //         if (userDetails.status) {
  //           this._userService.setUsers(userDetails);
  //           if (userDetails.cmpid != 0 && userDetails.fyid != 0) {
  //             // propr user
  //           } else if (userDetails.errcode === "chpwd") {
  //             this._router.navigate(['/changepwd']);
  //           } else {
  //             this._router.navigate(['/usersettings/defaultcompandfy']);
  //           }
  //         } else {
  //           this._router.navigate(['login']);
  //           console.log("user status false");
  //         }
  //       } else {
  //         this._router.navigate(['login']);
  //         console.log("data status false");
  //       }
  //     } else {
  //       this._router.navigate(['login']);
  //     }
  //     callback("success")
  //   }, err => {
  //     this._router.navigate(['login']);
  //     console.log(err);
  //     callback("failed")
  //   });
  // }
}
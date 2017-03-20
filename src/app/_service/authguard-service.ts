import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanLoad, CanActivateChild } from '@angular/router';
import { AuthenticationService } from '../_service/auth-service';
import { UserService } from '../_service/user/user-service'
import { GlobalSharedVariableService } from '../_service/sharedvariableglobal-service'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(private authser: AuthenticationService, private _userService: UserService,
    private _router: Router, private app: GlobalSharedVariableService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    //  debugger;
    return this.checkFun(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // debugger;
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
    // debugger
    return Observable.create((observer: Subject<boolean>) => {
      //debugger;
      // $("#theme").attr('href', '/assets/theme/brown.css');
      that.app.setTheme("blue");
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
    var maindata = route.data;
    if (maindata.hasOwnProperty("submodule")) {
      var module1 = maindata["module"];
      var rights = maindata["rights"];
      var submodule = maindata["submodule"];

      var params = {
        "uid": userdetails.uid,
        "cmpid": userdetails.cmpid,
        "fy": userdetails.fy,
        "ptype": module1,
        "smtype": submodule,
        "actcd": rights,
        "sessionid": userdetails._sessiondetails.sessionid,
        "ucode": userdetails.ucode,
        "url": segments
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


    } else {
      callback(true);
      return;
    }
  }


  // private checkMenuAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot, userdetails, callback) {
  //   var segments = state.url;
  //   var maindata = route.children[0].data;
  //   var submenudetails = route.children[0].routeConfig.children;
  //   var matchData = {};
  //   var ismatch = false;
  //   console.log(segments);
  //   if (maindata.hasOwnProperty("module")) {
  //     var modname = maindata["module"];
  //     for (var i = 0; i <= submenudetails.length - 1; i++) {
  //       var menumatch = submenudetails[i].data;

  //       if (menumatch != undefined) {
  //         if (segments.indexOf(menumatch["urlname"]) > -1) {
  //           matchData = menumatch;
  //           ismatch = true;
  //           var params = {
  //             "uid": userdetails.uid,
  //             "cmpid": userdetails.cmpid,
  //             "fy": userdetails.fy,
  //             "ptype": menumatch["module"],
  //             "smtype": menumatch["submodule"],
  //             "actcd": menumatch["rights"],
  //             "sessionid": userdetails._sessiondetails.sessionid,
  //             "ucode": userdetails.ucode,
  //             "url": segments
  //           };
  //           this.authser.checkmenuaccess(params).subscribe(d => {
  //             if (d.data) {
  //               if (d.data[0].access) {
  //                 callback(true);
  //               } else {
  //                 callback(false);
  //               }
  //             }
  //           }, error => {
  //             callback(false);
  //           }, () => {

  //           });
  //           break;
  //         }
  //       }
  //     }

  //     if (!ismatch) {
  //       callback(false);
  //     }
  //   } else {
  //     callback(true);
  //     return;
  //   }
  // }
}
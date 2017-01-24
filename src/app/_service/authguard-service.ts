import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanLoad, CanActivateChild } from '@angular/router';
import { AuthenticationService } from '../_service/auth-service';
import { UserService } from '../_service/user/user-service'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(private authser: AuthenticationService, private _userService: UserService, private _router: Router) {

  }


  canActivate(): Observable<boolean> {
    return this.checkFun();
  }

  canActivateChild(): Observable<boolean> {
    //console.log('AuthGuard#canActivate called');
    return this.checkFun();
  }

  canLoad() {
    //console.log('AuthGuard#canLoad called');
    return true;
    //return this.authser.checkCredentials();
  }


  private checkFun(): Observable<boolean> {
    var checks = this.authser.checkCredentials();
    console.log(checks);
    return Observable.create((observer: Subject<boolean>) => {
      if (checks.status) {
        observer.next(true);
      } else if (checks.takefrmdb) {
        this.authser.loginsession({ "base": "_sid", "sid": checks.sessionid }).subscribe(d => {
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
            observer.next(true);
        }, err => {
          this._router.navigate(['login']);
          console.log(err);
            observer.next(true);
        });

      } else {
        this._router.navigate(['login']);
        console.log("logged out");
          observer.next(true);
      }
    
    }).first();
  }
}
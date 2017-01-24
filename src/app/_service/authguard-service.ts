import { Injectable,Inject }     from '@angular/core';
import { CanActivate,CanLoad,CanActivateChild }    from '@angular/router';
import { AuthenticationService } from '../_service/auth-service';


@Injectable()
export class AuthGuard implements CanActivate, CanLoad ,CanActivateChild{
  constructor(private authser: AuthenticationService){

  }

  canActivate() {
    //console.log('AuthGuard#canActivate called');
    
    return this.authser.checkCredentials();
  }

  canActivateChild() {
    //console.log('AuthGuard#canActivate called');
    return this.authser.checkCredentials();
  }

   canLoad() {
    //console.log('AuthGuard#canLoad called');
     return this.authser.checkCredentials();
  }
}
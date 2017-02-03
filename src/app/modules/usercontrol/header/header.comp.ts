import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../_service/auth-service'
import { UserService } from '../../../_service/user/user-service'
import { LoginUserModel } from '../../../_model/user_model'
import { ArrayFilterPipe } from '../../../_util/filter'
import { Router } from '@angular/router';

declare var $: any;


@Component({
  selector: '<app-head></app-head>',
  templateUrl: 'header.comp.html'
})
export class UserControlHeadComp implements OnInit {
  //$('.dropdown-submenu > a').submenupicker();

  menuhead: any;
  parentMenus: any;
  subMenu: any;
  loginUser: LoginUserModel;
  loginUserName: string;

  constructor(private _authservice: AuthenticationService, private _userService: UserService, private _router: Router) {
    //get login user details 
    this.loginUser = this._userService.getUser();

    // if (this.loginUser == null) {
    //   return;
    // }

  

    //set user name 
    this.loginUserName = this.loginUser.fullname;

    //get menues according to loggedin user

    // this.loginUser.uid

    this._userService.getMenuHead({ "flag": "", "uid": this.loginUser.uid, "cmpid": this.loginUser.cmpid, "fy": this.loginUser.fy }).subscribe(data => {
      var data1 = data.data;
      console.log(data1);

      this.subMenu = data1[2];
      this.parentMenus = data1[1];
      this.menuhead = data1[0];

      for (var i = 0; i <= this.menuhead.length - 1; i++) {
        var _parentMenu = this.parentMenus.filter(item => item.mid === this.menuhead[i].mid);

        for (var j = 0; j <= _parentMenu.length - 1; j++) {
          _parentMenu[j].subsub = this.subMenu.filter(subitem => subitem.parentid === _parentMenu[j].parentid);
        }

        this.menuhead[i].sub = _parentMenu;

        $('.dropdown-submenu > a').submenupicker();
      }
    }, err => {

    }, () => {
      // console.log("Complete");
    })
  }

  callRoute(item: any, click: any) {
    if (click === 0) {
      var link = item.menulink.toString();
      this._router.navigate([link]);
    }
  }

  ngOnInit() {

  }

  logout() {
    this._authservice.logout();
  }

  private showhidemenu() {

    if ($('.container').hasClass('closeopenpan')) {
      $('#sidebar').show();
    } else {
      $('#sidebar').hide();
    }
    $('.container').toggleClass('closeopenpan');
  }
}
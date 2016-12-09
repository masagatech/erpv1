import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './account.comp.html'
})

export class AccountsComp implements OnInit {
  menuid: string;

  constructor() {

  }
  
  ngOnInit() {
    this.menuid = "accs";
  }
}
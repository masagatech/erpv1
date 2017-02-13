import { Component, OnInit } from '@angular/core';
import { SharedVariableService } from "../../_service/sharedvariable-service";

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class AccountsComp implements OnInit {
  menuid: string;

  constructor(private setActionButtons: SharedVariableService) {

  }

  ngOnInit() {
    this.setActionButtons.setTitle("Accounts");
    this.menuid = "accs";
  }
}
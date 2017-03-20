import { Component, OnInit } from '@angular/core';
import { SharedVariableService } from "../../_service/sharedvariable-service";

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class ReportsComp implements OnInit {
  menuid: string;

  constructor(private setActionButtons: SharedVariableService) {
    this.menuid = "rptaccs";
  }

  ngOnInit() {
    this.setActionButtons.setTitle("Reports");
    this.menuid = "rptaccs";
  }
}
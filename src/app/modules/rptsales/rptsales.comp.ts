import { Component, OnInit } from '@angular/core';
import { SharedVariableService } from "../../_service/sharedvariable-service";

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class ReportSalesComp implements OnInit {
  menuid: string;

  constructor(private setActionButtons: SharedVariableService) {
    this.menuid = "rptsale";
  }

  ngOnInit() {
    this.setActionButtons.setTitle("Sales Reports");
    this.menuid = "rptsale";
  }
}
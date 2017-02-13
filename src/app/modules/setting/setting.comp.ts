import { Component, OnInit } from '@angular/core';
import { SharedVariableService } from "../../_service/sharedvariable-service";

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class SettingComp implements OnInit {
  menuid: string;

  constructor(private setActionButtons: SharedVariableService) {
    this.menuid = "pset";
  }

  ngOnInit() {
    this.setActionButtons.setTitle("Setting");
    this.menuid = "pset";
  }
}
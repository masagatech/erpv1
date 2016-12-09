import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './setting.comp.html'
})

export class SettingComp implements OnInit {
  menuid: string;
  constructor() {
    this.menuid = "pset";
  }
  ngOnInit() {
    this.menuid = "pset";
  }
}
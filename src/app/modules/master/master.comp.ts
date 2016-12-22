import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class MasterComp implements OnInit {
  menuid: string;

  constructor() {

  }
  
  ngOnInit() {
    this.menuid = "coa";
  }
}
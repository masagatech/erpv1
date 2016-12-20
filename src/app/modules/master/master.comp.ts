import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './master.comp.html'
})

export class MasterComp implements OnInit {
  menuid: string;

  constructor() {

  }
  
  ngOnInit() {
    this.menuid = "coa";
  }
}
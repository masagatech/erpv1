import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class InventoryComp implements OnInit {
  menuid: string;
  
  constructor() {
    this.menuid = "pset";
  }
  ngOnInit() {
    this.menuid = "pset";
  }
}
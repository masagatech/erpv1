import { Component, OnInit } from '@angular/core';


@Component({
  templateUrl: '../mastertmpl.comp.html'
})
export class TransactionComp implements OnInit {
  menuid: string = "dcm";
  constructor() {

  }
  ngOnInit() {
    this.menuid = "dcm";
    console.log(this.menuid);
    
  }
}
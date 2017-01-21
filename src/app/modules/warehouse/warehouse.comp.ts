import { Component, OnInit } from '@angular/core';


@Component({
  templateUrl: '../mastertmpl.comp.html'
})
export class WarehaouseComp implements OnInit {
  menuid: string = "waresub";
  constructor() {

  }
  ngOnInit() {
    this.menuid = "waresub";
    console.log(this.menuid);
    
  }
}
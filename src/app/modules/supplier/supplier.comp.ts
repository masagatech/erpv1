import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './supplier.comp.html'
})

export class SupplierComp implements OnInit {
  menuid: string;

  constructor() {

  }
  
  ngOnInit() {
    this.menuid = "sup";
  }
}
import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: '../mastertmpl.comp.html'
})

export class EmployeeComp implements OnInit {
  menuid: string;
  constructor() {
    this.menuid = "emp"
  }
  ngOnInit() {
    this.menuid = "emp"
  }
}
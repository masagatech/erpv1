import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './employee.comp.html'
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
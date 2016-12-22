import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  templateUrl: '../mastertmpl.comp.html'
})

export class DocRepoComp implements OnInit {
  menuid: string;
  constructor() {
    this.menuid = "dr";
  }
  ngOnInit() {
    this.menuid = "dr";
  }
}
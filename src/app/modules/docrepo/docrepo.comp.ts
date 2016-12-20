import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  templateUrl: './docrepo.comp.html'
})

export class DRComp implements OnInit {
  menuid: string;
  constructor() {
    this.menuid = "dr";
  }
  ngOnInit() {
    this.menuid = "dr";
  }
}
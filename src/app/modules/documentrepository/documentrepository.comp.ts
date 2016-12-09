import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  templateUrl: './documentrepository.comp.html'
})

export class DocumentRepositoryComp implements OnInit {
  menuid: string;
  constructor() {
    this.menuid = "dr";
  }
  ngOnInit() {
    this.menuid = "dr";
  }
}
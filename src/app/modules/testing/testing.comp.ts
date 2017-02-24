import { Component, OnInit } from '@angular/core';
import { SharedVariableService } from "../../_service/sharedvariable-service";

@Component({
  template: `<div class="container maincontent">
    <div class="row">
        <div class="col-sm-12">
            <router-outlet></router-outlet>
        </div>
    </div>
</div>`
})

export class TestingComp implements OnInit {
  menuid: string;

  constructor(private setActionButtons: SharedVariableService) {
    this.menuid = "test";
  }

  ngOnInit() {
    this.setActionButtons.setTitle("Testing Module");
   
  }
}
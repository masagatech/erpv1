import { Component } from '@angular/core';
import { UserService } from '../../../_service/user/user-service'
import { dashboardService } from '../../../_service/podashboard/podashboard-service'

import { Router } from '@angular/router';

@Component({
  templateUrl: 'dashboard.comp.html',
  providers: [dashboardService]
})
export class SupplierDashboardComp {
  _loginUser: any;
  loginUserName: string;
  PurchaseOrd: any="0";
  PaidBill: any="0";
  PenBill: any="0";
  Overdue: any="0";
  SupplierList:any[];
  constructor(private _router: Router,private _userservice: UserService, private dashservice: dashboardService) {
    //this.getdashboard();
  }
  getdashboard() {
    var that=this;
    this.dashservice.getdashboard({
      "CmpCode": "Mtech",
      "FY": 5,
      "CreatedBy": "",
      "flag": "",
      "flag1": ""
    }).subscribe(result => {
      var returndata = JSON.parse(result.data);
      that.PurchaseOrd=returndata.Table[0].PurchaseO;
      that.PaidBill=returndata.Table[0].PaidB;
      that.PenBill=returndata.Table[0].PendingB;
      that.Overdue=returndata.Table[0].Overdue;
      this.SupplierList=returndata.Table1;
    }, err => {
      console.log(err);
    }, () => {
      //Complete
    })

  }

  //Supplier Details 
  RowClick(row)
  {
    this._router.navigate(['/supplier/suppdet',row.SuppId]);
  }
}
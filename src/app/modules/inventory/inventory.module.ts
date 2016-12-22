import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InventoryComp } from '../inventory/inventory.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { InventoryDashboardComp } from '../Inventory/dashboard/dashboard.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../_shared/shared.module'
import { GroupByPipe } from '../../_pipe/groupby.pipe'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataListModule, DataGridModule, PanelModule } from 'primeng/primeng';

const routerConfig = [
  {
    path: '',
    component: InventoryComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: 'receiptbook', loadChildren: () => System.import('./receiptbook').then((comp: any) => {
              return comp.default;
            }),
          },

          { path: '', component: InventoryDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
    DataListModule, DataGridModule, PanelModule],
  declarations: [
    InventoryComp,
    InventoryDashboardComp,
    GroupByPipe
  ],
  providers: [AuthGuard]
})

export default class InventoryModule {
}
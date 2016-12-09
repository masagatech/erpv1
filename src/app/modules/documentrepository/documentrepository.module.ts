import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DocumentRepositoryComp } from '../documentrepository/documentrepository.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { DocumentRepositoryDashboardComp } from '../documentrepository/dashboard/dashboard.comp';
import { DRAddEdit } from '../documentrepository/aded/adddr.comp';
import { ViewDocumentRepository } from '../documentrepository/view/viewdr.comp';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';

const routerConfig = [
  {
    path: '',
    component: DocumentRepositoryComp,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        children: [
          { path: 'view', component: ViewDocumentRepository, canActivateChid: [AuthGuard], },
          { path: 'add', component: DRAddEdit, canActivateChid: [AuthGuard], },
          { path: 'edit/:UserID', component: DRAddEdit, canActivateChid: [AuthGuard], },
          { path: '', component: DocumentRepositoryDashboardComp, canActivateChid: [AuthGuard], },
        ]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule],
  declarations: [
    ViewDocumentRepository,
    DRAddEdit,
    
    DocumentRepositoryDashboardComp,
    DocumentRepositoryComp
  ],
  providers: [AuthGuard]
})

export default class DocumentRepositoryModule {
}
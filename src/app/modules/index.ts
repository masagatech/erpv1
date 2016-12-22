import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModuleComponent } from '../modules/module.comp';
import { UserControlHeadComp } from './usercontrol/header/header.comp'
import { DocBarComponent } from './usercontrol/topdocbar/docbar.comp'
import { ActionBarModule } from '../_shared/shared.module'
import { AuthGuard } from '../_service/authguard-service';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { DashboardComponent } from './dashboard/dashboard.comp';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { HotkeyModule } from 'angular2-hotkeys';
// canActivateChild: [AuthGuard]
const routerConfig =
    [
        {
            path: '',
            component: ModuleComponent,
            canActivate: [AuthGuard],
            children: [
                {
                    path: '',
                    children: [
                        { path: '', component: DashboardComponent, canActivateChild: [AuthGuard] },
                        {
                            path: 'accounts', loadChildren: () => System.import('./accounts/account.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                        {
                            path: 'setting', loadChildren: () => System.import('./setting/setting.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                        {
                            path: 'transaction', loadChildren: () => System.import('./transaction/transaction.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                        {
                            path: 'employee', loadChildren: () => System.import('./employee/employee.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                        {
                            path: 'docrepo', loadChildren: () => System.import('./docrepo/docrepo.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                        {
                            path: 'inventory', loadChildren: () => System.import('./inventory/inventory.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                        {
                            path: 'supplier', loadChildren: () => System.import('./supplier/supplier.module').then((comp: any) => {
                                return comp.default;
                            })
                        },
                    ]
                }
            ]
        }
    ]


@NgModule({
    imports: [RouterModule.forChild(routerConfig),
    SlimLoadingBarModule.forRoot(),
    ActionBarModule.forRoot(),
        FormsModule,
        CommonModule,
    ],
    declarations: [
        UserControlHeadComp,
        DocBarComponent,
        ModuleComponent,
        DashboardComponent
    ],
    providers: [AuthGuard]
})

export default class ModuleModule {
}
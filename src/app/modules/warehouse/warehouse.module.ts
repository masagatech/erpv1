import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WarehaouseComp } from '../warehouse/warehouse.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { WarehouseDashboardComp } from './dashboard/dashboard.comp';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';



import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'

const routerConfig =
    [
        {
            path: '',
            component: WarehaouseComp,
            canActivate: [AuthGuard],
            children: [
                {
                    path: '',
                    children: [
                        {
                            path:'warehouse', loadChildren: () => System.import('./waremaster').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        {
                            path:'warestock', loadChildren: () => System.import('./wartransfer').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        {
                            path:'openingbal', loadChildren: () => System.import('./openingbal').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        {
                            path:'goodreceipt', loadChildren: () => System.import('./goodreceiptnote').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        {
                            path:'stckreport', loadChildren: () => System.import('./warstockrpt').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        {
                            path:'stckledger', loadChildren: () => System.import('./warstockledger').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        {
                            path:'invlocation', loadChildren: () => System.import('./inventorylocation').then((comp: any) => {
                                return comp.default;
                            }),
                        },
                        { path: '', component: WarehouseDashboardComp, canActivateChid: [AuthGuard], },
                    ]
                }
            ]
        }
    ]




@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        WarehaouseComp,
        WarehouseDashboardComp
    ],
    providers: [AuthGuard]
})
export default class TransactionModule {
}
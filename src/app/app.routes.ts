import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';
import { LoginComp } from './login/login.comp';

export const ROUTES: Routes = [
  { path: 'login', component: LoginComp },
  {
    path: 'usersettings', loadChildren: () => System.import('./modules/usersettings').then((comp: any) => {
      return comp.default;
    })
  },
  {
    path: 'changepwd', loadChildren: () => System.import('./login/changepwd').then((comp: any) => {
      return comp.default;
    })
    ,
  },
  {
    path: '', loadChildren: () => System.import('./modules').then((comp: any) => {
      return comp.default;
    })
    ,
  },
  { path: '**', component: NoContentComponent },
];

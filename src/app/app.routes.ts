import { Routes } from '@angular/router';

import { LoginComponent } from './domains/auth/presentation/login/login.component';
import { authGuard } from './domains/auth/infrastructure/auth.guard';

import { AdminLayoutComponent } from './shared/presentation/admin-layout/admin-layout.component';

import { TrackingViewComponent } from './domains/customer-trust/presentation/tracking-view/tracking-view';

import { MechanicDashboardComponent } from './domains/mechanic/presentation/mechanic-dashboard/mechanic-dashboard.compontent';
import { MechanicOrderExecutionComponent } from './domains/mechanic/presentation/mechanic-order-execution/mechanic-order-execution.component';

import { DashboardComponent } from './domains/workshop-operations/presentation/dashboard/dashboard.component';
import { TasksViewComponent } from './domains/workshop-operations/presentation/tasks-view/tasks-view';
import { WorkOrderListComponent } from './domains/workshop-operations/presentation/work-order-list/work-order-list';
import { CreateWorkOrderComponent } from './domains/workshop-operations/presentation/create-work-order/create-work-order';
import { WorkOrderDetailComponent } from './domains/workshop-operations/presentation/work-order-detail/work-order-detail';

import { CustomerListComponent } from './domains/customer-management/presentation/customer-list/customer-list';

import { VehicleListComponent } from './domains/fleet-management/presentation/vehicle-list/vehicle-list';
import { VehicleDetailComponent } from './domains/fleet-management/presentation/vehicle-detail/vehicle-detail';

import { MechanicsViewComponent } from './domains/staff-coordination/presentation/mechanics-view/mechanics-view';

import { InventoryViewComponent } from './domains/inventory-management/presentation/components/presentation/inventory-view/inventory-view.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tracking', component: TrackingViewComponent },

  {
    path: 'mechanic/workspace',
    component: MechanicDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'mechanic/order/:id',
    component: MechanicOrderExecutionComponent,
    canActivate: [authGuard],
  },

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, pathMatch: 'full' },
      { path: 'customers', component: CustomerListComponent },
      { path: 'vehicles', component: VehicleListComponent },
      { path: 'vehicles/:id', component: VehicleDetailComponent },
      { path: 'work-orders', component: WorkOrderListComponent },
      { path: 'work-orders/new', component: CreateWorkOrderComponent },
      { path: 'work-orders/:id', component: WorkOrderDetailComponent },
      { path: 'tasks', component: TasksViewComponent },
      { path: 'mechanics', component: MechanicsViewComponent },
      { path: 'inventory', component: InventoryViewComponent },
    ],
  },

  { path: '**', redirectTo: '/login' },
];

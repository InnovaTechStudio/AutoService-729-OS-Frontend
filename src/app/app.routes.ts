/**
 *
 *
 *
 * Main route definitions for the application.
 *
 * Configures the routing for the entire AutoService-729 application, separating:
 * - Public routes (login and tracking for customers)
 * - Protected routes for the admin panel with a shared layout
 *
 * @file app.routes.ts
 * @version 1.0
 *
 *
 *
 */
import { Routes } from '@angular/router';
// Auth
import { LoginComponent } from './domains/auth/presentation/login/login.component';
import { authGuard } from './domains/auth/infrastructure/auth.guard';

// Layout
import { AdminLayoutComponent } from './shared/presentation/admin-layout/admin-layout.component';

// Dashboard
import { DashboardComponent } from './domains/workshop-operations/presentation/dashboard/dashboard.component';

// Customer Management
import { CustomerListComponent } from './domains/customer-management/presentation/customer-list/customer-list';

// Fleet Management
import { VehicleListComponent } from './domains/fleet-management/presentation/vehicle-list/vehicle-list';

// Staff Coordination
import { MechanicsViewComponent } from './domains/staff-coordination/presentation/mechanics-view/mechanics-view';

// Workshop Operations
import { TasksViewComponent } from './domains/workshop-operations/presentation/tasks-view/tasks-view';
import { WorkOrderListComponent } from './domains/workshop-operations/presentation/work-order-list/work-order-list';
import { CreateWorkOrderComponent } from './domains/workshop-operations/presentation/create-work-order/create-work-order';
import { WorkOrderDetailComponent } from './domains/workshop-operations/presentation/work-order-detail/work-order-detail';
import {TrackingViewComponent} from './domains/customer-trust/presentation/tracking-view/tracking-view';
import { VehicleDetailComponent } from './domains/fleet-management/presentation/vehicle-detail/vehicle-detail';
import { MechanicWorkspaceComponent } from './domains/staff-coordination/presentation/mechanic-workspace/mechanic-workspace';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'tracking', component: TrackingViewComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomerListComponent },
      { path: 'vehicles', component: VehicleListComponent },
      { path: 'vehicles/:id', component: VehicleDetailComponent },
      { path: 'mechanics', component: MechanicsViewComponent },
      { path: 'tasks', component: TasksViewComponent },
      { path: 'work-orders', component: WorkOrderListComponent },
      { path: 'work-orders/new', component: CreateWorkOrderComponent },
      { path: 'work-orders/:id', component: WorkOrderDetailComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'mechanic/workspace',
    component: MechanicWorkspaceComponent,
    canActivate: [authGuard]
  },

  { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

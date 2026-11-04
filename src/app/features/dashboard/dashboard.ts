import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DashboardService,
  Department,
  Employee,
  EmployeeSearchRequest,
  PendingLeave
} from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  isLoading = signal(true);

  totalEmployees = signal(0);
  totalDepartments = signal(0);
  totalTeams = signal(0);
  pendingLeaveCount = signal(0);
  departments = signal<Department[]>([]);

  employees = signal<Employee[]>([]);
  employeesLoading = signal(false);
  employeesError = signal('');

  pendingLeaves = signal<PendingLeave[]>([]);

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllDashboardData();
  }

  // Uses forkJoin to fetch ALL dashboard endpoints simultaneously and render EVERYTHING together at once!
  loadAllDashboardData(): void {
    this.isLoading.set(true);
    this.employeesLoading.set(true);
    this.employeesError.set('');

    const empRequest: EmployeeSearchRequest = {
      page: 1,
      pageSize: 6,
      search: '',
      status: null,
      departmentId: null,
      teamId: null,
      designationId: null,
      supervisorId: null,
      sortBy: 'name',
      sortDescending: false
    };

    forkJoin({
      employeeCount: this.dashboardService.getEmployeeCount().pipe(
        catchError((err) => {
          console.error('[Dashboard API Error] Employee Count failed:', err);
          return of({ totalEmployees: 0 });
        })
      ),
      departmentCount: this.dashboardService.getDepartmentCount().pipe(
        catchError((err) => {
          console.error('[Dashboard API Error] Department Count failed:', err);
          return of({ totalDepartments: 0 });
        })
      ),
      departments: this.dashboardService.getDepartments().pipe(
        catchError((err) => {
          console.error('[Dashboard API Error] Departments list failed:', err);
          return of([]);
        })
      ),
      teamCount: this.dashboardService.getTeamCount().pipe(
        catchError((err) => {
          console.error('[Dashboard API Error] Team Count failed:', err);
          return of({ totalTeams: 0 });
        })
      ),
      employeeResult: this.dashboardService.searchEmployees(empRequest).pipe(
        catchError((err) => {
          console.error('[Dashboard API Error] Employees search failed:', err);
          this.employeesError.set('Failed to load workforce directory.');
          return of({ employees: [], totalRecords: 0, page: 1, pageSize: 6, totalPages: 0 });
        })
      ),
      pendingLeaves: this.dashboardService.getPendingLeaves().pipe(
        catchError((err) => {
          console.error('[Dashboard API Error] Pending Leaves failed:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (results) => {
        console.log('[Dashboard Ready] All data loaded together:', results);

        // 1. Set KPI Cards
        this.totalEmployees.set(results.employeeCount.totalEmployees);
        this.totalDepartments.set(results.departmentCount.totalDepartments);
        this.departments.set(results.departments);
        this.totalTeams.set(results.teamCount.totalTeams);

        // 2. Set Workforce Directory
        this.employees.set(results.employeeResult.employees || []);
        this.employeesLoading.set(false);

        // 3. Set Pending Leaves
        const leavesList = results.pendingLeaves || [];
        this.pendingLeaves.set(leavesList);
        this.pendingLeaveCount.set(leavesList.length);

        // 4. Mark loading finished & force change detection pass
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (fatalErr) => {
        console.error('[Dashboard Fatal Error]', fatalErr);
        this.isLoading.set(false);
        this.employeesLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  // Safe helper to extract initials
  getInitials(name?: string): string {
    if (!name || !name.trim()) return '??';
    return name
      .trim()
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}

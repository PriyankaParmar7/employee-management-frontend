import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, Department, Employee, EmployeeSearchRequest, PendingLeave } from './dashboard.service';
import { DatePipe, DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})


export class Dashboard implements OnInit {

  totalEmployees = signal(0);
  totalDepartments = signal(0);
  totalTeams = signal(0);
  pendingLeaveCount = signal(0);
  departments = signal<Department[]>([]);
  employees: Employee[] = [];
  employeesLoading = false;
  employeesError = '';
  pendingLeaves: PendingLeave[] = [];

  loadEmployees(): void {
    this.employeesLoading = true;
    this.employeesError = '';

    const request: EmployeeSearchRequest = {
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

    this.dashboardService.searchEmployees(request).subscribe({
      next: (response) => {
        this.employees = response.employees;
        this.employeesLoading = false;
      },
      error: (error) => {
        console.error('Failed to load employees:', error);
        this.employeesError = 'Unable to load employees.';
        this.employeesLoading = false;
      }
    });
  }

 loadPendingLeaves(): void {
  console.log('Loading pending leaves...');

  this.dashboardService.getPendingLeaves().subscribe({
  next: (leaves) => {
  this.pendingLeaves = leaves;

  console.log('pendingLeaves:', this.pendingLeaves);
  console.log('pendingLeaves length:', this.pendingLeaves.length);
},
    error: (error) => {
      console.error('Failed to load pending leaves:', error);
      this.pendingLeaves = [];
    }
  });
}

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getEmployeeCount().subscribe({
      next: (response) => {
        this.totalEmployees.set(response.totalEmployees);
        console.log('Employee count loaded:', response.totalEmployees);
      },
      error: (error) => {
        console.error('Failed to fetch employee count:', error);
      }
    });

    this.dashboardService.getDepartmentCount().subscribe({
      next: (response) => {
        this.totalDepartments.set(response.totalDepartments);
        console.log('Department count loaded:', response.totalDepartments);
      },
      error: (error) => {
        console.error('Failed to fetch department count:', error);
      }
    });

    this.dashboardService.getTeamCount().subscribe({
      next: (response) => {
        this.totalTeams.set(response.totalTeams);
        console.log('Team count loaded:', response.totalTeams);
      },
      error: (error) => {
        console.error('Failed to fetch team count:', error);
      }
    });

    this.dashboardService.getPendingLeaves().subscribe({
      next: (response) => {
        this.pendingLeaveCount.set(response.length);
        console.log('Pending leave count:', response.length);
      },
      error: (error) => {
        console.error('Failed to fetch pending leaves:', error);
      }
    });

    this.dashboardService.getDepartments().subscribe({
      next: (response) => {
        this.departments.set(response);
        console.log('Departments loaded:', response);
      },
      error: (error) => {
        console.error('Failed to fetch departments:', error);
      }
    });

    this.loadEmployees();
    this.loadPendingLeaves();


  }
}
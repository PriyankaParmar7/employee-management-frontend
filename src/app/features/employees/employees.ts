import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  Signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DashboardService,
  Employee,
  EmployeeSearchRequest,
  Department,
  Team,
  Designation
} from '../dashboard/dashboard.service';

import { CreateEmployeeModalComponent } from './create-employee-modal/create-employee-modal';
import { EditEmployeeModelComponent } from './edit-employee-model/edit-employee-model';

@Component({
  selector: 'app-employees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CreateEmployeeModalComponent, EditEmployeeModelComponent],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {

  // -------------------------------------------------------
  // Data arrays
  // -------------------------------------------------------
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  teams = signal<Team[]>([]);
  designations = signal<Designation[]>([]);

  // -------------------------------------------------------
  // UI state
  // -------------------------------------------------------
  loading = signal(false);
  errorMessage = signal('');
  searchText = ''; //keep as plain text as it is used with [(ngModel)]

  selectedDepartmentId = signal<number | null>(null);
  selectedTeamId = signal<number | null>(null);
  selectedDesignationId = signal<number | null>(null);
  selectedStatus = signal<string | null>(null);
  isCreateEmployeeModalOpen = signal(false);
  isEditEmployeeModelOpen = signal(false);
  selectedEmployeeToEdit = signal<Employee | null>(null);


  // -------------------------------------------------------
  // Constructor
  // -------------------------------------------------------
  constructor(
    private dashboardService: DashboardService) { }

  // -------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------
  ngOnInit(): void {
    this.loadDepartments();
    this.loadTeams();
    this.loadDesignations();
    this.searchEmployees();
  }

  // -------------------------------------------------------
  // Load filter dropdowns
  // -------------------------------------------------------

  loadDepartments(): void {
    this.dashboardService.getDepartments().subscribe({
      next: (response) => {
        this.departments.set(response);
      },

      error: (err: unknown) => {
        console.error('Failed to load departments:', err);
        this.errorMessage.set('Unable to load departments.');
      }
    });
  }

  loadTeams(): void {
    this.dashboardService.getTeams().subscribe({
      next: (response) => {
        this.teams.set(response.filter(team => team.isActive));

      },
      error: (err: unknown) => {
        console.error('Failed to load teams:', err);
        this.teams.set([]);

      }
    });
  }

  loadTeamsByDepartment(departmentId: number): void {
    this.teams.set([]);
    this.dashboardService.getTeamsByDepartment(departmentId).subscribe({
      next: (response) => {
        this.teams.set(response.filter(team => team.isActive));

      },
      error: (err: unknown) => {
        console.error('Failed to load department teams:', err);
        this.teams.set([]);

      }
    });
  }

  loadDesignations(): void {
    this.dashboardService.getDesignations().subscribe({
      next: (response) => {
        this.designations.set(response.filter(d => d.isActive));

      },
      error: (err: unknown) => {
        console.error('Failed to load designations:', err);
        this.errorMessage.set('Unable to load designations.');

      }
    });
  }

  // -------------------------------------------------------
  // Filter handlers
  // -------------------------------------------------------

  onDepartmentChange(departmentId: number | null): void {
    this.selectedDepartmentId.set(departmentId);
    this.selectedTeamId.set(null);

    if (departmentId !== null) {
      this.loadTeamsByDepartment(departmentId);
    } else {
      this.loadTeams();
    }

    this.searchEmployees();
  }

  loadEmployees(): void {
    this.searchEmployees();
  }

  // -------------------------------------------------------
  // Main search / fetch
  // -------------------------------------------------------

  searchEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const request: EmployeeSearchRequest = {
      page: 1,
      pageSize: 50,
      search: this.searchText.trim(),
      status: this.selectedStatus(),
      departmentId: this.selectedDepartmentId(),
      teamId: this.selectedTeamId(),
      designationId: this.selectedDesignationId(),
      supervisorId: null,
      sortBy: 'name',
      sortDescending: false
    };

    this.dashboardService.searchEmployees(request).subscribe({
      next: (response) => {
        this.employees.set(response.employees);
        this.loading.set(false);

      },
      error: (err: unknown) => {
        console.error('Failed to search employees:', err);
        this.errorMessage.set('Unable to load employees.');
        this.loading.set(false);

      }
    });
  }

  // -------------------------------------------------------
  // Modal handlers
  // -------------------------------------------------------

  openCreateModal(): void {
    this.isCreateEmployeeModalOpen.set(true);

  }

  onEmployeeCreated(): void {
    this.isCreateEmployeeModalOpen.set(false);

  }

  onModalClose(): void {
    this.isCreateEmployeeModalOpen.set(false);

  }

  // -------------------------------------------------------
  // Action: View Employee
  // -------------------------------------------------------

  onView(employee: Employee): void {
    alert(
      `Employee Details:\n` +
      `Name: ${employee.name}\n` +
      `Email: ${employee.email}\n` +
      `Department: ${employee.department || 'N/A'}\n` +
      `Team: ${employee.team || 'N/A'}\n` +
      `Designation: ${employee.designation || 'N/A'}\n` +
      `Supervisor: ${employee.supervisor || 'None'}\n` +
      `Status: ${employee.isActive ? 'Active' : 'Inactive'}`
    );
  }

  // -------------------------------------------------------
  // Action: Edit Employee (placeholder — modal coming soon)
  // -------------------------------------------------------

  onEdit(employee: Employee): void {
    this.selectedEmployeeToEdit.set(employee);
    this.isEditEmployeeModelOpen.set(true);

  }

  onEmployeeUpdated(): void {
    this.isEditEmployeeModelOpen.set(false);
    this.selectedEmployeeToEdit.set(null);
    this.searchEmployees(); // Table auto refresh
  }

  // -------------------------------------------------------
  // Action: Toggle Active / Inactive status
  // -------------------------------------------------------

  toggleStatus(employee: Employee): void {
    const newStatus = !employee.isActive;
    const label = newStatus ? 'activate' : 'deactivate';

    const confirmed = confirm(
      `Are you sure you want to ${label} ${employee.name}?`
    );
    if (!confirmed) return;

    this.dashboardService.updateEmployeeStatus(employee.id, newStatus).subscribe({
      next: () => {
        employee.isActive = newStatus;
      },

      error: (err: unknown) => {
        console.error('Failed to update employee status:', err);
        alert('Failed to update employee status. Please try again.');
      }
    });
  }

  // -------------------------------------------------------
  // Action: Delete Employee
  // -------------------------------------------------------

  onDelete(employee: Employee): void {
    const confirmed = confirm(
      `Are you sure you want to permanently delete ${employee.name}?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    this.dashboardService.deleteEmployee(employee.id).subscribe({
      next: () => {
        // Remove from local list immediately (no reload needed)
        this.employees.set(this.employees().filter(e => e.id !== employee.id));

        alert(`${employee.name} has been deleted successfully.`);
      },
      error: (err: unknown) => {
        console.error('Failed to delete employee:', err);
        alert('Failed to delete employee. The employee may not exist or you may not have permission.');
      }
    });
  }



}

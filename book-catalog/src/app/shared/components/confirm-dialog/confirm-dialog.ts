import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titel: string;
  mensagem: string;
  botaoCancelar?: string;
  botaoConfirmar?: string;
  isDangerous?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.titel }}</h2>
    <mat-dialog-content>
      <p>{{ data.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">
        {{ data.botaoCancelar || 'Cancelar' }}
      </button>
      <button
        mat-raised-button
        [color]="data.isDangerous ? 'warn' : 'primary'"
        (click)="confirmar()"
      >
        {{ data.botaoConfirmar || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        padding: 16px 24px;
        min-width: 320px;
      }

      p {
        margin: 0;
        color: #666;
      }
    `,
  ],
})
export class ConfirmDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  readonly data = inject(MAT_DIALOG_DATA);

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthYear',
  standalone: true
})
export class MonthYearPipe implements PipeTransform {
  private months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  transform(value: { month: string; year: string } | null): string {
    if (!value) return '';
    const monthIndex = parseInt(value.month) - 1;
    return `${this.months[monthIndex]} ${value.year}`;
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ObdFault, ObdScanResult } from '../../domain/obd-fault.model';

/**
 * Simulated OBD-II scanner adapter.
 *
 * This mimics connecting to a vehicle's diagnostic port and reading its fault
 * codes. It exists to demo the workflow (scan -> detected faults -> suggested
 * tasks) ahead of a real IoT/hardware integration (e.g. WebSerial/WebUSB or a
 * companion device streaming to the backend). Swapping in a real scanner
 * later only means replacing this service's implementation -- the rest of
 * the app talks to it through the same scan() contract.
 */
@Injectable({ providedIn: 'root' })
export class ObdScannerService {
  private readonly faultPool: ObdFault[] = [
    {
      code: 'P0301',
      title: 'Fallo de encendido - Cilindro 1',
      description: 'Se detectan fallos de combustión intermitentes en el cilindro 1. Posible bujía o bobina defectuosa.',
      severity: 'HIGH',
      suggestedEstimatedTime: 1.5,
      suggestedLaborPrice: 80,
    },
    {
      code: 'P0420',
      title: 'Eficiencia del catalizador baja',
      description: 'El convertidor catalítico no alcanza el umbral de eficiencia esperado en el banco 1.',
      severity: 'MEDIUM',
      suggestedEstimatedTime: 2,
      suggestedLaborPrice: 120,
    },
    {
      code: 'P0171',
      title: 'Sistema demasiado pobre - Banco 1',
      description: 'Mezcla aire-combustible con exceso de aire. Revisar sensor MAF y posibles fugas de vacío.',
      severity: 'MEDIUM',
      suggestedEstimatedTime: 1,
      suggestedLaborPrice: 60,
    },
    {
      code: 'P0128',
      title: 'Termostato de refrigerante bajo',
      description: 'El motor tarda más de lo esperado en alcanzar temperatura de operación. Revisar termostato.',
      severity: 'LOW',
      suggestedEstimatedTime: 1,
      suggestedLaborPrice: 50,
    },
    {
      code: 'P0442',
      title: 'Fuga pequeña en sistema EVAP',
      description: 'Se detecta una fuga menor en el sistema de control de emisiones evaporativas.',
      severity: 'LOW',
      suggestedEstimatedTime: 0.5,
      suggestedLaborPrice: 40,
    },
    {
      code: 'P0300',
      title: 'Fallo de encendido aleatorio/múltiple',
      description: 'Fallos de combustión detectados en múltiples cilindros sin patrón definido.',
      severity: 'HIGH',
      suggestedEstimatedTime: 2,
      suggestedLaborPrice: 100,
    },
    {
      code: 'P0455',
      title: 'Fuga grande en sistema EVAP',
      description: 'Fuga significativa detectada, posible tapa de combustible floja o manguera dañada.',
      severity: 'MEDIUM',
      suggestedEstimatedTime: 0.5,
      suggestedLaborPrice: 30,
    },
    {
      code: 'P0507',
      title: 'RPM de ralentí más alto de lo esperado',
      description: 'El sistema de control de marcha mínima reporta revoluciones por encima del rango normal.',
      severity: 'LOW',
      suggestedEstimatedTime: 1,
      suggestedLaborPrice: 45,
    },
  ];

  /** Simulates plugging in a scanner and reading the vehicle's fault codes. */
  scan(vin?: string): Observable<ObdScanResult> {
    const faultCount = 1 + Math.floor(Math.random() * 3); // 1 to 3 faults
    const shuffled = [...this.faultPool].sort(() => Math.random() - 0.5);
    const faults = shuffled.slice(0, faultCount);

    const result: ObdScanResult = {
      vin: vin || 'N/D',
      scannedAt: new Date(),
      faults,
    };

    return of(result).pipe(delay(2200));
  }
}

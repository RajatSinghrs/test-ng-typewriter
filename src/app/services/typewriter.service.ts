import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TypewriterOptions, TypewriterInstance, TestResult } from '../types/typewriter.interface';

@Injectable({
  providedIn: 'root'
})
export class TypewriterService {
  private instances = new Map<string, TypewriterInstance>();
  private runningStates = new Map<string, BehaviorSubject<boolean>>();
  private errors = new Map<string, BehaviorSubject<string | null>>();

  constructor() {}

  async createInstance(elementId: string, options: TypewriterOptions): Promise<TypewriterInstance | null> {
    try {
      // Dynamic import of the typewriter package
      const { Typewriter } = await import('typewriter-text-effect');
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`);
      }

      const instance = new Typewriter(element, options) as unknown as TypewriterInstance;
      
      // Store instance and create observables
      this.instances.set(elementId, instance);
      this.runningStates.set(elementId, new BehaviorSubject<boolean>(false));
      this.errors.set(elementId, new BehaviorSubject<string | null>(null));

      // Start monitoring running state
      this.monitorInstance(elementId);

      return instance;
    } catch (error) {
      console.error('Failed to create typewriter instance:', error);
      this.setError(elementId, error instanceof Error ? error.message : 'Failed to create instance');
      return null;
    }
  }

  private monitorInstance(elementId: string): void {
    const instance = this.instances.get(elementId);
    const runningState = this.runningStates.get(elementId);
    
    if (instance && runningState) {
      const checkRunningState = () => {
        try {
          const isRunning = instance.isRunning();
          runningState.next(isRunning);
          
          if (isRunning) {
            setTimeout(checkRunningState, 100);
          }
        } catch (error) {
          runningState.next(false);
          console.error('Error checking running state:', error);
        }
      };
      
      checkRunningState();
    }
  }

  getInstance(elementId: string): TypewriterInstance | undefined {
    return this.instances.get(elementId);
  }

  getRunningState(elementId: string): Observable<boolean> {
    if (!this.runningStates.has(elementId)) {
      this.runningStates.set(elementId, new BehaviorSubject<boolean>(false));
    }
    return this.runningStates.get(elementId)!.asObservable();
  }

  getError(elementId: string): Observable<string | null> {
    if (!this.errors.has(elementId)) {
      this.errors.set(elementId, new BehaviorSubject<string | null>(null));
    }
    return this.errors.get(elementId)!.asObservable();
  }

  private setError(elementId: string, error: string | null): void {
    if (!this.errors.has(elementId)) {
      this.errors.set(elementId, new BehaviorSubject<string | null>(null));
    }
    this.errors.get(elementId)!.next(error);
  }

  callMethod(elementId: string, methodName: string, ...args: any[]): any {
    const instance = this.getInstance(elementId);
    if (!instance) {
      throw new Error('Instance not available');
    }

    try {
      const method = (instance as any)[methodName];
      if (typeof method !== 'function') {
        throw new Error(`Method ${methodName} not found`);
      }

      const result = method.apply(instance, args);
      
      // Restart monitoring if method was called
      if (['start', 'resume'].includes(methodName)) {
        this.monitorInstance(elementId);
      }
      
      return result;
    } catch (error) {
      console.error(`Error calling method ${methodName}:`, error);
      throw error;
    }
  }

  destroyInstance(elementId: string): void {
    const instance = this.instances.get(elementId);
    if (instance) {
      try {
        instance.destroy();
      } catch (error) {
        console.error('Error destroying instance:', error);
      }
      
      this.instances.delete(elementId);
      this.runningStates.delete(elementId);
      this.errors.delete(elementId);
    }
  }

  destroyAllInstances(): void {
    for (const elementId of this.instances.keys()) {
      this.destroyInstance(elementId);
    }
  }

  createTestResult(name: string, passed: boolean, error?: string): TestResult {
    return {
      name,
      passed,
      error,
      timestamp: new Date()
    };
  }
}
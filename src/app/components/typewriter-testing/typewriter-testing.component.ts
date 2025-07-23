import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TypewriterService } from '../../services/typewriter.service';
import { TestResults, LogEntry, PerformanceMetrics } from '../../types/typewriter.interface';

@Component({
  selector: 'app-typewriter-testing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './typewriter-testing.component.html',
  styleUrl: './typewriter-testing.component.scss'
})
export class TypewriterTestingComponent implements OnInit, OnDestroy {
  // Test results
  testResults: TestResults = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };

  // Observable states for different test instances
  basic1Running$: Observable<boolean>;
  basic1Error$: Observable<string | null>;
  basic2Running$: Observable<boolean>;
  basic2Error$: Observable<string | null>;

  // Method testing
  methodLogs: LogEntry[] = [];
  logCounter = 0;
  lastMethod = 'None';
  lastReturn = '—';
  lastTimestamp = '—';

  // Performance testing
  performanceMetrics: PerformanceMetrics = {
    expectedSpeed: 100,
    actualSpeed: 0,
    accuracy: 0,
    startTime: 0,
    charCount: 0
  };
  performanceRunning = false;

  // Speed settings
  typingSpeed = 100;
  deleteSpeed = 50;

  // Memory testing
  memoryStats = {
    activeInstances: 0,
    eventListeners: 0,
    timers: 0,
    memoryStatus: 'Clean',
    lastCheck: '—'
  };

  // Available methods for testing
  methods = [
    { name: 'start', icon: 'fas fa-play', color: 'btn-success' },
    { name: 'pause', icon: 'fas fa-pause', color: 'btn-warning' },
    { name: 'resume', icon: 'fas fa-play', color: 'btn-info' },
    { name: 'stop', icon: 'fas fa-stop', color: 'btn-danger' },
    { name: 'reset', icon: 'fas fa-redo', color: 'btn-secondary' },
    { name: 'updateText', icon: 'fas fa-edit', color: 'btn-primary' },
    { name: 'isRunning', icon: 'fas fa-question', color: 'btn-info' },
    { name: 'destroy', icon: 'fas fa-trash', color: 'btn-dark' }
  ];

  constructor(private typewriterService: TypewriterService) {
    this.basic1Running$ = this.typewriterService.getRunningState('basic-1');
    this.basic1Error$ = this.typewriterService.getError('basic-1');
    this.basic2Running$ = this.typewriterService.getRunningState('basic-2');
    this.basic2Error$ = this.typewriterService.getError('basic-2');
  }

  async ngOnInit() {
    // Initialize basic test instances
    await this.initializeInstances();
  }

  ngOnDestroy() {
    // Cleanup all instances
    this.typewriterService.destroyAllInstances();
  }

  async initializeInstances() {
    try {
      // Basic test 1 - Default configuration
      await this.typewriterService.createInstance('basic-1', {
        text: ['Hello World!', 'Testing TypeScript', 'Package functionality'],
        autoStart: false
      });

      // Basic test 2 - Fast speed
      await this.typewriterService.createInstance('basic-2', {
        text: ['Fast typing test!', 'Speed: 50ms', 'Delete: 25ms'],
        speed: 50,
        deleteSpeed: 25,
        autoStart: false
      });

      // Method testing instance
      await this.typewriterService.createInstance('methods-test', {
        text: ['Method testing', 'Interactive controls', 'All 8 methods'],
        autoStart: false
      });

      console.log('All typewriter instances initialized');
    } catch (error) {
      console.error('Error initializing instances:', error);
    }
  }

  // Basic test methods
  handleBasicTest(testId: string, action: string) {
    try {
      this.typewriterService.callMethod(testId, action);
      this.addTestResult(`${testId}-${action}`, true);
    } catch (error) {
      this.addTestResult(`${testId}-${action}`, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Method testing
  async handleMethodCall(methodName: string) {
    try {
      let result: any;
      
      if (methodName === 'updateText') {
        result = this.typewriterService.callMethod('methods-test', methodName, 
          ['Updated text 1', 'Updated text 2', 'Method test complete']);
      } else {
        result = this.typewriterService.callMethod('methods-test', methodName);
      }

      const displayResult = typeof result === 'boolean' ? result.toString() : 
                           result === this.typewriterService.getInstance('methods-test') ? 'TypewriterInstance' : 
                           result || 'void';

      this.lastMethod = methodName;
      this.lastReturn = displayResult;
      this.lastTimestamp = new Date().toLocaleTimeString();

      this.addLog(methodName, displayResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.lastReturn = `Error: ${errorMessage}`;
      this.lastTimestamp = new Date().toLocaleTimeString();
      this.addLog(methodName, `Error: ${errorMessage}`);
    }
  }

  addLog(method: string, result: string) {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      result,
      id: this.logCounter++
    };
    this.methodLogs.push(newLog);
    
    // Keep only last 50 logs
    if (this.methodLogs.length > 50) {
      this.methodLogs = this.methodLogs.slice(-50);
    }
  }

  clearLog() {
    this.methodLogs = [];
    this.logCounter = 0;
  }

  // Performance testing
  async runPerformanceTest() {
    if (this.performanceRunning) return;

    this.performanceRunning = true;
    this.performanceMetrics = {
      ...this.performanceMetrics,
      startTime: performance.now(),
      charCount: 0,
      actualSpeed: 0,
      accuracy: 0
    };

    try {
      await this.typewriterService.createInstance('performance-test', {
        text: ['Performance test string for timing accuracy measurement'],
        speed: this.performanceMetrics.expectedSpeed,
        autoStart: false,
        loop: false,
        onComplete: () => {
          this.performanceRunning = false;
          this.calculateAccuracy();
        }
      });

      this.typewriterService.callMethod('performance-test', 'start');
    } catch (error) {
      console.error('Performance test error:', error);
      this.performanceRunning = false;
    }
  }

  calculateAccuracy() {
    if (this.performanceMetrics.charCount > 0) {
      const actualSpeed = (performance.now() - this.performanceMetrics.startTime) / this.performanceMetrics.charCount;
      const accuracy = Math.min(100, (this.performanceMetrics.expectedSpeed / actualSpeed) * 100);
      
      this.performanceMetrics = {
        ...this.performanceMetrics,
        actualSpeed,
        accuracy
      };
    }
  }

  // Memory testing
  async createTestInstances() {
    try {
      for (let i = 0; i < 5; i++) {
        const elementId = `memory-test-${i}`;
        const div = document.createElement('div');
        div.id = elementId;
        div.style.display = 'none';
        document.body.appendChild(div);

        await this.typewriterService.createInstance(elementId, {
          text: [`Instance ${i + 1}`],
          autoStart: true
        });
      }

      this.memoryStats.activeInstances += 5;
      this.memoryStats.eventListeners = this.memoryStats.activeInstances * 2;
      this.memoryStats.timers = this.memoryStats.activeInstances;
      this.memoryStats.memoryStatus = 'Active Instances';
      this.memoryStats.lastCheck = new Date().toLocaleTimeString();
    } catch (error) {
      console.error('Error creating test instances:', error);
    }
  }

  destroyTestInstances() {
    for (let i = 0; i < 5; i++) {
      const elementId = `memory-test-${i}`;
      this.typewriterService.destroyInstance(elementId);
      
      const element = document.getElementById(elementId);
      if (element) {
        document.body.removeChild(element);
      }
    }

    this.memoryStats.activeInstances = Math.max(0, this.memoryStats.activeInstances - 5);
    this.memoryStats.eventListeners = this.memoryStats.activeInstances * 2;
    this.memoryStats.timers = this.memoryStats.activeInstances;
    this.memoryStats.memoryStatus = this.memoryStats.activeInstances === 0 ? 'Clean' : 'Active Instances';
    this.memoryStats.lastCheck = new Date().toLocaleTimeString();
  }

  checkMemoryLeaks() {
    const status = this.memoryStats.activeInstances === 0 ? 'Clean' : 'Potential Leaks';
    this.memoryStats.memoryStatus = status;
    this.memoryStats.lastCheck = new Date().toLocaleTimeString();
  }

  // Test helper methods
  addTestResult(name: string, passed: boolean, error?: string) {
    const result = this.typewriterService.createTestResult(name, passed, error);
    
    this.testResults.tests.push(result);
    this.testResults.total++;
    
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
  }

  async runAllTests() {
    this.resetTestResults();
    
    // Run a series of automated tests
    const tests = [
      () => this.handleBasicTest('basic-1', 'start'),
      () => this.handleBasicTest('basic-2', 'start'),
      () => this.handleMethodCall('start'),
      () => this.handleMethodCall('pause'),
      () => this.handleMethodCall('resume'),
      () => this.handleMethodCall('stop'),
      () => this.handleMethodCall('reset'),
      () => this.handleMethodCall('isRunning')
    ];

    for (let i = 0; i < tests.length; i++) {
      setTimeout(tests[i], i * 500);
    }
  }

  resetAllTests() {
    try {
      // Reset all instances
      ['basic-1', 'basic-2', 'methods-test'].forEach(id => {
        try {
          this.typewriterService.callMethod(id, 'reset');
        } catch (error) {
          console.error(`Error resetting ${id}:`, error);
        }
      });

      this.resetTestResults();
    } catch (error) {
      console.error('Error resetting tests:', error);
    }
  }

  resetTestResults() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };
  }

  exportResults() {
    const results = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      package: 'typewriter-text-effect',
      version: '2.0.0',
      coverage: this.testResults.total > 0 ? Math.round((this.testResults.passed / this.testResults.total) * 100) : 0,
      methodLogs: this.methodLogs
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typewriter-test-results-angular.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Utility methods
  getStatusClass(isRunning: boolean): string {
    return isRunning ? 'status-running' : 'status-idle';
  }

  getCoveragePercentage(): number {
    return this.testResults.total > 0 ? Math.round((this.testResults.passed / this.testResults.total) * 100) : 0;
  }
  getPerformanceWidth(): number {
  const actual = this.performanceMetrics.actualSpeed;
  const expected = this.performanceMetrics.expectedSpeed;

  if (actual > 0 && expected > 0) {
    return Math.min(100, (actual / expected) * 100);
  }
  return 0;
}
}
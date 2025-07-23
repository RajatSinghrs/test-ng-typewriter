export interface TypewriterOptions {
  text: string[];
  speed?: number;
  deleteSpeed?: number;
  delayBetween?: number;
  pauseBetweenLoops?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  startDelay?: number;
  pauseOnHover?: boolean;
  randomSpeed?: boolean;
  autoStart?: boolean;
  textStyleClass?: string;
  onComplete?: () => void;
}

export interface TypewriterInstance {
  start(): TypewriterInstance;
  pause(): TypewriterInstance;
  resume(): TypewriterInstance;
  stop(): TypewriterInstance;
  reset(): TypewriterInstance;
  updateText(texts: string[]): TypewriterInstance;
  isRunning(): boolean;
  destroy(): TypewriterInstance;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  timestamp: Date;
}

export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  tests: TestResult[];
}

export interface PerformanceMetrics {
  expectedSpeed: number;
  actualSpeed: number;
  accuracy: number;
  startTime: number;
  charCount: number;
}

export interface LogEntry {
  timestamp: string;
  method: string;
  result: string;
  id: number;
}
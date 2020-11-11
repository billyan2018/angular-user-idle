import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';
import { UserIdleService } from '../user-idle/user-idle.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit {
  @Output() readonly changeIdleValues = new EventEmitter();
  timeout: number;
  isTimerRunning = false;

  constructor(
    private readonly userIdle: UserIdleService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.timeout = 10;
    this.changeIdleValues.emit({
      timeout: this.timeout
    });
    this.userIdle.timeout$.asObservable().subscribe(timeout => {
      this.isTimerRunning = !timeout;
      this.changeDetector.detectChanges();
      console.log('time out detected');
    });
  }

  onStartWatching() {
    this.isTimerRunning = true;
    // Start watching for user inactivity.
    this.userIdle.startWatching(this.timeout);
  }

  onTimeoutKeyup() {
    this.changeIdleValues.emit({ timeout: this.timeout });
  }
}

import { Injectable, NgZone } from '@angular/core';
import {
  fromEvent,
  interval,
  merge,
  Observable,
  Subject,
  Subscription
} from 'rxjs';

/**
 * User's idle service.
 */
@Injectable({
  providedIn: 'root'
})
export class UserIdleService {
  /**
   * Events that can interrupts user's inactivity timer.
   */
  private activityEvents$: Observable<any>;

  readonly timeout$ = new Subject<boolean>();

  private timer$: Subscription;

  private idleTime = 0;

  /**
   * Timeout value in seconds.
   * Default equals to 5 minutes.
   */
  private timeoutInSec = 30;

  /**
   * Timeout status.
   */
  private isTimeout: boolean;

  private idleSubscription: Subscription;

  constructor(private _ngZone: NgZone) {}

  /**
   * Start watching for user idle and setup timer and ping.
   */
  startWatching(timeout: number) {
    this.timeoutInSec = timeout;
    if (!this.activityEvents$) {
      this.activityEvents$ = merge(
        // fromEvent(window, 'mousemove'),
        fromEvent(window, 'resize'),
        fromEvent(document, 'click'),
        fromEvent(document, 'keydown')
      );
    }

    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    // If any of user events is not active for idle-seconds when start timer.
    this.idleSubscription = this.activityEvents$.subscribe((e: any) => {
      console.log('user activity...' + e);
      this.idleTime = 0;
    });
    this.setupTimer();
  }

  stopWatching() {
    this.stopTimer();
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }

  stopTimer() {
    this.timer$.unsubscribe();
  }

  resetTimer() {
    this.stopTimer();
    this.isTimeout = false;
  }

  /**
   * Set custom activity events
   *
   * @param customEvents Example: merge(
   *   fromEvent(window, 'mousemove'),
   *   fromEvent(window, 'resize'),
   *   fromEvent(document, 'keydown'),
   *   fromEvent(document, 'touchstart'),
   *   fromEvent(document, 'touchend')
   * )
   */
  setCustomActivityEvents(customEvents: Observable<any>) {
    if (this.idleSubscription && !this.idleSubscription.closed) {
      console.error('Call stopWatching() before set custom activity events');
      return;
    }
    this.activityEvents$ = customEvents;
  }

  private setupTimer() {
    this._ngZone.runOutsideAngular(() => {
      this.timer$ = interval(1000).subscribe(() => {
        this.idleTime++;
        console.log('------------' + this.idleTime + ':' + this.timeoutInSec);
        if (this.idleTime >= this.timeoutInSec) {
          this.isTimeout = true;
          console.log('timeout------------');
          this.timeout$.next(true);
          this.stopTimer();
          this.stopWatching();
        }
      });
    });
  }
}

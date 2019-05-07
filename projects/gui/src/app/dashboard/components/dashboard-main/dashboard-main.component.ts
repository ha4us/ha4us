import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { ObjectService, SettingsService } from '@ha4us/ng';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { PARAMETERS } from '@angular/core/src/util/decorators';
import { MatTabChangeEvent } from '@angular/material';
import { Subscription } from 'rxjs';
@Component({
  selector: 'ha4us-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMainComponent implements OnInit, OnDestroy {
  activeTag: number;

  tags$ = this.settings.observe<string[]>('user.dashboard.tags');
  taggedObjects$ = this.tags$.pipe(
    map(tags => {
      return tags.map(tag => ({
        tag,
        object$: this.os
          .observeRole(/^Device/i)
          .pipe(
            map(objects =>
              objects.filter(
                obj => obj.tags && obj.tags.indexOf(tag) > -1 && !obj.hidden
              )
            )
          ),
      }));
    })
  );

  activeTag$ = this.route.paramMap.pipe(
    withLatestFrom(this.tags$),
    map(([params, tags]) => tags.findIndex(tag => tag === params.get('tag')))
  );

  sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    protected os: ObjectService,
    protected settings: SettingsService
  ) {}

  ngOnInit() {
    this.sub = this.activeTag$.subscribe(tag => (this.activeTag = tag));
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  tabchanged($event: MatTabChangeEvent) {
    this.router.navigate(['..', $event.tab.textLabel], {
      relativeTo: this.route,
    });
  }
}

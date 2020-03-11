import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { EPerson } from '../core/eperson/models/eperson.model';
import { select, Store } from '@ngrx/store';
import { getAuthenticatedUser } from '../core/auth/selectors';
import { AppState } from '../app.reducer';
import { ProfilePageMetadataFormComponent } from './profile-page-metadata-form/profile-page-metadata-form.component';
import { ProfilePageSecurityFormComponent } from './profile-page-security-form/profile-page-security-form.component';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../core/eperson/models/group.model';
import { RemoteData } from '../core/data/remote-data';
import { PaginatedList } from '../core/data/paginated-list';
import { filter, switchMap, tap } from 'rxjs/operators';
import { EPersonDataService } from '../core/eperson/eperson-data.service';
import { getAllSucceededRemoteData, getRemoteDataPayload, getSucceededRemoteData } from '../core/shared/operators';
import { hasValue } from '../shared/empty.util';
import { followLink } from '../shared/utils/follow-link-config.model';

@Component({
  selector: 'ds-profile-page',
  templateUrl: './profile-page.component.html'
})
/**
 * Component for a user to edit their profile information
 */
export class ProfilePageComponent implements OnInit {

  @ViewChild(ProfilePageMetadataFormComponent, { static: false }) metadataForm: ProfilePageMetadataFormComponent;

  @ViewChild(ProfilePageSecurityFormComponent, { static: false }) securityForm: ProfilePageSecurityFormComponent;

  /**
   * The authenticated user
   */
  user$: Observable<EPerson>;

  /**
   * The groups the user belongs to
   */
  groupsRD$: Observable<RemoteData<PaginatedList<Group>>>;

  NOTIFICATIONS_PREFIX = 'profile.notifications.';

  constructor(private store: Store<AppState>,
              private notificationsService: NotificationsService,
              private translate: TranslateService,
              private epersonService: EPersonDataService) {
  }

  ngOnInit(): void {
    this.user$ = this.store.pipe(
      select(getAuthenticatedUser),
      filter((user: EPerson) => hasValue(user.id)),
      switchMap((user: EPerson) => this.epersonService.findById(user.id, followLink('groups'))),
      getAllSucceededRemoteData(),
      getRemoteDataPayload()
    );
    this.groupsRD$ = this.user$.pipe(switchMap((user: EPerson) => user.groups));
  }

  updateProfile() {
    const metadataChanged = this.metadataForm.updateProfile();
    const securityChanged = this.securityForm.updateSecurity();
    if (!metadataChanged && !securityChanged) {
      this.notificationsService.warning(
        this.translate.instant(this.NOTIFICATIONS_PREFIX + 'warning.no-changes.title'),
        this.translate.instant(this.NOTIFICATIONS_PREFIX + 'warning.no-changes.content')
      );
    }
  }
}

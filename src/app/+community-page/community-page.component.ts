import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { CommunityDataService } from '../core/data/community-data.service';
import { RemoteData } from '../core/data/remote-data';
import { Bitstream } from '../core/shared/bitstream.model';

import { Community } from '../core/shared/community.model';

import { MetadataService } from '../core/metadata/metadata.service';

import { fadeInOut } from '../shared/animations/fade';
import { hasValue } from '../shared/empty.util';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'ds-community-page',
  styleUrls: ['./community-page.component.scss'],
  templateUrl: './community-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class CommunityPageComponent implements OnInit, OnDestroy {
  communityRD$: Observable<RemoteData<Community>>;
  logoRD$: Observable<RemoteData<Bitstream>>;
  private subs: Subscription[] = [];

  constructor(
    private communityDataService: CommunityDataService,
    private metadata: MetadataService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.communityRD$ = this.route.data.map((data) => data.community);
    this.logoRD$ = this.communityRD$
      .map((rd: RemoteData<Community>) => rd.payload)
      .filter((community: Community) => hasValue(community))
      .flatMap((community: Community) => community.logo);
  }

  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignsAdminComponent } from './campaigns-admin.component';

describe('CampaignsAdminComponent', () => {
  let component: CampaignsAdminComponent;
  let fixture: ComponentFixture<CampaignsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
